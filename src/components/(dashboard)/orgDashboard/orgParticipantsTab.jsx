"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Users, User, Crown, Search, RefreshCw, Loader2, UsersRound, Download,
  FileSpreadsheet, Upload, Database, AlertTriangle, ClipboardList, UserX,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { formatAnswer } from "@/lib/registration-form"

/**
 * Org dashboard → "Participants" tab.
 *
 * Sources:
 *  - "Platform"       – people who joined on the site (solo / team / looking-for-team).
 *  - "Form responses" – answers to the organizer's custom registration form.
 *  - "Sheet CSV"      – the announcement's Google Sheet or an uploaded .csv.
 *
 * Changes in this version
 *  - Realtime: the Platform + Form responses lists refresh automatically when people join,
 *    leave, create teams or submit the form.
 *  - Group members whose team row can't be loaded are no longer silently dropped; they show
 *    in a "Team unavailable" section and are counted.
 *  - "In a team" is counted from real team members (not total − solo − looking).
 *  - Display-name fallback to the email's local part.
 *  - `groupByOrg` (super-admin): dropdown is grouped by organization and CSV exports get an
 *    extra "Organization" column.
 */

// ── CSV helpers ───────────────────────────────────────────────────────────────
function parseCSV(text) {
  const src = text.replace(/^\uFEFF/, "")
  const rows = []
  let row = [], cell = "", inQ = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (inQ) {
      if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i++ } else inQ = false }
      else cell += ch
    } else if (ch === '"') inQ = true
    else if (ch === ",") { row.push(cell); cell = "" }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++
      row.push(cell); rows.push(row); row = []; cell = ""
    } else cell += ch
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row) }
  return rows.filter(r => r.some(c => String(c).trim() !== ""))
}

