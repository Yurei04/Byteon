"use client"

// components/notifications/NotificationBell.jsx

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "./use-notification" 
import {
  Bell, BellRing, CheckCheck, Trash2, X,
  ShieldOff, ShieldCheck, CheckCircle, XCircle,
  Trash, Building2, Loader2,
} from "lucide-react"

// ── Per-type config ────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  account_suspended:     { Icon: ShieldOff,   color: "text-amber-400",  bg: "bg-amber-500/12",  border: "border-amber-500/20"  },
  account_reactivated:   { Icon: ShieldCheck, color: "text-emerald-400",bg: "bg-emerald-500/12",border: "border-emerald-500/20" },
  post_approved:         { Icon: CheckCircle, color: "text-emerald-400",bg: "bg-emerald-500/12",border: "border-emerald-500/20" },
  post_rejected:         { Icon: XCircle,     color: "text-red-400",    bg: "bg-red-500/12",    border: "border-red-500/20"    },
  post_deleted_by_admin: { Icon: Trash,       color: "text-rose-400",   bg: "bg-rose-500/12",   border: "border-rose-500/20"   },
  content_deleted_by_org:{ Icon: Building2,   color: "text-sky-400",    bg: "bg-sky-500/12",    border: "border-sky-500/20"    },
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return "just now"
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationBell({ userId, role }) {
  const [open, setOpen]   = useState(false)
  const panelRef          = useRef(null)
  const buttonRef         = useRef(null)

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

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        panelRef.current  && !panelRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleOpen = () => setOpen((v) => !v)

  return (
    <div className="relative">
      {/* ── Bell button ── */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        className={`relative cursor-pointer  h-9 w-9 flex items-center justify-center rounded-lg border transition-all duration-200
          ${open
            ? "bg-fuchsia-500/15 border-fuchsia-500/40 text-fuchsia-300"
            : "bg-black/30 border-white/10 text-white/45 hover:text-white/80 hover:border-white/20 hover:bg-white/6"
          }`}
        aria-label="Notifications"
      >
        {unreadCount > 0
          ? <BellRing className="w-4 h-4" />
          : <Bell className="w-4 h-4" />
        }

        {/* unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center justify-center
            bg-gradient-to-br from-pink-500 to-fuchsia-600 text-white text-[10px] font-bold
            rounded-full px-1 shadow-lg shadow-fuchsia-500/40 animate-in zoom-in duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div
          ref={panelRef}
          className="absolute cursor-pointer  right-0 top-11 w-[360px] z-50
            bg-slate-950/95 backdrop-blur-xl border border-fuchsia-500/20
            rounded-2xl shadow-2xl shadow-fuchsia-900/30
            animate-in slide-in-from-top-2 fade-in duration-200"
        >
          {/* header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-fuchsia-400" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  title="Mark all as read"
                  className="h-7 px-2 flex cursor-pointer  items-center gap-1 rounded-lg text-[11px] text-white/40 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-150"
                >
                  <CheckCheck className="w-3 h-3" />All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Clear targeted notifications"
                  className="h-7 px-2 cursor-pointer  flex items-center gap-1 rounded-lg text-[11px] text-white/40 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-150"
                >
                  <Trash2 className="w-3 h-3" />Clear
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/6 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* list */}
          <ScrollArea className="max-h-[420px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400/60" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3 text-white/20">
                <Bell className="w-10 h-10 opacity-30" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((n) => {
                  const read   = isReadByMe(n)
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.post_approved
                  const { Icon } = config

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150
                        ${read
                          ? "hover:bg-white/3"
                          : "bg-white/3 hover:bg-white/5"
                        }`}
                    >
                      {/* unread dot */}
                      {!read && (
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.7)]" />
                      )}

                      {/* type icon */}
                      <div className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center mt-0.5
                        ${config.bg} ${config.border}`}
                      >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className={`text-xs font-semibold leading-snug line-clamp-1
                          ${read ? "text-white/50" : "text-white/90"}`}
                        >
                          {n.title}
                        </p>
                        <p className={`text-[11px] leading-relaxed line-clamp-2
                          ${read ? "text-white/25" : "text-white/50"}`}
                        >
                          {n.message}
                        </p>
                        <p className="text-[10px] text-white/20 pt-0.5">{relativeTime(n.created_at)}</p>
                      </div>

                      {/* dismiss btn */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(n.id) }}
                        className="shrink-0 cursor-pointer  opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-md text-white/25 hover:text-rose-300 hover:bg-rose-500/12 transition-all duration-150 mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-white/8 flex items-center justify-between">
              <span className="text-[11px] text-white/20">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>
              {unreadCount === 0 && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400/60">
                  <CheckCheck className="w-3 h-3" />All read
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}