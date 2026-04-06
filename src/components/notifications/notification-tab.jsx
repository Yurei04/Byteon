"use client"

// components/notifications/NotificationsTab.jsx
import { useNotifications } from "./use-notification" 
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Bell, BellRing, CheckCheck, Trash2, X, Loader2,
  ShieldOff, ShieldCheck, CheckCircle, XCircle,
  Trash, Building2, FileText,
} from "lucide-react"

// ── Per-type icon + color config ──────────────────────────────────────────────
const TYPE_CONFIG = {
  account_suspended:      { Icon: ShieldOff,   color: "text-amber-400",   bg: "bg-amber-500/12",   border: "border-amber-500/20",   label: "Account Suspended"       },
  account_reactivated:    { Icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/12", border: "border-emerald-500/20", label: "Account Reactivated"     },
  post_approved:          { Icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/12", border: "border-emerald-500/20", label: "Post Approved"           },
  post_rejected:          { Icon: XCircle,     color: "text-red-400",     bg: "bg-red-500/12",     border: "border-red-500/20",     label: "Post Rejected"           },
  post_deleted_by_admin:  { Icon: Trash,       color: "text-rose-400",    bg: "bg-rose-500/12",    border: "border-rose-500/20",    label: "Content Removed"         },
  content_deleted_by_org: { Icon: Building2,   color: "text-sky-400",     bg: "bg-sky-500/12",     border: "border-sky-500/20",     label: "Org Deleted Content"     },
  blog_deleted_by_user:   { Icon: FileText,    color: "text-violet-400",  bg: "bg-violet-500/12",  border: "border-violet-500/20",  label: "User Deleted Blog"       },
}

function relativeTime(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return "just now"
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationsTab({ userId, role }) {
  const {
    notifications,
    unreadCount,
    loading,
    isReadByMe,
    markRead,
    markAllRead,
    deleteOne,
    clearAll,
  } = useNotifications({ userId, role })

  return (
    <div className="flex flex-col h-full gap-4">

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {unreadCount > 0
            ? <BellRing className="w-5 h-5 text-fuchsia-400" />
            : <Bell className="w-5 h-5 text-white/30" />
          }
          <div>
            <h3 className="text-sm font-semibold text-white">
              {unreadCount > 0
                ? <><span className="text-fuchsia-300">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}</>
                : "All caught up"}
            </h3>
            <p className="text-white/25 text-xs mt-0.5">{notifications.length} total notification{notifications.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" onClick={markAllRead} variant="ghost"
              className="h-8 px-3 text-xs text-white/45 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 gap-1.5 transition-all">
              <CheckCheck className="w-3.5 h-3.5" />Mark all read
            </Button>
          )}
          {notifications.some(n => n.recipient_user_id === userId) && (
            <Button size="sm" onClick={clearAll} variant="ghost"
              className="h-8 px-3 text-xs text-white/45 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 gap-1.5 transition-all">
              <Trash2 className="w-3.5 h-3.5" />Clear all
            </Button>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400/60" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-white/15 select-none">
          <div className="w-16 h-16 rounded-2xl border border-white/8 bg-white/3 flex items-center justify-center">
            <Bell className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/20">No notifications yet</p>
            <p className="text-xs text-white/10 mt-1">Activity and alerts will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 h-[580px]">

          {/* ── LEFT — notification list ── */}
          <div className="flex-1 rounded-2xl border border-white/8 bg-black/20 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-400">Inbox</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">

              <div className="divide-y divide-white/5">
                {notifications.map((n) => {
                  const read   = isReadByMe(n)
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.post_approved
                  const { Icon } = config

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`group relative flex items-start gap-3 px-4 py-4 cursor-pointer transition-all duration-150
                        ${read ? "hover:bg-white/3" : "bg-white/[0.03] hover:bg-white/5"}`}
                    >
                      {/* unread pulse dot */}
                      {!read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]" />
                      )}

                      {/* icon tile */}
                      <div className={`shrink-0 w-9 h-9 rounded-xl border flex items-center justify-center mt-0.5 ${config.bg} ${config.border}`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-semibold leading-snug ${read ? "text-white/45" : "text-white/90"}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-white/20 shrink-0 mt-0.5">{relativeTime(n.created_at)}</span>
                        </div>
                        <p className={`text-[11px] leading-relaxed ${read ? "text-white/22" : "text-white/50"}`}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${config.bg} ${config.border} ${config.color} opacity-70`}>
                            {config.label}
                          </span>
                          {!read && (
                            <span className="text-[10px] text-fuchsia-400/60 font-medium">● Unread</span>
                          )}
                        </div>
                      </div>

                      {/* dismiss X */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(n.id) }}
                        className="shrink-0 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg text-white/25 hover:text-rose-300 hover:bg-rose-500/12 transition-all duration-150 mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* ── RIGHT — summary sidebar ── */}
          <div className="w-[220px] shrink-0 flex flex-col gap-3">

            {/* Summary counts by type */}
            <div className="rounded-2xl border border-white/8 bg-black/20 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8">
                <span className="text-xs font-bold uppercase tracking-widest text-white/30">Summary</span>
              </div>
              <div className="p-3 space-y-1.5">
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const count = notifications.filter(n => n.type === type).length
                  if (count === 0) return null
                  const { Icon } = cfg
                  return (
                    <div key={type} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white/4 transition-colors">
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.border}`}>
                        <Icon className={`w-3 h-3 ${cfg.color}`} />
                      </div>
                      <span className="text-[11px] text-white/40 flex-1 truncate">{cfg.label}</span>
                      <span className={`text-[11px] font-bold ${cfg.color}`}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Read status card */}
            <div className="rounded-2xl border border-white/8 bg-black/20 p-4 space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-white/30">Status</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/35">Unread</span>
                  <span className="text-[11px] font-bold text-fuchsia-300">{unreadCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/35">Read</span>
                  <span className="text-[11px] font-bold text-white/40">{notifications.length - unreadCount}</span>
                </div>
                <div className="h-px bg-white/6 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-white/35">Total</span>
                  <span className="text-[11px] font-bold text-white/60">{notifications.length}</span>
                </div>
              </div>
              {/* read progress bar */}
              {notifications.length > 0 && (
                <div className="h-1.5 rounded-full bg-white/6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 transition-all duration-500"
                    style={{ width: `${Math.round(((notifications.length - unreadCount) / notifications.length) * 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}