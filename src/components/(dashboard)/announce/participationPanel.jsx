"use client"

import { useCallback, useEffect, useState } from "react"
import {
  User, Users, Crown, Copy, Check, RefreshCw, LogOut, Loader2, KeyRound, Plus,
  ArrowLeft, Search, Megaphone, MessageCircle, ExternalLink, Trophy,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Maps the error strings raised by the SQL functions to something readable.
const ERRORS = {
  not_authenticated:        "Please sign in first.",
  native_disabled:          "This hackathon uses an external registration link instead.",
  announcement_unavailable: "This hackathon isn't open for registration.",
  registration_closed:      "Registration for this hackathon has closed.",
  already_registered:       "You're already in a team. Leave it first to change your choice.",
  teams_disabled:           "The organizer has turned off team registration.",
  invalid_team_name:        "Team names need 2–40 characters.",
  invalid_code:             "That 6-digit code doesn't match any team. Check it with your project leader.",
  team_full:                "That team is full.",
  not_leader:               "Only the project leader can do this.",
  no_codes_available:       "Couldn't generate a code. Please try again.",
}
const errMsg = (e) => ERRORS[e?.message?.trim()] ?? e?.message ?? "Something went wrong."

const isHttp = (u) => /^https?:\/\//i.test(u ?? "")

// Promotion = before the hackathon starts. Registration is OPEN in both promo and live phases.
function getPhase(a) {
  const now   = Date.now()
  const start = a.date_begin ? new Date(a.date_begin).getTime() : null
  const end   = a.date_end   ? new Date(a.date_end).getTime()   : null
  if (end && now > end)     return "closed"
  if (start && now < start) return "promo"
  return "live"
}

const PHASES = {
  promo:  { label: "Promotion · registration open", icon: Megaphone, cls: "bg-amber-400/15 text-amber-600 dark:text-amber-300 border-amber-400/30" },
  live:   { label: "Hackathon live",                icon: Trophy,    cls: "bg-emerald-400/15 text-emerald-600 dark:text-emerald-300 border-emerald-400/30" },
  closed: { label: "Registration closed",           icon: Trophy,    cls: "bg-slate-400/15 text-slate-500 border-slate-400/30" },
}

/**
 * Props
 *  announcement : { id, allow_teams, max_team_size, community_link, promo_begin, date_begin, date_end }
 *  userId       : auth user id
 *  displayName  : name shown to teammates / organizer
 *  addToast     : (type, message) => void
 *  uiT          : optional theme tokens
 */
export default function ParticipationPanel({ announcement, userId, displayName, addToast, uiT }) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [me, setMe]           = useState(null)
  const [members, setMembers] = useState([])
  const [code, setCode]       = useState("")
  const [copied, setCopied]   = useState(false)
  const [notice, setNotice]   = useState(null)   // inline message when no addToast is provided

  const [choice, setChoice]       = useState(null)   // null | "solo" | "group" | "looking"
  const [groupMode, setGroupMode] = useState(null)   // null | "create" | "join"
  const [teamName, setTeamName]   = useState("")
  const [joinCode, setJoinCode]   = useState("")

  const notify = (type, msg) => (addToast ? addToast(type, msg) : setNotice({ type, msg }))
  const teamsAllowed = announcement.allow_teams !== false
  const maxSize      = announcement.max_team_size ?? 4
  const phase        = getPhase(announcement)
  const closed       = phase === "closed"
  const PhaseIcon    = PHASES[phase].icon

  const load = useCallback(async () => {
    setLoading(true)
    const { data: row } = await supabase
      .from("announcement_participants")
      .select("*, team:announcement_teams(id, name, leader_id)")
      .eq("announcement_id", announcement.id)
      .eq("user_id", userId)
      .maybeSingle()
    setMe(row ?? null)

    if (row?.team_id) {
      const { data: m } = await supabase
        .from("announcement_participants")
        .select("user_id, display_name, role, joined_at")
        .eq("team_id", row.team_id)
        .order("joined_at")
      setMembers(m ?? [])
      if (row.role === "leader") {
        const { data: c } = await supabase
          .from("announcement_team_codes").select("invite_code").eq("team_id", row.team_id).maybeSingle()
        setCode(c?.invite_code ?? "")
      } else setCode("")
    } else { setMembers([]); setCode("") }
    setLoading(false)
  }, [announcement.id, userId])

  useEffect(() => { load() }, [load]) // eslint-disable-line react-hooks/set-state-in-effect

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      const { error } = await fn()
      if (error) throw error
      if (okMsg) notify("success", okMsg)
      setChoice(null); setGroupMode(null); setTeamName(""); setJoinCode("")
      await load()
    } catch (e) { notify("error", errMsg(e)) }
    setBusy(false)
  }

  const rpc = (name, args) => () => supabase.rpc(name, { p_announcement_id: announcement.id, ...args })
  const joinSolo    = () => run(rpc("register_solo",    { p_display_name: displayName }), "You're registered as a solo participant.")
  const joinLooking = () => run(rpc("register_looking", { p_display_name: displayName }), "Got it — you're marked as looking for a team.")
  const createTeam  = () => run(rpc("create_team",      { p_name: teamName, p_display_name: displayName }), "Team created. Share the 6-digit code with your groupmates.")
  const joinTeam    = () => run(rpc("join_team",        { p_code: joinCode, p_display_name: displayName }), "You joined the team.")
  const leave       = () => { if (window.confirm("Leave your current registration?")) run(rpc("leave_registration", {}), "You left.") }
  const regenerate  = () => {
    if (!window.confirm("Generate a new code? The old one will stop working.")) return
    run(() => supabase.rpc("regenerate_team_code", { p_team_id: me.team_id }), "New invite code generated.")
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }

  // ── styles ────────────────────────────────────────────────────────────────
  const card = {
    background: uiT?.surfaceBg ?? "rgba(255,255,255,0.03)",
    border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}`,
  }
  const inner = {
    background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)",
    border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}`,
  }
  const inputStyle = {
    background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
    borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)",
    color: uiT?.headingText ?? "#fff",
  }
  const heading = { color: uiT?.headingText }
  const muted   = { color: uiT?.mutedText }

  const noticeEl = notice && (
    <p className="text-xs rounded-lg px-3 py-2"
      style={notice.type === "error"
        ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }
        : { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#10b981" }}>
      {notice.msg}
    </p>
  )

  const PhaseBadge = () => (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border ${PHASES[phase].cls}`}>
      <PhaseIcon className="w-3 h-3" />{PHASES[phase].label}
    </span>
  )

  // Community link: shown to everyone who has registered in any way.
  const communityCard = isHttp(announcement.community_link) && (
    <a
      href={announcement.community_link} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:opacity-90"
      style={{ background: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.30)" }}
    >
      <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-400/15 border border-indigo-400/25 shrink-0">
        <MessageCircle className="w-4 h-4 text-indigo-500 dark:text-indigo-300" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold" style={heading}>Join the community</span>
        <span className="block text-[11px]" style={muted}>Discord / Telegram / WhatsApp — updates, teammates and announcements.</span>
      </span>
      <ExternalLink className="w-4 h-4 shrink-0" style={muted} />
    </a>
  )

  if (loading) {
    return (
      <div className="rounded-2xl p-8 flex justify-center" style={card}>
        <Loader2 className="w-5 h-5 animate-spin" style={muted} />
      </div>
    )
  }

  // ── already registered ───────────────────────────────────────────────────
  if (me) {
    const isLeader = me.role === "leader"
    const isGroup  = me.participation_type === "group"
    const Icon     = isGroup ? Users : me.participation_type === "looking" ? Search : User
    const title    = isGroup ? me.team?.name : me.participation_type === "looking" ? "Looking for a team" : "Registered as solo"
    const sub      = isGroup
      ? `${members.length}/${maxSize} members · you're ${isLeader ? "the project leader" : "a member"}`
      : me.participation_type === "looking"
        ? "The organizer can see you want to be placed in a team."
        : "You're competing on your own."

    return (
      <div className="rounded-2xl p-5 space-y-4" style={card}>
        {noticeEl}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-400/15 border border-emerald-400/25 shrink-0">
              <Icon className="w-4 h-4 text-emerald-500" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none truncate" style={heading}>{title}</p>
              <p className="text-xs mt-1" style={muted}>{sub}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <PhaseBadge />
            <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={leave} disabled={busy || closed}>
              <LogOut className="w-3.5 h-3.5 mr-1.5" /> Leave
            </Button>
          </div>
        </div>

        {communityCard}

        {isLeader && (
          <div className="rounded-xl p-3 space-y-2" style={inner}>
            <p className="text-xs font-medium" style={muted}>Team invite code (6 digits) — share it only with your groupmates</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex-1 font-mono text-2xl tracking-[0.35em] font-semibold select-all" style={heading}>{code}</span>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={copy} disabled={!code}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={regenerate} disabled={busy || closed}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New code
              </Button>
            </div>
          </div>
        )}

        {isGroup && (
          <ul className="space-y-1.5">
            {members.map((m) => (
              <li key={m.user_id} className="flex items-center gap-2 text-sm" style={heading}>
                {m.role === "leader"
                  ? <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  : <User className="w-3.5 h-3.5 shrink-0" style={muted} />}
                <span className="truncate">{m.display_name || "Unnamed participant"}</span>
                {m.user_id === userId && <span className="text-[11px]" style={muted}>(you)</span>}
              </li>
            ))}
          </ul>
        )}

        {/* solo / looking can still join a team with a code, or switch between the two */}
        {!isGroup && teamsAllowed && !closed && (
          <div className="rounded-xl p-3 space-y-2" style={inner}>
            <p className="text-xs font-medium" style={muted}>Got a team code from your project leader?</p>
            <div className="flex items-center gap-2">
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456" inputMode="numeric" maxLength={6} autoComplete="off"
                className="rounded-xl font-mono tracking-widest" style={inputStyle}
              />
              <Button type="button" onClick={joinTeam} disabled={busy || joinCode.length !== 6}
                className="rounded-xl h-9 text-white border-0 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join team"}
              </Button>
            </div>
            <div className="flex gap-3 text-xs">
              {me.participation_type === "solo" && (
                <button type="button" onClick={joinLooking} disabled={busy} className="underline underline-offset-2" style={muted}>I'd rather be matched with a team</button>
              )}
              {me.participation_type === "looking" && (
                <button type="button" onClick={joinSolo} disabled={busy} className="underline underline-offset-2" style={muted}>Switch to solo</button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── not registered yet ───────────────────────────────────────────────────
  if (closed) {
    return (
      <div className="rounded-2xl p-5 space-y-3" style={card}>
        <PhaseBadge />
        <p className="text-sm" style={muted}>Registration for this hackathon has closed.</p>
      </div>
    )
  }

  const OptionCard = ({ id, icon: Icon, title, sub, disabled }) => (
    <button
      type="button" disabled={disabled}
      onClick={() => { setChoice(id); setGroupMode(null) }}
      className={`flex-1 text-left p-4 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${choice === id ? "ring-2 ring-fuchsia-500/60" : ""}`}
      style={{ ...inner, borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)" }}
    >
      <Icon className="w-5 h-5 mb-2" style={heading} />
      <p className="text-sm font-semibold" style={heading}>{title}</p>
      <p className="text-xs mt-0.5" style={muted}>{sub}</p>
    </button>
  )

  const primaryBtn = "w-full rounded-xl h-10 text-white border-0 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40"

  return (
    <div className="rounded-2xl p-5 space-y-4" style={card}>
        {noticeEl}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={heading}>How are you joining?</p>
          <p className="text-xs mt-0.5" style={muted}>
            Registration is open now — you don't need to wait for the hackathon to start. You'll see the community link right after you choose.
          </p>
        </div>
        <PhaseBadge />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <OptionCard id="solo" icon={User} title="Solo" sub="Compete on your own" />
        <OptionCard
          id="group" icon={Users} title="With a group"
          sub={teamsAllowed ? `Teams of up to ${maxSize}` : "Not offered for this hackathon"}
          disabled={!teamsAllowed}
        />
        <OptionCard id="looking" icon={Search} title="Looking for a team" sub="Get matched by the organizer" />
      </div>

      {choice === "solo" && (
        <Button type="button" onClick={joinSolo} disabled={busy} className={primaryBtn}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join as solo"}
        </Button>
      )}

      {choice === "looking" && (
        <Button type="button" onClick={joinLooking} disabled={busy} className={primaryBtn}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "I'm looking for a team"}
        </Button>
      )}

      {choice === "group" && !groupMode && (
        <div className="grid sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => setGroupMode("create")}
            className="p-4 rounded-xl border text-left transition-all hover:opacity-90"
            style={{ borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)" }}>
            <Plus className="w-4 h-4 mb-1.5" style={heading} />
            <p className="text-sm font-semibold" style={heading}>I'm the project leader</p>
            <p className="text-xs mt-0.5" style={muted}>Create a team and get a 6-digit code for your groupmates.</p>
          </button>
          <button type="button" onClick={() => setGroupMode("join")}
            className="p-4 rounded-xl border text-left transition-all hover:opacity-90"
            style={{ borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)" }}>
            <KeyRound className="w-4 h-4 mb-1.5" style={heading} />
            <p className="text-sm font-semibold" style={heading}>I have a code</p>
            <p className="text-xs mt-0.5" style={muted}>Join the team your project leader created.</p>
          </button>
        </div>
      )}

      {choice === "group" && groupMode === "create" && (
        <div className="space-y-3">
          <button type="button" onClick={() => setGroupMode(null)} className="text-xs flex items-center gap-1" style={muted}>
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="space-y-1.5">
            <Label className="text-sm" style={muted}>Team name</Label>
            <Input value={teamName} onChange={(e) => setTeamName(e.target.value.slice(0, 40))}
              placeholder="e.g. Byte Me" className="rounded-xl" style={inputStyle} />
          </div>
          <Button type="button" onClick={createTeam} disabled={busy || teamName.trim().length < 2} className={primaryBtn}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create team & generate my code"}
          </Button>
        </div>
      )}

      {choice === "group" && groupMode === "join" && (
        <div className="space-y-3">
          <button type="button" onClick={() => setGroupMode(null)} className="text-xs flex items-center gap-1" style={muted}>
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <div className="space-y-1.5">
            <Label className="text-sm" style={muted}>Team invite code (6 digits)</Label>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456" inputMode="numeric" maxLength={6} spellCheck={false} autoComplete="off"
              className="rounded-xl font-mono tracking-widest" style={inputStyle}
            />
          </div>
          <Button type="button" onClick={joinTeam} disabled={busy || joinCode.length !== 6} className={primaryBtn}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join team"}
          </Button>
        </div>
      )}
    </div>
  )
}