// Neutralise spreadsheet formulas (=, +, -, @) so exported names can't run as formulas in Excel.
const safeCell = (v) => {
  let s = String(v ?? "")
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
  return `"${s.replace(/"/g, '""')}"`
}
function downloadCsv(filename, rows) {
  const csv  = "\uFEFF" + rows.map(r => r.map(safeCell).join(",")).join("\r\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement("a")
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
const slug = (s) => (s || "participants").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "participants"

// ── Google Sheets URL → CSV URL ───────────────────────────────────────────────
function toCsvUrl(raw) {
  const url = String(raw || "").trim()
  if (!/^https:\/\//i.test(url)) throw new Error("bad url")
  let u
  try { u = new URL(url) } catch { throw new Error("bad url") }
  if (u.hostname !== "docs.google.com") return url

  const gid = u.searchParams.get("gid") || (u.hash.match(/gid=(\d+)/) || [])[1]

  const pub = u.pathname.match(/\/spreadsheets\/d\/e\/([^/]+)/)
  if (pub) {
    const out = new URL(`https://docs.google.com/spreadsheets/d/e/${pub[1]}/pub`)
    out.searchParams.set("output", "csv")
    if (gid) out.searchParams.set("gid", gid)
    out.searchParams.set("single", "true")
    return out.toString()
  }

  const m = u.pathname.match(/\/spreadsheets\/d\/([^/]+)/)
  if (m) {
    const out = new URL(`https://docs.google.com/spreadsheets/d/${m[1]}/gviz/tq`)
    out.searchParams.set("tqx", "out:csv")
    if (gid) out.searchParams.set("gid", gid)
    return out.toString()
  }
  return url
}
const looksLikeHtml = (t) => /^\s*<(!doctype|html|head|body|\?xml)/i.test(t) || /<\/?(html|script|style|body)\b/i.test(t.slice(0, 2000))

// ── Column detection ──────────────────────────────────────────────────────────
const clean = (v) => {
  const s = String(v ?? "").trim()
  return /^[—–-]+$/.test(s) ? "" : s
}
function detectColumns(headers) {
  const H = headers.map(h => String(h).toLowerCase().trim())
  const find = (re, not) => H.findIndex(h => re.test(h) && !(not && not.test(h)))

  let team = find(/resolved/)
  if (team === -1) team = find(/^team( name)?$|^group( name)?$/)
  if (team === -1) team = find(/team|group/, /size|member|mate|count|code|looking|key|status|leader/)

  const email = find(/e-?mail/)

  let name = find(/^(full )?name$|^participant|^student name|^full name/)
  if (name === -1) name = find(/name/, /team|group|school|org|company|project|user|mate/)
  if (name === -1) name = H.findIndex((h, i) => i !== team && i !== email && !/timestamp|time|date/.test(h))

  return {
    name, email, team,
    status: find(/^status$/),
    role:   find(/^role$/),
    dept:   find(/department|course|program|college/),
  }
}

const MAX_SHEET_ROWS_SHOWN = 300

const STATUS_STYLE = (s) => {
  const v = (s || "").toLowerCase()
  if (v === "grouped")        return { color: "#10b981", borderColor: "rgba(16,185,129,0.35)" }
  if (v.includes("looking"))  return { color: "#3b82f6", borderColor: "rgba(59,130,246,0.35)" }
  if (v.includes("forming"))  return { color: "#d97706", borderColor: "rgba(217,119,6,0.4)" }
  if (v.includes("not found"))return { color: "#ef4444", borderColor: "rgba(239,68,68,0.4)" }
  return null
}

const displayName = (name, email) => name || (email ? email.split("@")[0] : "") || "Unnamed participant"

export default function OrgParticipantsTab({ announcements = [], addToast, uiT, groupByOrg = false }) {
  const [selectedId, setSelectedId] = useState(announcements[0]?.id ?? null)
  const [source, setSource]   = useState("platform")   // "platform" | "responses" | "sheet"
  const [people, setPeople]   = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView]       = useState("teams")      // "teams" | "all"
  const [query, setQuery]     = useState("")

  // sheet state
  const [sheet, setSheet]               = useState(null)
  const [map, setMap]                   = useState({ name: -1, email: -1, team: -1, status: -1, role: -1, dept: -1 })
  const [sheetLoading, setSheetLoading] = useState(false)
  const [sheetError, setSheetError]     = useState("")
  const fileRef = useRef(null)

  // registration-form responses
  const [answers, setAnswers]       = useState([])
  const [ansLoading, setAnsLoading] = useState(false)

  const toastRef = useRef(addToast)
  toastRef.current = addToast

  useEffect(() => {
    if (!announcements.length) { setSelectedId(null); return }
    if (!announcements.some(a => a.id === selectedId)) setSelectedId(announcements[0].id)
  }, [announcements, selectedId]) // eslint-disable-line react-hooks/set-state-in-effect

  const selected = announcements.find(a => a.id === selectedId)
  const maxSize  = selected?.max_team_size ?? 4
  const sheetUrl = selected?.google_sheet_csv_url

  // ── platform data ──────────────────────────────────────────────────────────
  // `silent` = background refresh (realtime) → no spinner flash
  const load = useCallback(async (silent = false) => {
    if (!selectedId) return
    if (!silent) setLoading(true)
    const [pr, tr] = await Promise.all([
      supabase.from("announcement_participants")
        .select("id, user_id, display_name, email, participation_type, team_id, role, joined_at")
        .eq("announcement_id", selectedId).order("joined_at"),
      supabase.from("announcement_teams")
        .select("id, name, leader_id, created_at")
        .eq("announcement_id", selectedId).order("created_at"),
    ])
    if (pr.error || tr.error) toastRef.current?.("error", (pr.error || tr.error).message)
    setPeople(pr.data ?? []); setTeams(tr.data ?? [])
    if (!silent) setLoading(false)
  }, [selectedId])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  // ── registration-form responses ────────────────────────────────────────────
  const loadAnswers = useCallback(async (silent = false) => {
    if (!selectedId) return
    if (!silent) setAnsLoading(true)
    const { data, error } = await supabase.from("announcement_registration_answers")
      .select("id, user_id, answers, submitted_at, updated_at")
      .eq("announcement_id", selectedId).order("submitted_at")
    if (error) toastRef.current?.("error", error.message)
    setAnswers(data ?? [])
    if (!silent) setAnsLoading(false)
  }, [selectedId])

  useEffect(() => { if (source === "responses") loadAnswers() }, [source, loadAnswers]) // eslint-disable-line react-hooks/set-state-in-effect

  // ── realtime: refresh when people join / leave / create teams / submit the form ──
  const reloadRef = useRef({ load, loadAnswers })
  reloadRef.current = { load, loadAnswers }
  useEffect(() => {
    if (!selectedId) return
    let timer = null
    const refresh = () => {            // debounce bursts (e.g. seeding many rows at once)
      clearTimeout(timer)
      timer = setTimeout(() => {
        reloadRef.current.load(true)
        reloadRef.current.loadAnswers(true)
      }, 400)
    }
    const filter = `announcement_id=eq.${selectedId}`
    const channel = supabase.channel(`org-participants-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcement_participants",         filter }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcement_teams",                filter }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "announcement_registration_answers", filter }, refresh)
      .subscribe()
    return () => { clearTimeout(timer); supabase.removeChannel(channel) }
  }, [selectedId])

  // ── sheet data ─────────────────────────────────────────────────────────────
  const applySheet = useCallback((text, label) => {
    if (looksLikeHtml(text)) {
      setSheet(null)
      setSheetError("That link returned a web page, not CSV data. Set the sheet to “Anyone with the link can view” (or File → Share → Publish to web → CSV), or upload the CSV file instead.")
      return
    }
    const rows = parseCSV(text)
    if (rows.length < 2) { setSheetError("The CSV has no data rows."); setSheet(null); return }
    const headers = rows[0].map(h => String(h).replace(/\s+/g, " ").trim())
    const width = headers.length
    setSheet({ headers, rows: rows.slice(1).map(r => r.slice(0, width)), label })
    setMap(detectColumns(headers))
    setSheetError("")
  }, [])

  const loadSheet = useCallback(async () => {
    if (!sheetUrl) return
    setSheetLoading(true); setSheetError("")
    try {
      const res = await fetch(toCsvUrl(sheetUrl))
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      applySheet(await res.text(), "Google Sheet")
    } catch {
      setSheet(null)
      setSheetError("Couldn't read the sheet. Make sure it's shared as “Anyone with the link can view” or published as CSV, or upload the CSV file instead.")
    }
    setSheetLoading(false)
  }, [sheetUrl, applySheet])

  useEffect(() => {
    setSheet(null); setSheetError("")
    if (source === "sheet" && sheetUrl) loadSheet()
  }, [source, selectedId, sheetUrl, loadSheet]) // eslint-disable-line react-hooks/set-state-in-effect

  const onFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ""
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { setSheetError("File is larger than 5 MB."); return }
    applySheet(await f.text(), f.name)
  }

  // ── derived: platform ──────────────────────────────────────────────────────
  const q = query.trim().toLowerCase()
  const match = (s) => (s ?? "").toLowerCase().includes(q)

  const { teamCards, solos, lookers, orphans, stats } = useMemo(() => {
    const byTeam = new Map(teams.map(t => [t.id, { ...t, members: [] }]))
    const solos = [], lookers = [], orphans = []
    people.forEach(pp => {
      if (pp.team_id && byTeam.has(pp.team_id)) byTeam.get(pp.team_id).members.push(pp)
      else if (pp.participation_type === "looking") lookers.push(pp)
      else if (pp.participation_type === "solo") solos.push(pp)
      else orphans.push(pp)                                   // group member whose team couldn't be loaded
    })
    const all = [...byTeam.values()].map(t => ({
      ...t,
      members: t.members.sort((a, b) => (a.role === "leader" ? -1 : b.role === "leader" ? 1 : 0)),
    }))
    const grouped = all.reduce((n, t) => n + t.members.length, 0)
    return {
      teamCards: all, solos, lookers, orphans,
      stats: { total: people.length, teams: all.length, grouped, solo: solos.length, looking: lookers.length, orphan: orphans.length },
    }
  }, [people, teams])

  const teamName = (id) => teamCards.find(t => t.id === id)?.name ?? "Team"
  const filteredTeams   = teamCards.filter(t => !q || match(t.name) || t.members.some(m => match(m.display_name) || match(m.email)))
  const filteredSolos   = solos.filter(s => !q || match(s.display_name) || match(s.email))
  const filteredLookers = lookers.filter(s => !q || match(s.display_name) || match(s.email))
  const filteredOrphans = orphans.filter(s => !q || match(s.display_name) || match(s.email))
  const filteredAll     = people.filter(pp => !q || match(pp.display_name) || match(pp.email) || match(pp.team_id ? teamName(pp.team_id) : ""))

  const typeLabel = (pp) => pp.participation_type === "solo" ? "Solo" : pp.participation_type === "looking" ? "Looking for team" : teamName(pp.team_id)

  // ── derived: form responses ────────────────────────────────────────────────
  const formFields = Array.isArray(selected?.registration_form) ? selected.registration_form : []
  const responseRows = answers.map(a => {
    const pp = people.find(x => x.user_id === a.user_id)
    return {
      id: a.id,
      // announcement_registration_answers has no name/email columns → take them from the participant row
      name: pp ? displayName(pp.display_name, pp.email) : `Form only · ${String(a.user_id).slice(0, 8)}`,
      email: pp?.email || "",
      participation: pp ? typeLabel(pp) : "Form only",
      formOnly: !pp,
      submitted_at: a.submitted_at,
      answers: a.answers || {},
    }
  })
  const filteredResponses = responseRows.filter(r =>
    !q || match(r.name) || match(r.email) || Object.values(r.answers).some(v => match(formatAnswer(v))))
  const missingForm = formFields.length
    ? people.filter(pp => !answers.some(a => a.user_id === pp.user_id)).length
    : 0

  // super-admin: prepend an "Organization" column to every export
  const saveCsv = (filename, rows) => downloadCsv(
    filename,
    groupByOrg ? rows.map((r, i) => [i === 0 ? "Organization" : (selected?.organization || ""), ...r]) : rows,
  )

  const exportResponses = () => {
    const rows = [["Name", "Email", "Participation", "Submitted", ...formFields.map(f => f.label)]]
    responseRows.forEach(r => rows.push([
      r.name, r.email, r.participation, r.submitted_at,
      ...formFields.map(f => formatAnswer(r.answers[f.id])),
    ]))
    saveCsv(`${slug(selected?.title)}-form-responses.csv`, rows)
  }

  const exportPlatform = () => {
    const rows = [["Team", "Name", "Email", "Role", "Participation", "Joined"]]
    teamCards.forEach(t => t.members.forEach(m => rows.push([t.name, m.display_name, m.email, m.role, "Group", m.joined_at])))
    orphans.forEach(m => rows.push(["(team unavailable)", m.display_name, m.email, m.role, "Group", m.joined_at]))
    lookers.forEach(m => rows.push(["", m.display_name, m.email, "", "Looking for team", m.joined_at]))
    solos.forEach(m => rows.push(["", m.display_name, m.email, "", "Solo", m.joined_at]))
    saveCsv(`${slug(selected?.title)}-participants.csv`, rows)
  }

  // ── derived: sheet ─────────────────────────────────────────────────────────
  const sheetGroups = useMemo(() => {
    if (!sheet) return { groups: [], buckets: [], total: 0, attention: 0 }
    const get = (r, i) => (i >= 0 ? clean(r[i]) : "")
    const byKey = new Map(), bucketMap = new Map()
    let attention = 0

    sheet.rows.forEach(r => {
      const status = get(r, map.status)
      const person = {
        name:   get(r, map.name) || "(no name)",
        email:  get(r, map.email),
        role:   get(r, map.role),
        dept:   get(r, map.dept),
        status,
      }
      if (/forming|not found/i.test(status)) attention++
      const team = get(r, map.team)

      const noTeam = !team || /^(solo|looking)/i.test(status)
      if (noTeam) {
        const label = status || "No group"
        if (!bucketMap.has(label)) bucketMap.set(label, [])
        bucketMap.get(label).push(person)
        return
      }
      const key = team.toLowerCase()
      if (!byKey.has(key)) byKey.set(key, { name: team, members: [] })
      byKey.get(key).members.push(person)
    })

    const groups = [...byKey.values()].map(g => ({
      ...g,
      members: g.members.sort((a, b) => (/leader/i.test(a.role) ? -1 : /leader/i.test(b.role) ? 1 : 0)),
      problem: g.members.some(m => /not found/i.test(m.status)),
    }))
    const order = (l) => /solo/i.test(l) ? 0 : /looking/i.test(l) ? 1 : 2
    const buckets = [...bucketMap.entries()]
      .map(([label, members]) => ({ label, members }))
      .sort((a, b) => order(a.label) - order(b.label))
    return { groups, buckets, total: sheet.rows.length, attention }
  }, [sheet, map])

  const personMatch = (m) => match(m.name) || match(m.email) || match(m.dept)
  const sGroups  = sheetGroups.groups.filter(g => !q || match(g.name) || g.members.some(personMatch))
  const sBuckets = sheetGroups.buckets
    .map(b => ({ ...b, members: b.members.filter(m => !q || personMatch(m)) }))
    .filter(b => b.members.length)
  const bucketCount = (re) => sheetGroups.buckets.filter(b => re.test(b.label)).reduce((n, b) => n + b.members.length, 0)

  const exportSheet = () => {
    const rows = [["Team", "Name", "Email", "Department", "Role", "Status"]]
    sheetGroups.groups.forEach(g => g.members.forEach(m => rows.push([g.name, m.name, m.email, m.dept, m.role, m.status])))
    sheetGroups.buckets.forEach(b => b.members.forEach(m => rows.push(["", m.name, m.email, m.dept, m.role, m.status || b.label])))
    saveCsv(`${slug(selected?.title)}-sheet-groups.csv`, rows)
  }

  // super-admin: announcements grouped by organization (A→Z)
  const orgGroups = useMemo(() => {
    if (!groupByOrg) return []
    const m = new Map()
    announcements.forEach(a => {
      const k = a.organization || "Unknown organization"
      if (!m.has(k)) m.set(k, [])
      m.get(k).push(a)
    })
    return [...m.entries()].sort((x, y) => x[0].localeCompare(y[0]))
  }, [announcements, groupByOrg])

  // ── styles ─────────────────────────────────────────────────────────────────
  const card    = { background: uiT?.surfaceBg  ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }
  const card2   = { background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }
  const heading = { color: uiT?.headingText }
  const muted   = { color: uiT?.mutedText }
  const selStyle = { background: uiT?.inputBg, border: `1px solid ${uiT?.borderSubtle}`, color: uiT?.headingText }

  const Person = ({ name, email, sub, role, badge, badgeStyle }) => (
    <div className="flex items-center gap-2.5 py-2 min-w-0">
      {/leader/i.test(role || "") ? <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" /> : <User className="w-3.5 h-3.5 shrink-0" style={muted} />}
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate" style={heading}>{displayName(name, email)}</p>
        {(email || sub) && <p className="text-[11px] truncate" style={muted}>{[email, sub].filter(Boolean).join(" · ")}</p>}
      </div>
      {badge && (
        <span className="text-[11px] px-2 py-0.5 rounded-full border shrink-0"
          style={{ ...muted, borderColor: uiT?.borderSubtle, ...(badgeStyle || {}) }}>{badge}</span>
      )}
    </div>
  )

  const Stat = ({ label, value, warn }) => (
    <div className="rounded-xl px-4 py-3" style={card2}>
      <p className="text-xl font-semibold tabular-nums" style={warn && value > 0 ? { color: "#d97706" } : heading}>{value}</p>
      <p className="text-xs" style={muted}>{label}</p>
    </div>
  )

  const GroupCard = ({ title, count, max, problem, children }) => {
    const full = max && count >= max
    return (
      <div className="rounded-2xl p-4" style={problem ? { ...card, borderColor: "rgba(239,68,68,0.35)" } : card}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            {problem ? <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" /> : <Users className="w-4 h-4 shrink-0" style={muted} />}
            <p className="text-sm font-semibold truncate" style={heading}>{title}</p>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full border shrink-0"
            style={full ? { color: "#10b981", borderColor: "rgba(16,185,129,0.35)" } : { ...muted, borderColor: uiT?.borderSubtle }}>
            {max ? `${count}/${max}${full ? " · full" : ""}` : count}
          </span>
        </div>
        <div className="divide-y">{children}</div>
      </div>
    )
  }

  const LooseCard = ({ icon: Icon, title, items, renderItem }) => (
    <div className="rounded-2xl p-4" style={card}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={muted} />
        <p className="text-sm font-semibold" style={heading}>{title}</p>
        <span className="text-[11px]" style={muted}>{items.length}</span>
      </div>
      <div className="divide-y">{items.map(renderItem)}</div>
    </div>
  )

  if (!announcements.length) {
    return (
      <div className="rounded-2xl p-10 text-center" style={card}>
        <UsersRound className="w-8 h-8 mx-auto mb-3" style={muted} />
        <p className="text-sm" style={muted}>No approved announcements yet. Participants appear here once people register.</p>
      </div>
    )
  }

  const bucketIcon = (label) => /looking/i.test(label) ? Search : User
  const refreshing = source === "platform" ? loading : source === "responses" ? ansLoading : sheetLoading

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <select value={selectedId ?? ""} onChange={(e) => setSelectedId(Number(e.target.value))}
          className="text-sm rounded-xl px-3 py-2 outline-none cursor-pointer lg:max-w-xs w-full" style={selStyle}>
          {groupByOrg
            ? orgGroups.map(([org, list]) => (
                <optgroup key={org} label={org} style={{ background: uiT?.inputBg }}>
                  {list.map(a => <option key={a.id} value={a.id} style={{ background: uiT?.inputBg }}>{a.title}</option>)}
                </optgroup>
              ))
            : announcements.map(a => <option key={a.id} value={a.id} style={{ background: uiT?.inputBg }}>{a.title}</option>)}
        </select>

        <div className="inline-flex rounded-xl p-0.5 shrink-0" style={{ background: uiT?.inlineBg ?? "rgba(255,255,255,0.05)" }}>
          {[["platform", "Platform", Database], ["responses", "Form responses", ClipboardList], ["sheet", "Sheet CSV", FileSpreadsheet]].map(([k, l, Icon]) => (
            <button key={k} type="button" onClick={() => setSource(k)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${source === k ? "bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300" : ""}`}
              style={source === k ? undefined : muted}>
              <Icon className="w-3.5 h-3.5" />{l}
            </button>
          ))}
        </div>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={muted} />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email or team"
            className="pl-9 rounded-xl" style={{ background: uiT?.inputBg, borderColor: uiT?.borderSubtle, color: uiT?.headingText }} />
        </div>

        {source === "platform" && (
          <div className="inline-flex rounded-xl p-0.5 shrink-0" style={{ background: uiT?.inlineBg ?? "rgba(255,255,255,0.05)" }}>
            {[["teams", "Grouped"], ["all", "All"]].map(([k, l]) => (
              <button key={k} type="button" onClick={() => setView(k)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === k ? "bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300" : ""}`}
                style={view === k ? undefined : muted}>{l}</button>
            ))}
          </div>
        )}

        <Button type="button" variant="outline" size="sm" className="rounded-xl shrink-0 h-9"
          onClick={source === "platform" ? exportPlatform : source === "responses" ? exportResponses : exportSheet}
          disabled={source === "platform" ? stats.total === 0 : source === "responses" ? responseRows.length === 0 : !sheet}>
          <Download className="w-4 h-4 mr-1.5" /> Export CSV
        </Button>
        <Button type="button" variant="outline" size="icon" className="rounded-xl shrink-0"
          onClick={() => (source === "platform" ? load() : source === "responses" ? loadAnswers() : loadSheet())} title="Refresh"
          disabled={source === "sheet" ? (sheetLoading || !sheetUrl) : refreshing}>
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* ═════════ PLATFORM ═════════ */}
      {source === "platform" && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Stat label="Participants" value={stats.total} />
            <Stat label="Teams" value={stats.teams} />
            <Stat label="In a team" value={stats.grouped} />
            <Stat label="Solo" value={stats.solo} />
            <Stat label="Looking for team" value={stats.looking} />
          </div>

          {loading && !people.length ? (
            <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={muted} /></div>
          ) : stats.total === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={card}>
              <p className="text-sm" style={muted}>Nobody has registered through the platform yet.</p>
            </div>
          ) : view === "all" ? (
            <div className="rounded-2xl px-4 divide-y" style={card}>
              {filteredAll.length
                ? filteredAll.map(pp => <Person key={pp.id} name={pp.display_name} email={pp.email} role={pp.role} badge={typeLabel(pp)} />)
                : <p className="py-6 text-sm text-center" style={muted}>No matches.</p>}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTeams.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredTeams.map(t => (
                    <GroupCard key={t.id} title={t.name} count={t.members.length} max={maxSize}>
                      {t.members.map(m => <Person key={m.id} name={m.display_name} email={m.email} role={m.role} />)}
                    </GroupCard>
                  ))}
                </div>
              )}
              {filteredLookers.length > 0 && (
                <LooseCard icon={Search} title="Looking for a team" items={filteredLookers}
                  renderItem={s => <Person key={s.id} name={s.display_name} email={s.email} />} />
              )}
              {filteredSolos.length > 0 && (
                <LooseCard icon={User} title="Solo participants" items={filteredSolos}
                  renderItem={s => <Person key={s.id} name={s.display_name} email={s.email} />} />
              )}
              {filteredOrphans.length > 0 && (
                <LooseCard icon={UserX} title="Team unavailable (team missing or not readable)" items={filteredOrphans}
                  renderItem={s => <Person key={s.id} name={s.display_name} email={s.email} role={s.role} />} />
              )}
              {!filteredTeams.length && !filteredSolos.length && !filteredLookers.length && !filteredOrphans.length && (
                <p className="py-6 text-sm text-center" style={muted}>No matches.</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ═════════ FORM RESPONSES ═════════ */}
      {source === "responses" && (
        <div className="space-y-4">
          {formFields.length === 0 ? (
            <div className="rounded-2xl p-10 text-center" style={card}>
              <ClipboardList className="w-8 h-8 mx-auto mb-3" style={muted} />
              <p className="text-sm" style={muted}>This announcement has no custom registration form.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Stat label="Responses" value={responseRows.length} />
                <Stat label="Questions" value={formFields.length} />
                <Stat label="Joined, no form yet" value={missingForm} warn />
                <Stat label="Form only (not joined)" value={responseRows.filter(r => r.formOnly).length} />
              </div>

              {ansLoading && !answers.length ? (
                <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin" style={muted} /></div>
              ) : filteredResponses.length === 0 ? (
                <div className="rounded-2xl p-10 text-center" style={card}>
                  <p className="text-sm" style={muted}>{answers.length ? "No matches." : "Nobody has submitted the form yet."}</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredResponses.map(r => (
                    <div key={r.id} className="rounded-2xl p-4" style={card}>
                      <Person name={r.name} email={r.email} badge={r.participation} />
                      <dl className="mt-2 pt-3 space-y-2.5 border-t" style={{ borderColor: uiT?.borderBase }}>
                        {formFields.map(f => (
                          <div key={f.id}>
                            <dt className="text-[10px] font-medium uppercase tracking-widest" style={muted}>{f.label}</dt>
                            <dd className="text-sm whitespace-pre-line break-words" style={heading}>{formatAnswer(r.answers[f.id]) || "—"}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ═════════ SHEET CSV ═════════ */}
      {source === "sheet" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3" style={card}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={heading}>
                {sheet ? `Loaded: ${sheet.label} · ${sheetGroups.total} rows` : "Registrants from your spreadsheet"}
              </p>
              <p className="text-[11px] mt-0.5" style={muted}>
                {sheetUrl
                  ? "Reading your announcement's Google Sheet (must be shared as “Anyone with the link can view”). You can also upload a CSV exported from Excel."
                  : "This announcement has no Google Sheet link. Upload a CSV exported from Excel or Google Sheets."}
              </p>
            </div>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
            <Button type="button" variant="outline" size="sm" className="rounded-xl h-9 shrink-0" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-1.5" /> Upload CSV
            </Button>
          </div>

          {sheetLoading && <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={muted} /></div>}
          {sheetError && (
            <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>
              {sheetError}
            </div>
          )}

          {sheet && (
            <>
              <details className="rounded-2xl p-4" style={card} open={map.name === -1 || map.team === -1}>
                <summary className="text-xs font-medium cursor-pointer select-none" style={muted}>
                  Column mapping (auto-detected) — click to adjust
                </summary>
                <div className="grid gap-3 sm:grid-cols-3 mt-3">
                  {[["name", "Name"], ["team", "Team / group"], ["email", "Email"], ["status", "Status"], ["role", "Role"], ["dept", "Department"]].map(([key, label]) => (
                    <div key={key} className="space-y-1">
                      <p className="text-[10px] font-medium uppercase tracking-widest" style={muted}>{label} column</p>
                      <select value={map[key]} onChange={(e) => setMap(m => ({ ...m, [key]: Number(e.target.value) }))}
                        className="w-full text-sm rounded-xl px-3 py-2 outline-none cursor-pointer" style={selStyle}>
                        <option value={-1} style={{ background: uiT?.inputBg }}>— none —</option>
                        {sheet.headers.map((h, i) => <option key={i} value={i} style={{ background: uiT?.inputBg }}>{h || `Column ${i + 1}`}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </details>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Stat label="Rows" value={sheetGroups.total} />
                <Stat label="Teams" value={sheetGroups.groups.length} />
                <Stat label="Solo" value={bucketCount(/solo/i)} />
                <Stat label="Looking for team" value={bucketCount(/looking/i)} />
                <Stat label="Needs attention" value={sheetGroups.attention} warn />
              </div>

              {map.team === -1 && (
                <p className="text-xs" style={muted}>Pick the column that holds the team/group name to see people grouped.</p>
              )}

              {sGroups.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {sGroups.slice(0, MAX_SHEET_ROWS_SHOWN).map((g, i) => (
                    <GroupCard key={`${g.name}-${i}`} title={g.name} count={g.members.length} max={maxSize} problem={g.problem}>
                      {g.members.map((m, j) => (
                        <Person key={j} name={m.name} email={m.email} sub={m.dept} role={m.role}
                          badge={m.status && !/^grouped$/i.test(m.status) ? m.status : null}
                          badgeStyle={STATUS_STYLE(m.status)} />
                      ))}
                    </GroupCard>
                  ))}
                </div>
              )}
              {sBuckets.map(b => (
                <LooseCard key={b.label} icon={bucketIcon(b.label)}
                  title={map.team === -1 ? "Everyone" : b.label === "No group" ? "No group / individual" : b.label}
                  items={b.members.slice(0, MAX_SHEET_ROWS_SHOWN)}
                  renderItem={(m, i) => <Person key={i} name={m.name} email={m.email} sub={m.dept} role={m.role} />} />
              ))}
              {!sGroups.length && !sBuckets.length && <p className="py-6 text-sm text-center" style={muted}>No matches.</p>}
              {(sGroups.length > MAX_SHEET_ROWS_SHOWN || sBuckets.some(b => b.members.length > MAX_SHEET_ROWS_SHOWN)) && (
                <p className="text-[11px] text-center" style={muted}>Showing the first {MAX_SHEET_ROWS_SHOWN}. Use Export CSV for the full list.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}