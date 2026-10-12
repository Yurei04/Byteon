"use client"

import { useCallback, useEffect, useState } from "react"
import {
  User, Users, Crown, Copy, Check, RefreshCw, LogOut, Loader2, KeyRound, Plus, ArrowLeft,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Maps the error strings raised by the SQL functions to something readable.
const ERRORS = {
  not_authenticated:        "Please sign in first.",
  announcement_unavailable: "This hackathon isn't open for registration.",
  registration_closed:      "Registration for this hackathon has closed.",
  already_registered:       "You're already registered. Leave your current registration first.",
  teams_disabled:           "The organizer has turned off team registration.",
  invalid_team_name:        "Team names need 2–40 characters.",
  invalid_code:             "That 6-digit code doesn't match any team. Check it with your project leader.",
  no_codes_available:       "Couldn't generate a code. Please try again.",
  team_full:                "That team is full.",
  not_leader:               "Only the project leader can do this.",
}
const errMsg = (e) => ERRORS[e?.message?.trim()] ?? e?.message ?? "Something went wrong."

const fmtCode = (c) => c ?? ""   // plain 6 digits, shown exactly as stored

/**
 * Props
 *  announcement : { id, allow_teams, max_team_size, title }
 *  userId       : auth user id
 *  displayName  : name shown to teammates / organizer
 *  addToast     : (type, message) => void
 *  uiT          : optional theme tokens (same object the organizer form uses)
 */
export default function ParticipationPanel({ announcement, userId, displayName, addToast, uiT }) {
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(false)
  const [me, setMe]           = useState(null)      // my participant row (+ team)
  const [members, setMembers] = useState([])
  const [code, setCode]       = useState("")        // only populated for the leader
  const [copied, setCopied]   = useState(false)

  const [choice, setChoice]   = useState(null)      // null | "solo" | "group"
  const [groupMode, setGroupMode] = useState(null)  // null | "create" | "join"
  const [teamName, setTeamName]   = useState("")
  const [joinCode, setJoinCode]   = useState("")

  const teamsAllowed = announcement.allow_teams !== false
  const maxSize      = announcement.max_team_size ?? 4

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

  useEffect(() => { load() }, [load])

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      const { error } = await fn()
      if (error) throw error
      if (okMsg) addToast("success", okMsg)
      setChoice(null); setGroupMode(null); setTeamName(""); setJoinCode("")
      await load()
    } catch (e) { addToast("error", errMsg(e)) }
    setBusy(false)
  }

  const joinSolo   = () => run(() => supabase.rpc("register_solo", { p_announcement_id: announcement.id, p_display_name: displayName }), "You're registered as a solo participant.")
  const createTeam = () => run(() => supabase.rpc("create_team",  { p_announcement_id: announcement.id, p_name: teamName, p_display_name: displayName }), "Team created. Share the invite code with your groupmates.")
  const joinTeam   = () => run(() => supabase.rpc("join_team",    { p_announcement_id: announcement.id, p_code: joinCode, p_display_name: displayName }), "You joined the team.")
  const leave      = () => { if (window.confirm("Leave your current registration?")) run(() => supabase.rpc("leave_registration", { p_announcement_id: announcement.id }), "You left.") }
  const regenerate = () => {
    if (!window.confirm("Generate a new code? The old one will stop working.")) return
    run(() => supabase.rpc("regenerate_team_code", { p_team_id: me.team_id }), "New invite code generated.")
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(fmtCode(code)); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }

  // ── styles ────────────────────────────────────────────────────────────────
  const card = {
    background: uiT?.surfaceBg ?? "rgba(255,255,255,0.03)",
    border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}`,
  }
  const inputStyle = {
    background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
    borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)",
    color: uiT?.headingText ?? "#fff",
  }
  const heading = { color: uiT?.headingText }
  const muted   = { color: uiT?.mutedText }

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
    return (
      <div className="rounded-2xl p-5 space-y-4" style={card}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-400/15 border border-emerald-400/25">
              {me.participation_type === "solo"
                ? <User className="w-4 h-4 text-emerald-500" />
                : <Users className="w-4 h-4 text-emerald-500" />}
            </span>
            <div>
              <p className="text-sm font-semibold leading-none" style={heading}>
                {me.participation_type === "solo" ? "Registered as solo" : me.team?.name}
              </p>
              <p className="text-xs mt-1" style={muted}>
                {me.participation_type === "solo"
                  ? "You're competing on your own."
                  : `${members.length}/${maxSize} members · you're the ${isLeader ? "project leader" : "a member"}`}
              </p>
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={leave} disabled={busy}>
            <LogOut className="w-3.5 h-3.5 mr-1.5" /> Leave
          </Button>
        </div>

        {isLeader && (
          <div className="rounded-xl p-3 space-y-2" style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
            <p className="text-xs font-medium" style={muted}>Team invite code (6 digits) — share it only with your groupmates</p>
            <div className="flex items-center gap-2">
              <span className="flex-1 font-mono text-lg tracking-[0.35em] font-semibold select-all" style={heading}>{fmtCode(code)}</span>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={copy} disabled={!code}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button type="button" variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={regenerate} disabled={busy}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> New code
              </Button>
            </div>
          </div>
        )}

        {me.participation_type === "group" && (
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
      </div>
    )
  }

  // ── not registered yet ───────────────────────────────────────────────────
  const OptionCard = ({ id, icon: Icon, title, sub, disabled }) => (
    <button
      type="button" disabled={disabled}
      onClick={() => { setChoice(id); setGroupMode(null) }}
      className={`flex-1 text-left p-4 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${choice === id ? "ring-2 ring-fuchsia-500/60" : ""}`}
      style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)" }}
    >
      <Icon className="w-5 h-5 mb-2" style={heading} />
      <p className="text-sm font-semibold" style={heading}>{title}</p>
      <p className="text-xs mt-0.5" style={muted}>{sub}</p>
    </button>
  )

  return (
    <div className="rounded-2xl p-5 space-y-4" style={card}>
      <div>
        <p className="text-sm font-semibold" style={heading}>How are you joining?</p>
        <p className="text-xs mt-0.5" style={muted}>
          This doesn't replace registration. Still register through the links on this page, then tell us here whether you're solo or in a group.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <OptionCard id="solo" icon={User} title="Solo" sub="Compete on your own" />
        <OptionCard
          id="group" icon={Users} title="With a group"
          sub={teamsAllowed ? `Teams of up to ${maxSize}` : "Not offered for this hackathon"}
          disabled={!teamsAllowed}
        />
      </div>

      {choice === "solo" && (
        <Button type="button" onClick={joinSolo} disabled={busy} className="w-full rounded-xl h-10 text-white border-0 bg-fuchsia-600 hover:bg-fuchsia-500">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join as solo"}
        </Button>
      )}

      {choice === "group" && !groupMode && (
        <div className="grid sm:grid-cols-2 gap-3">
          <button type="button" onClick={() => setGroupMode("create")}
            className="p-4 rounded-xl border text-left transition-all hover:opacity-90"
            style={{ borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)" }}>
            <Plus className="w-4 h-4 mb-1.5" style={heading} />
            <p className="text-sm font-semibold" style={heading}>I'm the project leader</p>
            <p className="text-xs mt-0.5" style={muted}>Create a team and get an invite code for your groupmates.</p>
          </button>
          <button type="button" onClick={() => setGroupMode("join")}
            className="p-4 rounded-xl border text-left transition-all hover:opacity-90"
            style={{ borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)" }}>
            <KeyRound className="w-4 h-4 mb-1.5" style={heading} />
            <p className="text-sm font-semibold" style={heading}>I have an invite code</p>
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
          <Button type="button" onClick={createTeam} disabled={busy || teamName.trim().length < 2}
            className="w-full rounded-xl h-10 text-white border-0 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create team & get invite code"}
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
          <Button type="button" onClick={joinTeam} disabled={busy || joinCode.length !== 6}
            className="w-full rounded-xl h-10 text-white border-0 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-40">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Join team"}
          </Button>
        </div>
      )}
    </div>
  )
}