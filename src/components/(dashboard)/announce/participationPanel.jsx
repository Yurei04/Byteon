"use client"

import { useCallback, useEffect, useState } from "react"
import {
  User, Users, Crown, Search, KeyRound, Loader2, Copy, Check, RefreshCw,
  LogOut, X, MessageCircle, ArrowUpRight, CheckCircle2, AlertCircle,
} from "lucide-react"
import TeamDirectory from "./team-directory"
import * as api from "@/lib/teamApi"

/**
 * "Join on Byteon" panel.
 *   Solo · Project leader (creates a team → unique 6-digit code) ·
 *   Looking for a team (browse teams, send a request) · I already have a team (enter the code)
 * All writes go through the SQL functions in team-system.sql.
 */
export default function ParticipationPanel({ announcement }) {
  const allowTeams = !!announcement.allow_teams
  const maxSize    = announcement.max_team_size ?? 4

  const [data, setData]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState("")
  const [msg, setMsg]           = useState(null)      // { type: "error" | "ok", text }
  const [mode, setMode]         = useState(null)      // "create" | "code"
  const [changing, setChanging] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [code, setCode]         = useState("")
  const [copied, setCopied]     = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const load = useCallback(async () => {
    const res = await api.getMine(announcement.id)
    if (res.ok) setData(res); else setMsg({ type: "error", text: res.error })
    setLoading(false)
  }, [announcement.id])
  useEffect(() => { load() }, [load])

  const run = async (key, call, after) => {
    setBusy(key); setMsg(null)
    const res = await call()
    setBusy("")
    if (!res.ok) { setMsg({ type: "error", text: res.error }); await load(); return }
    after?.(res)
    setChanging(false); setMode(null)
    await load(); setRefreshKey(k => k + 1)
  }

  const goSolo    = () => run("solo",    () => api.setParticipation(announcement.id, "solo"))
  const goLooking = () => run("looking", () => api.setParticipation(announcement.id, "looking"))
  const create    = (e) => { e.preventDefault(); run("create", () => api.createTeam(announcement.id, teamName), () => setTeamName("")) }
  const joinCode  = (e) => { e.preventDefault(); run("code", () => api.joinWithCode(announcement.id, code),
                      (r) => { setCode(""); setMsg({ type: "ok", text: `You joined “${r.team_name}”.` }) }) }
  const request   = (team) => run(`req-${team.team_id}`, () => api.requestJoin(team.team_id),
                      () => setMsg({ type: "ok", text: `Request sent to the leader of “${team.name}”.` }))
  const cancelReq = (id) => run(`cancel-${id}`, () => api.cancelRequest(id))
  const respond   = (id, accept) => run(`resp-${id}`, () => api.respondRequest(id, accept))
  const newCode   = () => { if (window.confirm("Generate a new code? The old one will stop working.")) run("regen", () => api.regenerateCode(data.team.id)) }
  const leave     = () => {
    const warn = data.role === "leader" && data.members.length > 1
      ? "Leave your team? Leadership will pass to the next member."
      : data.role === "leader" ? "Leave and delete your team?" : "Leave this team?"
    if (window.confirm(warn)) run("leave", () => api.setParticipation(announcement.id, "looking"))
  }
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }

  const primary   = { color: "rgb(var(--text-primary))" }
  const secondary = { color: "rgb(var(--text-secondary))" }
  const muted     = { color: "rgb(var(--text-muted))" }
  const border    = "1px solid rgb(var(--surface-border) / 0.5)"
  const inputCls  = "w-full rounded-lg px-3 py-2 text-sm outline-none border bg-transparent"
  const inputSt   = { borderColor: "rgb(var(--surface-border) / 0.6)", color: "rgb(var(--text-primary))" }
  const gradient  = "linear-gradient(135deg,#c026d3,#db2777)"
  const Btn = ({ children, onClick, type = "button", k, tone = "primary", disabled }) => (
    <button
      type={type} onClick={onClick} disabled={!!busy || disabled}
      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold disabled:opacity-50 transition-opacity"
      style={tone === "primary"
        ? { background: gradient, color: "#fff" }
        : tone === "danger"
          ? { border: "1px solid rgba(248,113,113,0.4)", color: "#f87171" }
          : { border, ...secondary }}
    >
      {busy === k && <Loader2 className="w-3.5 h-3.5 animate-spin" />}{children}
    </button>
  )

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin" style={muted} /></div>

  const inTeam     = !!data?.team
  const registered = !!data?.type
  const showChooser = !registered || changing

  const options = [
    { key: "solo", Icon: User, title: "Solo", sub: "Join on my own", onClick: goSolo },
    ...(allowTeams ? [
      { key: "create",  Icon: Crown,    title: "Project leader",       sub: "Create a team & get an invite code", onClick: () => setMode("create"), hide: inTeam },
      { key: "looking", Icon: Search,   title: "Looking for a team",   sub: "Browse teams & send a request",      onClick: goLooking },
      { key: "code",    Icon: KeyRound, title: "I already have a team", sub: "Enter my team’s 6-digit code",       onClick: () => setMode("code"),   hide: inTeam },
    ] : []),
  ].filter(o => !o.hide)

  return (
    <div className="space-y-4">
      {msg && (
        <div className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 text-xs"
          style={msg.type === "error"
            ? { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.28)", color: "#f87171" }
            : { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.28)", color: "#10b981" }}>
          {msg.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span className="flex-1">{msg.text}</span>
          <button type="button" onClick={() => setMsg(null)}><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      {/* ───────── choose how to take part ───────── */}
      {showChooser && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold" style={primary}>{registered ? "Change how you take part" : "How do you want to take part?"}</p>
            {changing && <button type="button" className="text-xs underline" style={muted} onClick={() => { setChanging(false); setMode(null) }}>Cancel</button>}
          </div>
          {changing && inTeam && <p className="text-xs" style={muted}>Switching to solo or “looking” removes you from your current team.</p>}

          <div className="grid gap-2 sm:grid-cols-2">
            {options.map(({ key, Icon, title, sub, onClick }) => {
              const active = mode === key
              return (
                <button key={key} type="button" onClick={onClick} disabled={!!busy}
                  className="flex items-center gap-3 rounded-xl p-3 text-left transition-all hover:-translate-y-px disabled:opacity-60"
                  style={{ background: active ? "rgba(217,70,239,0.10)" : "rgba(255,255,255,0.03)", border: active ? "1px solid rgba(217,70,239,0.5)" : border }}>
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-fuchsia-500/15 text-fuchsia-500">
                    {busy === key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold" style={primary}>{title}</span>
                    <span className="block text-[11px]" style={muted}>{sub}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {mode === "create" && (
            <form onSubmit={create} className="rounded-xl p-4 space-y-3" style={{ background: "rgba(217,70,239,0.06)", border: "1px solid rgba(217,70,239,0.25)" }}>
              <div>
                <label className="text-xs font-semibold" style={secondary}>Group name</label>
                <input className={`${inputCls} mt-1`} style={inputSt} value={teamName} maxLength={40} autoFocus
                  placeholder="e.g. Null Pointers" onChange={e => setTeamName(e.target.value)} />
              </div>
              <p className="text-[11px]" style={muted}>
                You become the project leader. We’ll generate a unique 6-digit code for your teammates (up to {maxSize} members including you).
              </p>
              <Btn type="submit" k="create" disabled={teamName.trim().length < 2}>Create team & get code</Btn>
            </form>
          )}

          {mode === "code" && (
            <form onSubmit={joinCode} className="rounded-xl p-4 space-y-3" style={{ background: "rgba(217,70,239,0.06)", border: "1px solid rgba(217,70,239,0.25)" }}>
              <div>
                <label className="text-xs font-semibold" style={secondary}>Team code from your project leader</label>
                <input className={`${inputCls} mt-1 font-mono tracking-[0.4em] text-center text-lg`} style={inputSt}
                  value={code} inputMode="numeric" autoComplete="off" autoFocus maxLength={6} placeholder="••••••"
                  onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} />
              </div>
              <Btn type="submit" k="code" disabled={!api.CODE_RE.test(code)}>Join team</Btn>
            </form>
          )}
        </div>
      )}

      {/* ───────── current status ───────── */}
      {registered && !changing && (
        <div className="rounded-xl p-4 space-y-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold" style={primary}>
                  {data.type === "solo" && "You’re registered · Solo"}
                  {data.type === "looking" && "You’re registered · Looking for a team"}
                  {data.type === "group" && <>You’re registered · {data.role === "leader" ? "Project leader of" : "Member of"} “{data.team?.name}”</>}
                </p>
                {data.type === "looking" && <p className="text-xs" style={muted}>Send a request to any team below, or ask a leader for their code.</p>}
              </div>
            </div>
            <button type="button" onClick={() => { setChanging(true); setMode(null); setMsg(null) }}
              className="text-xs font-semibold underline underline-offset-2 shrink-0" style={secondary}>Change</button>
          </div>

          {/* team card (leader or member) */}
          {inTeam && (
            <div className="space-y-3">
              {data.role === "leader" && data.code && (
                <div className="rounded-xl p-3 flex flex-wrap items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", border }}>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest font-semibold" style={muted}>Team code — share with your teammates</p>
                    <p className="font-mono text-2xl font-bold tracking-[0.3em]" style={primary}>{data.code}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Btn tone="ghost" onClick={copy}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? "Copied" : "Copy"}</Btn>
                    <Btn tone="ghost" k="regen" onClick={newCode}><RefreshCw className="w-3.5 h-3.5" />New code</Btn>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={muted}>
                  Members · {data.members.length}/{maxSize}
                </p>
                <div className="space-y-1">
                  {data.members.map(m => (
                    <div key={m.user_id} className="flex items-center gap-2 text-sm" style={secondary}>
                      {m.role === "leader" ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <User className="w-3.5 h-3.5" style={muted} />}
                      {m.name || "Unnamed"}
                    </div>
                  ))}
                </div>
              </div>

              {data.role === "leader" && data.incoming.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={muted}>Join requests · {data.incoming.length}</p>
                  <div className="space-y-2">
                    {data.incoming.map(r => (
                      <div key={r.id} className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border }}>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate" style={primary}>{r.name || "Someone"}</p>
                          {r.message && <p className="text-[11px] truncate" style={muted}>“{r.message}”</p>}
                        </div>
                        <Btn k={`resp-${r.id}`} onClick={() => respond(r.id, true)}>Accept</Btn>
                        <Btn tone="ghost" onClick={() => respond(r.id, false)}>Decline</Btn>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Btn tone="danger" k="leave" onClick={leave}><LogOut className="w-3.5 h-3.5" />Leave team</Btn>
            </div>
          )}

          {/* my pending requests */}
          {!inTeam && data.outgoing.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5" style={muted}>Your pending requests</p>
              <div className="space-y-1.5">
                {data.outgoing.map(r => (
                  <div key={r.id} className="flex items-center justify-between gap-3 text-sm rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border }}>
                    <span className="truncate" style={secondary}><Users className="w-3.5 h-3.5 inline mr-1.5" style={muted} />{r.team_name} — waiting for the leader</span>
                    <button type="button" disabled={!!busy} onClick={() => cancelReq(r.id)} className="text-xs underline shrink-0" style={muted}>Cancel</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {announcement.community_link && (
            <a href={announcement.community_link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-500">
              <MessageCircle className="w-3.5 h-3.5" />Join the community<ArrowUpRight className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* ───────── all teams (anyone not in a team can send a request) ───────── */}
      {allowTeams && !inTeam && (
        <TeamDirectory
          announcementId={announcement.id}
          title="Teams — send a request to join"
          canRequest
          pendingIds={(data?.outgoing ?? []).map(o => o.team_id)}
          busyKey={busy}
          onRequest={request}
          refreshKey={refreshKey}
        />
      )}
    </div>
  )
}