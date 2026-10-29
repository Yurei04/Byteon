"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar, Award, Users, AlertCircle, MousePointerClick, Trophy, Clock,
  ChevronRight, MapPin, Sparkles, Megaphone, Lock,
  Globe, Code2, MessageCircle, FileText, ArrowUpRight, Activity,
  Rocket, LogIn, LogOut, ClipboardList, Shuffle, Crown,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { getPhase, daysUntil } from "@/lib/announcement-config"
import { useAuth } from "@/components/(auth)/authContext"
import AnnouncementTrackingBadge from "./announce-tracking-badge"
import InviteCodeGate from "./invite-code-gate"
import ParticipationPanel from "./participationPanel"
import RegistrationFormFill from "./registration-form-fill"
import TeamDirectory from "./team-directory"
import { getFieldType } from "@/lib/registration-form"

/**
 * Changes in this version (random-team mode)
 *  - RandomJoinPanel: when the organizer's registration form exists, submitting it registers the
 *    person automatically (autoJoin) – no second "Register" click, no form-only dead end.
 *  - RandomJoinPanel: teammates are read through the get_public_teams RPC (RLS-safe) and the panel
 *    updates on INSERT / UPDATE / DELETE (+ 20 s polling fallback).
 *  - formDone is restored for returning users who already submitted the form.
 *  - PublicTeams is always shown in random mode (no longer hidden by allow_teams === false).
 */

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatUTCDateTime(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  return (
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
      hour12: false, timeZone: "UTC",
    }).format(date) + " UTC"
  )
}

