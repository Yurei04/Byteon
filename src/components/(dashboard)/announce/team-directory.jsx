"use client"

import { useEffect, useState } from "react"
import { Users, Search, Loader2, Crown, Check } from "lucide-react"
import { listTeams } from "@/lib/teamApi"

/**
 * Lists every group (name, leader, seats) of an announcement.
 * Read-only by default; with `canRequest` each open team gets a "Request to join" button
 * (the leader is notified and can accept or decline).
 */
export default function TeamDirectory({
  announcementId, canRequest = false, pendingIds = [], busyKey = "", onRequest, refreshKey = 0,
  title = "Teams",
}) {
  const [teams, setTeams] = useState(null)
  const [q, setQ] = useState("")

  useEffect(() => {
    let alive = true
    listTeams(announcementId).then(t => { if (alive) setTeams(t) })
    return () => { alive = false }
  }, [announcementId, refreshKey])

  const muted = { color: "rgb(var(--text-muted))" }
  const primary = { color: "rgb(var(--text-primary))" }
  const border = "1px solid rgb(var(--surface-border) / 0.5)"

  const shown = (teams ?? []).filter(t => !q.trim() || t.name.toLowerCase().includes(q.trim().toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[11px] uppercase tracking-wider font-semibold" style={muted}>
          {title}{teams ? ` · ${teams.length}` : ""}
        </p>
        {teams && teams.length > 6 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={muted} />
            <input
              value={q} onChange={e => setQ(e.target.value)} placeholder="Search teams"
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-transparent outline-none w-40"
              style={{ border, ...primary }}
            />
          </div>
        )}
      </div>

      {teams === null ? (
        <div className="flex justify-center py-6"><Loader2 className="w-4 h-4 animate-spin" style={muted} /></div>
      ) : teams.length === 0 ? (
        <p className="text-xs rounded-xl px-4 py-5 text-center" style={{ ...muted, border: "1px dashed rgb(var(--surface-border) / 0.6)" }}>
          No teams yet — be the first project leader to create one.
        </p>
      ) : shown.length === 0 ? (
        <p className="text-xs text-center py-4" style={muted}>No teams match “{q}”.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 max-h-72 overflow-y-auto pr-1">
          {shown.map(t => {
            const full = t.member_count >= t.max_size
            const pending = pendingIds.includes(t.team_id)
            const busy = busyKey === `req-${t.team_id}`
            return (
              <div key={t.team_id} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,255,255,0.03)", border }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-500">
                  <Users className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate" style={primary}>{t.name}</p>
                  <p className="text-[11px] truncate flex items-center gap-1" style={muted}>
                    {t.leader_name && <><Crown className="w-3 h-3 text-amber-500 shrink-0" />{t.leader_name} · </>}
                    {t.member_count}/{t.max_size}{full ? " · full" : ""}
                  </p>
                </div>
                {canRequest && (
                  pending ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-500 shrink-0">
                      <Check className="w-3 h-3" />Requested
                    </span>
                  ) : full ? null : (
                    <button
                      type="button" disabled={!!busyKey} onClick={() => onRequest?.(t)}
                      className="shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg,#c026d3,#db2777)" }}
                    >
                      {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Request"}
                    </button>
                  )
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}