function formatUTCDateShort(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    month: "short", day: "numeric", year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

// registration_form should be a jsonb array, but tolerate a JSON string and drop malformed fields
// so one bad question can never hide (or crash) the whole form.
function parseRegForm(v) {
  let list = v
  if (typeof v === "string") { try { list = JSON.parse(v) } catch { list = [] } }
  if (!Array.isArray(list)) return []
  return list.filter((f) => f && typeof f === "object" && f.id != null && f.label)
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")

/**
 * Public links. google_sheet_csv_url is intentionally NOT here — it is an
 * internal tracking source and must never be shown to visitors.
 * `rgb` is a space-separated triple so we can build tinted backgrounds/borders.
 */
const LINK_DEFS = [
  {
    key: "website_link", Icon: Globe, rgb: "139 92 246",
    sm: (manual) => (manual ? "Register" : "Website"),
    lg: (manual) => (manual ? "Register Now" : "Visit Website"),
    hint: "Official event page",
  },
  {
    key: "dev_link", Icon: Code2, rgb: "59 130 246",
    sm: () => "DevPost", lg: () => "View on DevPost",
    hint: "Submissions & project gallery",
  },
  {
    key: "community_link", Icon: MessageCircle, rgb: "16 185 129",
    sm: () => "Community", lg: () => "Join Community",
    hint: "Chat with organizers & teammates",
  },
  {
    // Optional alternative to joining on Byteon
    key: "google_forms_url", Icon: FileText, rgb: "245 158 11",
    sm: () => "Google Form", lg: () => "Register with Google Form",
    hint: "Optional — an alternative way to register",
  },
]

const getPrizeColorScheme = (prizeName, prizeType) => {
  const name = prizeName.toLowerCase()
  const base = { value: "text-foreground", label: "text-muted-foreground" }

  if (name.includes("1st") || name.includes("first") || name.includes("gold"))
    return { ...base,
      gradient: "from-yellow-500/40 via-yellow-400/15 to-transparent dark:from-yellow-500/15 dark:to-yellow-500/5",
      border: "border-yellow-500/20 dark:border-yellow-500/30", glow: "shadow-yellow-500/10",
      icon: "text-yellow-500 dark:text-yellow-400", rank: "🥇" }

  if (name.includes("2nd") || name.includes("second") || name.includes("silver"))
    return { ...base,
      gradient: "from-slate-400/40 via-slate-300/15 to-transparent dark:from-slate-400/15 dark:to-slate-400/5",
      border: "border-slate-400/20 dark:border-slate-400/30", glow: "shadow-slate-400/10",
      icon: "text-slate-500 dark:text-slate-300", rank: "🥈" }

  if (name.includes("3rd") || name.includes("third") || name.includes("bronze"))
    return { ...base,
      gradient: "from-orange-500/40 via-amber-500/15 to-transparent dark:from-orange-500/15 dark:to-orange-500/5",
      border: "border-orange-500/20 dark:border-orange-500/30", glow: "shadow-orange-500/10",
      icon: "text-orange-500 dark:text-orange-400", rank: "🥉" }

  if (name.includes("participation"))
    return { ...base,
      gradient: "from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-500/15 dark:to-violet-500/5",
      border: "border-violet-500/20 dark:border-violet-500/30", glow: "shadow-violet-500/10",
      icon: "text-violet-500 dark:text-violet-400", rank: "🎖️" }

  if (prizeType === "non_cash")
    return { ...base,
      gradient: "from-teal-500/10 via-emerald-500/5 to-transparent dark:from-teal-500/15 dark:to-teal-500/5",
      border: "border-teal-500/20 dark:border-teal-500/30", glow: "shadow-teal-500/10",
      icon: "text-teal-500 dark:text-teal-400", rank: "🎁" }

  return { ...base,
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent dark:from-sky-500/15 dark:to-sky-500/5",
    border: "border-sky-500/20 dark:border-sky-500/30", glow: "shadow-sky-500/10",
    icon: "text-sky-500 dark:text-sky-400", rank: "🏆" }
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

// phase: "upcoming" | "open" | "live" | "ended"  (see getPhase)
// Registration opens as soon as the super admin approves, so "upcoming" now means
// "open for sign-up, event starts later" rather than "not open yet".
function StatusPill({ phase, item, t }) {
  const fixed = {
    ended:    { text: "Ended",                                              cls: "bg-red-500/15 border border-red-500/30 text-red-400",             dot: "bg-red-400",     pulse: false },
    upcoming: { text: `Open · starts in ${daysUntil(item.date_begin)}d`,    cls: "bg-amber-500/15 border border-amber-500/30 text-amber-500",       dot: "bg-amber-400",   pulse: true  },
    live:     { text: `Live · ${daysUntil(item.date_end)}d left`,           cls: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500", dot: "bg-emerald-400", pulse: true  },
  }[phase]

  if (fixed) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${fixed.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${fixed.dot} ${fixed.pulse ? "animate-pulse" : ""}`} />
        {fixed.text}
      </span>
    )
  }
  // "open": promotion running, hackathon not started yet
  const d = daysUntil(item.date_begin)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
      style={{ background: t.badgeBgPrimary, border: t.borderColorLight, color: t.primaryText }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "currentColor" }} />
      {d > 0 ? `Starts in ${d}d` : "Starting soon"}
    </span>
  )
}

function DetailRow({ icon, label, value, iconColor }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-0.5 shrink-0" style={{ color: iconColor }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "rgb(var(--text-muted))" }}>{label}</p>
        <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{value}</p>
      </div>
    </div>
  )
}

// Read-only look at the organizer's registration form (shown when it can't be filled in yet:
// signed-out visitors, or before registration opens).
function RegistrationFormPreview({ fields, note }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
        Registration form
      </p>
      <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.25)" }}>
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-sky-500" />
          <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
            What you’ll be asked · {fields.length} question{fields.length !== 1 ? "s" : ""}
          </p>
        </div>
        <ol className="space-y-2.5">
          {fields.map((f, i) => (
            <li key={f.id} className="flex gap-2.5">
              <span className="text-[11px] font-semibold tabular-nums w-5 shrink-0 pt-0.5" style={{ color: "rgb(var(--text-muted))" }}>{i + 1}.</span>
              <div className="min-w-0">
                <p className="text-sm" style={{ color: "rgb(var(--text-primary))" }}>
                  {f.label} {f.required && <span className="text-red-400">*</span>}
                </p>
                <p className="text-[11px] break-words" style={{ color: "rgb(var(--text-muted))" }}>
                  {getFieldType(f.type)?.label ?? f.type ?? "Text"}
                  {Array.isArray(f.options) && f.options.length > 0 && ` · ${f.options.join(" / ")}`}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-[11px]" style={{ color: "rgb(var(--text-muted))" }}>
          Your name and email are filled in from your Byteon account.{note ? ` ${note}` : ""}
        </p>
      </div>
    </div>
  )
}

// ─── Random-team mode: register once, the organizer draws the teams ──────────
// Shown instead of ParticipationPanel when announcement.team_formation === "random".
// Joining/leaving go through the join_random_announcement / leave_random_announcement RPCs
// (join-random-announcement.sql) so RLS on announcement_participants doesn't block them.
//
// autoJoin: pass true when the announcement has a registration form. The panel only renders after
// the form is submitted, so the person is registered automatically (once) and form-only
// respondents can't get stuck. Because of that, "Cancel my registration" is hidden in that case
// (it would just re-register them).
function RandomJoinPanel({ announcement, userId, displayName, email, autoJoin = false, onLeft }) {
  const [me, setMe]       = useState(undefined)   // undefined = loading, null = not registered
  const [team, setTeam]   = useState(null)        // { name, members }
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState("")
  const autoRef = useRef(false)                   // guards the one-time auto-registration
  const seqRef  = useRef(0)                       // ignore responses that belong to a previous account
  const [mismatch, setMismatch] = useState(false) // UI user != the user the Supabase client is signed in as

  // The join/leave RPCs act as the Supabase session user (auth.uid()). If the app's auth context and the
  // Supabase client disagree (stale session after switching accounts), registering would hit the WRONG
  // account — so detect it and ask for a clean sign-in instead.
  useEffect(() => {
    let alive = true
    supabase.auth.getUser().then(({ data }) => {
      if (alive) setMismatch(!!data?.user?.id && data.user.id !== userId)
    })
    return () => { alive = false }
  }, [userId])

  const load = useCallback(async () => {
    const seq = ++seqRef.current
    const { data } = await supabase.from("announcement_participants")
      .select("participation_type, team_id, role")
      .eq("announcement_id", announcement.id).eq("user_id", userId).maybeSingle()
    if (seq !== seqRef.current) return
    setMe(data ?? null)
    if (data?.team_id) {
      // public RPC → works even when RLS hides other people's participant rows
      const { data: rows } = await supabase.rpc("get_public_teams", { p_announcement_id: announcement.id })
      if (seq !== seqRef.current) return
      const mine = (rows ?? []).filter((r) => r.team_id === data.team_id)
      setTeam({
        name: mine[0]?.team_name ?? "Your team",
        members: mine.filter((r) => r.member_name).map((r) => ({ display_name: r.member_name, role: r.member_role })),
      })
    } else setTeam(null)
  }, [announcement.id, userId])

  useEffect(() => {
    load()
    // when the organizer draws the teams, show the result immediately
    const ch = supabase.channel(`my-participation-${announcement.id}-${userId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "announcement_participants", filter: `announcement_id=eq.${announcement.id}` },
        (p) => { if ((p.new?.user_id ?? p.old?.user_id) === userId) load() })
      .subscribe()
    const poll = setInterval(load, 20000)          // fallback if realtime is off
    return () => { clearInterval(poll); supabase.removeChannel(ch) }
  }, [load, announcement.id, userId])

  const join = async () => {
    setBusy(true); setError("")
    const { error } = await supabase.rpc("join_random_announcement", { p_announcement_id: announcement.id })
    setBusy(false)
    if (error) { setError(error.message); return false }
    load()
    return true
  }

  const leave = async () => {
    const msg = autoJoin
      ? "Unregister from this event? Your registration form answers will be removed too, and you can register again later."
      : "Unregister from this event? You can register again later."
    if (typeof window !== "undefined" && !window.confirm(msg)) return
    setBusy(true); setError("")
    const { error } = await supabase.rpc("leave_random_announcement", { p_announcement_id: announcement.id })
    setBusy(false)
    if (error) { setError(error.message); return }
    autoRef.current = true            // don't auto-register again in this session
    setMe(null); setTeam(null)
    onLeft?.()                        // parent shows the form / register button again
  }

  // form submitted → register automatically (once)
  useEffect(() => {
    if (autoJoin && me === null && !mismatch && !autoRef.current) { autoRef.current = true; join() }
  }, [autoJoin, me, mismatch]) // eslint-disable-line react-hooks/exhaustive-deps

  const grad = { background: "linear-gradient(135deg,#c026d3,#db2777)" }

  return (
    <div className="space-y-3">
      <div
        className="flex items-start gap-2.5 rounded-xl p-3.5"
        style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)" }}
      >
        <Shuffle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
        <div>
          <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Teams are assigned randomly</p>
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
            You don’t choose or create a team. Register now and the organizer will draw balanced random teams
            (up to {announcement.max_team_size ?? 4} people each) once registration is done. You’ll get a notification
            with your team as soon as it’s drawn.
          </p>
        </div>
      </div>

      {mismatch ? (
        <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)" }}>
          <p className="text-sm font-semibold text-amber-500">Your session looks out of sync</p>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
            The account shown here isn’t the one currently signed in, so registering could attach to the wrong account.
            Sign out and sign in again to continue.
          </p>
          <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white" style={grad}
            onClick={async () => { await supabase.auth.signOut(); window.location.reload() }}>
            Sign out &amp; reload
          </button>
        </div>
      ) : me === undefined || (autoJoin && me === null && !error) ? (
        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
          {autoJoin && me === null ? "Finishing your registration…" : "Loading…"}
        </p>
      ) : me === null ? (
        <button
          type="button" onClick={join} disabled={busy}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white disabled:opacity-60"
          style={grad}
        >
          <Rocket className="w-4 h-4" />{busy ? "Registering…" : error ? "Try again" : "Register — assign me to a team later"}
        </button>
      ) : team ? (
        <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "rgb(var(--text-muted))" }}>Your team</p>
          <p className="text-base font-bold" style={{ color: "rgb(var(--text-primary))" }}>{team.name}</p>
          <ul className="space-y-1">
            {team.members.map((m, i) => (
              <li key={i} className="text-sm flex items-center gap-2" style={{ color: "rgb(var(--text-secondary))" }}>
                {m.display_name || "Teammate"}
                {m.role === "leader" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">Leader</span>
                )}
              </li>
            ))}
          </ul>
          {announcement.community_link && (
            <a href={announcement.community_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline">
              <MessageCircle className="w-3.5 h-3.5" />Join the community to meet your team
            </a>
          )}
          <p className="text-[11px]" style={{ color: "rgb(var(--text-muted))" }}>
            Teams are final once drawn. To drop out, contact the organizer.
          </p>
        </div>
      ) : (
        <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <p className="text-sm font-semibold text-emerald-500">You’re registered ✓</p>
          <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Waiting for the organizer to draw the teams.</p>
          {announcement.community_link && (
            <a href={announcement.community_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500 hover:underline">
              <MessageCircle className="w-3.5 h-3.5" />Join the community
            </a>
          )}
          <div>
            <button type="button" onClick={leave} disabled={busy}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-60"
              style={{ color: "#ef4444", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.28)" }}>
              <LogOut className="w-3.5 h-3.5" />{busy ? "Unregistering…" : "Unregister"}
            </button>
          </div>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ─── All groups, visible to everyone (random-team mode) ──────────────────────
// Uses the get_public_teams RPC (public-teams.sql): team names + member display names + roles only,
// never emails. Refreshes while the dialog is open so the draw appears without a reload.
function PublicTeams({ announcementId, maxSize, active }) {
  const [rows, setRows] = useState(null)
  const [err, setErr]   = useState("")

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_public_teams", { p_announcement_id: announcementId })
    if (error) { setErr(error.message); setRows([]); return }
    setErr(""); setRows(data ?? [])
  }, [announcementId])

  useEffect(() => {
    if (!active) return
    load()
    const id = setInterval(load, 20000)
    return () => clearInterval(id)
  }, [active, load])

  const teams = []
  const byId = new Map()
  ;(rows ?? []).forEach((r) => {
    if (r.team_id == null) return
    if (!byId.has(r.team_id)) { const tm = { id: r.team_id, name: r.team_name, members: [] }; byId.set(r.team_id, tm); teams.push(tm) }
    if (r.member_name) byId.get(r.team_id).members.push({ name: r.member_name, leader: r.member_role === "leader" })
  })

  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
        Teams{teams.length ? ` · ${teams.length}` : ""}
      </p>
      {rows === null ? (
        <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>Loading…</p>
      ) : err ? (
        <p className="text-xs text-amber-500">Couldn’t load teams ({err}). Run public-teams.sql in Supabase.</p>
      ) : teams.length === 0 ? (
        <div className="rounded-xl p-4 text-xs flex items-center gap-2"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", color: "rgb(var(--text-muted))" }}>
          <Shuffle className="w-4 h-4 shrink-0" />Teams haven’t been drawn yet. They’ll all appear here once the organizer randomizes them.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map((tm) => (
            <div key={tm.id} className="rounded-xl p-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-bold truncate" style={{ color: "rgb(var(--text-primary))" }}>{tm.name}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full border shrink-0"
                  style={{ color: "rgb(var(--text-muted))", borderColor: "rgb(var(--surface-border) / 0.5)" }}>
                  {tm.members.length}{maxSize ? `/${maxSize}` : ""}
                </span>
              </div>
              <ul className="space-y-1">
                {tm.members.map((m, i) => (
                  <li key={i} className="text-xs flex items-center gap-1.5" style={{ color: "rgb(var(--text-secondary))" }}>
                    {m.leader ? <Crown className="w-3 h-3 text-amber-500 shrink-0" /> : <Users className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--text-muted))" }} />}
                    <span className="truncate">{m.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function AnnouncementPublicCard({ item, theme, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [unlockedLinks, setUnlockedLinks] = useState(null) // set after a valid invite code
  const [formDone, setFormDone] = useState(false)           // organizer's registration form submitted?
  const [extra, setExtra] = useState(null)                  // fields the parent list did not include
  const { session, isLoggedIn } = useAuth()
  const user = session?.user
  const t = theme || FALLBACK_THEME

  // If the parent's query left out the registration form / team settings, load them right away
  // (the card chips and the form preview both depend on them, not just the dialog).
  useEffect(() => {
    if (!item.native_registration) return
    if (
      item.registration_form !== undefined && item.allow_teams !== undefined &&
      item.max_team_size !== undefined && item.team_formation !== undefined
    ) return
    let alive = true
    supabase.from("announcements")
      .select("registration_form, allow_teams, max_team_size, team_formation")
      .eq("id", item.id).maybeSingle()
      .then(({ data }) => { if (alive && data) setExtra(data) })
    return () => { alive = false }
  }, [item.id, item.native_registration, item.registration_form, item.allow_teams, item.max_team_size, item.team_formation])
  const ann = extra ? { ...item, ...extra } : item
  const isRandom = ann.team_formation === "random"

  // Returning users who already submitted the form shouldn't see it again.
  // Reset on every account switch so one account's "form done" never leaks into the next one.
  useEffect(() => {
    setFormDone(false)
    if (!user?.id || !item.native_registration) return
    let alive = true
    supabase.from("announcement_registration_answers").select("id")
      .eq("announcement_id", item.id).eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (alive) setFormDone(!!data) })
    return () => { alive = false }
  }, [item.id, item.native_registration, user?.id])

  const phase    = getPhase(item)
  const prizes   = item.prizes || []
  const isInvite = !!item.is_invite_only
  const isManual = (item.tracking_method || "manual") === "manual"
  const isAuto   = item.tracking_method === "automatic"

  // Links are exposed once the invite code (if any) is verified.
  // NOTE: for invite-only events, the unlock RPC should return
  // { website_link, dev_link, community_link, google_forms_url }.
  const links = isInvite
    ? (unlockedLinks ?? {})
    : {
        website_link:     item.website_link,
        dev_link:         item.dev_link,
        community_link:   item.community_link,
        google_forms_url: item.google_forms_url,
      }
  const activeLinks = LINK_DEFS.filter((d) => links[d.key])

  // Registration opens as soon as the super admin approves (the card only exists once status is active).
  // promo_begin / date_begin now only affect the status badge, not whether people can join.
  const registrationClosedYet = false
  const showLinks = !registrationClosedYet && activeLinks.length > 0
  const needsCode = isInvite && !unlockedLinks && !registrationClosedYet

  // ── Join directly on Byteon (native registration) ──
  const native     = !!item.native_registration
  const showNative = native && !registrationClosedYet && phase !== "ended"
  // For invite-only events the join panel only appears after the code has been accepted.
  const canJoinNow = showNative && !needsCode
  const displayName =
    user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || ""
  // Organizer-defined registration questions: must be answered before choosing solo / team.
  const regForm   = parseRegForm(ann.registration_form)
  const needsForm = regForm.length > 0
  // Community link is passed to the panel even for invite-only events once unlocked.
  const panelAnnouncement = { ...ann, registration_form: regForm, community_link: links.community_link ?? item.community_link }
  // Show a read-only preview whenever the live form is not on screen (signed out, or not open yet).
  const showFormPreview = native && needsForm && !needsCode && phase !== "ended" && !(canJoinNow && isLoggedIn && user)

  const handleLinkClick = async (e, key) => {
    e.stopPropagation()
    if (key === "website_link" && isManual && links.website_link) {
      try {
        await supabase.from("announcements").update({
          website_clicks:    (item.website_clicks    || 0) + 1,
          registrants_count: (item.registrants_count || 0) + 1,
        }).eq("id", item.id)
      } catch (err) { console.error("Error tracking click:", err) }
    }
  }

  const getTrackingStats = () => {
    if (registrationClosedYet) return null // nothing to track before promotion starts
    if (isManual)
      return {
        Icon: MousePointerClick, label: "Clicks", rgb: "139 92 246",
        count: item.website_clicks || 0,
        note: "Counted each time someone taps Register",
      }
    if (isAuto)
      return {
        Icon: Users, label: "Registrants", rgb: "16 185 129",
        count: item.registrants_count || 0, hasError: item.sync_error,
        note: "Updated automatically from registrations",
      }
    return null
  }

  const trackingStats = getTrackingStats()

  /* ── Link buttons: each type has its own icon + color ── */
  const renderLinkButtons = (size) => {
    if (size === "lg") {
      return (
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
            {native ? "More ways to join & follow" : "Links"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeLinks.map(({ key, Icon, rgb, lg, hint }, i) => (
              <a
                key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
                onClick={(e) => handleLinkClick(e, key)}
                className={`group/link flex items-center gap-3 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 ${
                  activeLinks.length % 2 === 1 && i === activeLinks.length - 1 ? "sm:col-span-2" : ""
                }`}
                style={{ background: `rgb(${rgb} / 0.08)`, border: `1px solid rgb(${rgb} / 0.28)` }}
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ background: `rgb(${rgb} / 0.18)`, color: `rgb(${rgb})` }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold truncate" style={{ color: "rgb(var(--text-primary))" }}>
                    {lg(isManual)}
                  </span>
                  <span className="block text-xs truncate" style={{ color: "rgb(var(--text-muted))" }}>{hint}</span>
                </span>
                <ArrowUpRight
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  style={{ color: `rgb(${rgb})` }}
                />
              </a>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div
        className="grid grid-cols-2 gap-2 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {activeLinks.map(({ key, Icon, rgb, sm }, i) => (
          <a
            key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
            onClick={(e) => handleLinkClick(e, key)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:-translate-y-px ${
              activeLinks.length % 2 === 1 && i === activeLinks.length - 1 ? "col-span-2" : ""
            }`}
            style={{
              background: `rgb(${rgb} / 0.12)`,
              border: `1px solid rgb(${rgb} / 0.30)`,
              color: `rgb(${rgb})`,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {sm(isManual)}
          </a>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* ══════════════ CARD ══════════════ */}
      <Card
        className="group relative overflow-hidden cursor-pointer transition-all duration-300"
        style={{
          background: "rgb(var(--surface-raised))",
          border: "1px solid rgb(var(--surface-border) / 0.60)",
          borderRadius: "16px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)" }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
        onClick={() => setIsDialogOpen(true)}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: t.overlayGradient }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          style={{ background: t.bottomBarGradient }}
        />

        <CardContent className="relative p-5 flex flex-col gap-4">

          {/* ── Header: org + status ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {item.organization && (
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgb(var(--text-faint))" }}>
                  {item.organization}
                </p>
              )}
              <h3 className="text-lg font-bold leading-snug line-clamp-2" style={{ color: "rgb(var(--text-primary))" }}>
                {item.title}
              </h3>
            </div>
            <StatusPill phase={phase} item={item} t={t} />
          </div>

          {/* ── Date range (hackathon) ── */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-secondary))" }} />
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>{formatUTCDateShort(item.date_begin)}</span>
            <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--text-secondary))" }} />
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>{formatUTCDateShort(item.date_end)}</span>
          </div>


          {/* ── Meta chips ── */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {isInvite && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-indigo-100/90 border-indigo-400/50 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/25 dark:text-indigo-300">
                <Lock className="w-3 h-3" />
                Invite only
              </span>
            )}
            {native && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-fuchsia-100/90 border-fuchsia-400/50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/25 dark:text-fuchsia-300">
                <Rocket className="w-3 h-3" />
                Join on Byteon
              </span>
            )}
            {native && isRandom && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-emerald-100/90 border-emerald-400/50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-300">
                <Shuffle className="w-3 h-3" />
                Random teams
              </span>
            )}
            {native && needsForm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-sky-100/90 border-sky-400/50 text-sky-600 dark:bg-sky-500/10 dark:border-sky-500/25 dark:text-sky-300">
                <ClipboardList className="w-3 h-3" />
                Registration form
              </span>
            )}
            {item.open_to && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: "rgb(var(--text-faint))" }}>
                <Users className="w-3 h-3" />
                {item.open_to}
              </span>
            )}
            {item.countries && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: "rgb(var(--text-faint))" }}>
                <MapPin className="w-3 h-3" />
                {item.countries}
              </span>
            )}
            {prizes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100/90 border-amber-500/50 text-amber-600 dark:bg-amber-500/10 border dark:border-amber-500/20 dark:text-amber-400/80">
                <Trophy className="w-3 h-3" />
                {prizes.length} Prize{prizes.length !== 1 ? "s" : ""}
              </span>
            )}
            {/* Gate on tracking method, not on the sheet URL (which is not public) */}
            {isAuto && !registrationClosedYet && (
              <AnnouncementTrackingBadge announcementId={item.id} />
            )}
            {trackingStats?.hasError && (
              <span title={item.sync_error} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400/80 cursor-help">
                <AlertCircle className="w-3 h-3" />
                Sync Error
              </span>
            )}
          </div>

          {/* ── Author + tracking ── */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate" style={{ color: "rgb(var(--text-faint))" }}>
              By <span className="font-medium">{item.author}</span>
            </span>
            {trackingStats && (
              <span
                className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full shrink-0"
                style={{
                  background: `rgb(${trackingStats.rgb} / 0.10)`,
                  border: `1px solid rgb(${trackingStats.rgb} / 0.25)`,
                }}
              >
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ background: `rgb(${trackingStats.rgb} / 0.22)`, color: `rgb(${trackingStats.rgb})` }}
                >
                  <trackingStats.Icon className="w-3 h-3" />
                </span>
                <span className="font-bold tabular-nums" style={{ color: "rgb(var(--text-primary))" }}>
                  {trackingStats.count.toLocaleString()}
                </span>
                <span style={{ color: "rgb(var(--text-muted))" }}>{trackingStats.label.toLowerCase()}</span>
              </span>
            )}
          </div>

          {/* ── Actions ── */}
          {needsCode && (
            <div
              className="flex items-center justify-center gap-1.5 pt-3 text-xs font-medium"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgb(var(--text-muted))" }}
            >
              <Lock className="w-3.5 h-3.5" />
              Invite code required · tap to enter
            </div>
          )}
          {/* tapping bubbles up to the card, which opens the dialog where the join panel lives */}
          {canJoinNow && (
            <div className="pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <span
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-bold text-white"
                style={{ background: t.buttonGradient ?? "linear-gradient(135deg,#c026d3,#db2777)", boxShadow: t.buttonShadow }}
              >
                <Rocket className="w-3.5 h-3.5" />
                Join on Byteon
              </span>
            </div>
          )}
          {showLinks && renderLinkButtons("sm")}
        </CardContent>
      </Card>

      {/* ══════════════ DIALOG ══════════════ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-3xl max-h-[92vh] overflow-y-auto p-0"
          style={{
            color: "rgb(var(--text-primary))",
            background: "rgb(var(--bg-muted))",
            border: "rgb(var(--surface-raised))",
            borderRadius: "20px",
          }}
        >
          {/* ── Dialog Header ── */}
          <div
            className="sticky top-0 z-10 px-7 pt-7 pb-5"
            style={{
              color: "rgb(var(--text-primary))",
              background: "rgb(var(--bg-muted))",
              borderBottom: "rgb(var(--surface-raised))",
            }}
          >
            <DialogHeader>
              {item.organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "rgb(var(--text-primary))" }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.primaryText }}>
                    {item.organization}
                  </span>
                </div>
              )}
              <DialogTitle className="text-2xl font-bold leading-tight" style={{ color: "rgb(var(--text-primary))" }}>
                {item.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusPill phase={phase} item={item} t={t} />
                {isInvite && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-indigo-100/90 border-indigo-400/50 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/25 dark:text-indigo-300">
                    <Lock className="w-3 h-3" />
                    Invite only
                  </span>
                )}
                {native && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-fuchsia-100/90 border-fuchsia-400/50 text-fuchsia-600 dark:bg-fuchsia-500/10 dark:border-fuchsia-500/25 dark:text-fuchsia-300">
                    <Rocket className="w-3 h-3" />
                    Join on Byteon
                  </span>
                )}
                {native && isRandom && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-emerald-100/90 border-emerald-400/50 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/25 dark:text-emerald-300">
                    <Shuffle className="w-3 h-3" />
                    Random teams
                  </span>
                )}
                {prizes.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100/90 border-amber-500/50 text-amber-600 dark:bg-amber-500/10 border dark:border-amber-500/20 dark:text-amber-400/80">
                    <Trophy className="w-3 h-3" />
                    {prizes.length} Prize{prizes.length !== 1 ? "s" : ""} Available
                  </span>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="px-7 pb-7 space-y-6 pt-5">

            {/* ── Description ── */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>About</p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgb(var(--text-secondary))" }}>{item.des}</p>
            </div>

            {/* ── Prizes ── */}
            {prizes.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>Prize Pool</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prizes.map((prize, index) => {
                    const cs = getPrizeColorScheme(prize.name, prize.type)
                    return (
                      <div
                        key={index}
                        className={`bg-gradient-to-br ${cs.gradient} rounded-xl p-4 border ${cs.border} shadow-lg ${cs.glow} transition-transform duration-200 hover:scale-[1.02]`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl leading-none mt-0.5">{cs.rank}</span>
                          <div className="min-w-0">
                            <p className={`text-[10px] uppercase tracking-widest font-bold ${cs.label} mb-1`}>
                              {prize.name}
                              {prize.type === "non_cash" && <span className="ml-1.5 normal-case tracking-normal font-medium opacity-70">· item</span>}
                            </p>
                            <p className={`${prize.type === "non_cash" ? "text-base" : "text-xl"} font-bold ${cs.value} leading-tight break-words`}>
                              {prize.value}
                            </p>
                            {prize.description && (
                              <p className={`text-xs ${cs.label} mt-1.5 leading-relaxed opacity-80`}>
                                {prize.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Live tracking panel ── */}
            {trackingStats && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
                  Live Tracking
                </p>
                <div
                  className="relative overflow-hidden flex items-center gap-4 rounded-xl p-4"
                  style={{
                    background: `linear-gradient(135deg, rgb(${trackingStats.rgb} / 0.14), rgb(${trackingStats.rgb} / 0.03))`,
                    border: `1px solid rgb(${trackingStats.rgb} / 0.28)`,
                  }}
                >
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{ background: `rgb(${trackingStats.rgb} / 0.2)`, color: `rgb(${trackingStats.rgb})` }}
                  >
                    <trackingStats.Icon className="w-6 h-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tabular-nums leading-none" style={{ color: "rgb(var(--text-primary))" }}>
                        {trackingStats.count.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: `rgb(${trackingStats.rgb})` }}>
                        {trackingStats.label}
                      </span>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "rgb(var(--text-muted))" }}>{trackingStats.note}</p>
                  </div>
                  <Activity className="w-14 h-14 absolute -right-2 -bottom-2 opacity-[0.07]" style={{ color: `rgb(${trackingStats.rgb})` }} />
                </div>
              </div>
            )}

            {/* ── Event Details ── */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>Event Details</p>
              <div
                className="rounded-xl overflow-hidden divide-y divide-white/5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <DetailRow
                  icon={<Megaphone className="w-4 h-4" />}
                  label="Promotion starts"
                  value={item.promo_begin ? formatUTCDateTime(item.promo_begin) : null}
                  iconColor="#f59e0b"
                />
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Hackathon starts"
                  value={formatUTCDateTime(item.date_begin)}
                  iconColor={"rgb(var(--text-muted))"}
                />
                <DetailRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Ends"
                  value={formatUTCDateTime(item.date_end)}
                  iconColor={t.secondaryText}
                />
                {item.open_to && (
                  <DetailRow icon={<Users className="w-4 h-4" />} label="Open To" value={item.open_to} iconColor={t.labelText} />
                )}
                {item.countries && (
                  <DetailRow icon={<MapPin className="w-4 h-4" />} label="Location" value={item.countries} iconColor="#60a5fa" />
                )}
                <DetailRow
                  icon={<Lock className="w-4 h-4" />}
                  label="Access"
                  value={isInvite ? "Invite only — a code is required to join" : null}
                  iconColor="#818cf8"
                />
                <DetailRow
                  icon={<Rocket className="w-4 h-4" />}
                  label="Registration"
                  value={native
                    ? (isRandom
                        ? `Join directly on Byteon${needsForm ? " — fill in the registration form to register" : " — register"}; teams are assigned randomly by the organizer after registration`
                        : `Join directly on Byteon${needsForm ? " — fill in the registration form, then" : " —"} solo, as a project leader, with a team code, or request to join a team`)
                    : null}
                  iconColor="#d946ef"
                />
                <DetailRow icon={<Award className="w-4 h-4" />} label="Organized By" value={item.author} iconColor={t.labelText} />
              </div>
            </div>

            {/* ── Sync error notice ── */}
            {trackingStats?.hasError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide mb-0.5">Sync Error</p>
                  <p className="text-xs text-red-400/70">{item.sync_error}</p>
                </div>
              </div>
            )}
            {needsCode && <InviteCodeGate announcementId={item.id} onUnlock={setUnlockedLinks} />}

            {showFormPreview && (
              <RegistrationFormPreview
                fields={regForm}
                note={registrationClosedYet ? "Registration opens when promotion starts." : "Sign in below to fill it in."}
              />
            )}

            {canJoinNow && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
                  Join on Byteon
                </p>
                {isLoggedIn && user ? (
                  <div className="space-y-4">
                    {needsForm && !formDone && (
                      <RegistrationFormFill
                        key={user.id}
                        announcement={panelAnnouncement}
                        userId={user.id}
                        onSubmitted={() => setFormDone(true)}
                      />
                    )}
                    {(!needsForm || formDone) && (
                      isRandom ? (
                        <RandomJoinPanel
                          key={user.id}
                          announcement={panelAnnouncement}
                          userId={user.id}
                          displayName={displayName}
                          email={user.email}
                          autoJoin={needsForm}
                          onLeft={() => setFormDone(false)}
                        />
                      ) : (
                        <ParticipationPanel
                          key={user.id}
                          announcement={panelAnnouncement}
                          userId={user.id}
                          displayName={displayName}
                        />
                      )
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                  {isRandom && (
                    <div
                      className="flex items-start gap-2.5 rounded-xl p-3.5"
                      style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)" }}
                    >
                      <Shuffle className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
                      <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
                        <span className="font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Teams are assigned randomly.</span>{" "}
                        You don’t need a team to register — the organizer draws balanced random teams once registration is done.
                      </p>
                    </div>
                  )}
                  <div
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl p-4"
                    style={{ background: "rgba(217,70,239,0.08)", border: "1px solid rgba(217,70,239,0.28)" }}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 bg-fuchsia-500/15 text-fuchsia-500">
                      <LogIn className="w-5 h-5" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>Sign in to join</p>
                      <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                        {isRandom
                          ? "You need a Byteon account to register. Your team is assigned for you."
                          : "You need a Byteon account to join solo, create a team, or enter a team code."}
                      </p>
                    </div>
                    <a
                      href="/log-in"
                      className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-bold text-white"
                      style={{ background: t.buttonGradient ?? "linear-gradient(135deg,#c026d3,#db2777)" }}
                    >
                      Sign in
                    </a>
                  </div>
                  {/* everyone can see the groups that already exist; requesting needs an account.
                      In random mode teams only appear after the organizer draws them (see PublicTeams below). */}
                  {ann.allow_teams && !isRandom && <TeamDirectory announcementId={item.id} title="Teams already formed" />}
                  </div>
                )}
              </div>
            )}

            {/* random mode: everybody can see every group once the organizer has drawn them
                (not gated by allow_teams, which is usually false in random mode) */}
            {native && isRandom && !needsCode && (
              <PublicTeams announcementId={item.id} maxSize={ann.max_team_size} active={isDialogOpen} />
            )}

            {showLinks && renderLinkButtons("lg")}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}