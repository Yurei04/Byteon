"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "./use-notification"
import {
  Bell, BellRing, CheckCheck, Trash2, X,
  ShieldOff, ShieldCheck, CheckCircle, XCircle,
  Trash, Building2, Loader2,
} from "lucide-react"

const TYPE_CONFIG = {
  account_suspended:      { Icon: ShieldOff,   color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.22)"  },
  account_reactivated:    { Icon: ShieldCheck, color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)"  },
  post_approved:          { Icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)"  },
  post_rejected:          { Icon: XCircle,     color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.22)" },
  post_deleted_by_admin:  { Icon: Trash,       color: "#fb7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.22)" },
  content_deleted_by_org: { Icon: Building2,   color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.22)"  },
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
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function NotificationBell({ userId, role }) {
  const [open, setOpen] = useState(false)
  const panelRef        = useRef(null)
  const buttonRef       = useRef(null)

  const {
    notifications, unreadCount, loading,
    isReadByMe, markRead, markAllRead, deleteOne, clearAll,
  } = useNotifications({ userId, role })

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

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        className="relative cursor-pointer h-9 w-9 flex items-center justify-center rounded-lg transition-all duration-200"
        style={
          open
            ? {
                background: "rgb(var(--brand-500) / 0.15)",
                border: "1px solid rgb(var(--brand-500) / 0.4)",
                color: "rgb(var(--brand-300))",
              }
            : {
                background: "rgb(var(--surface) / 0.4)",
                border: "1px solid rgb(var(--surface-border) / 0.3)",
                color: "rgb(var(--text-faint))",
              }
        }
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.color = "rgb(var(--text-secondary))"
            e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.5)"
            e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.4)"
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.color = "rgb(var(--text-faint))"
            e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.3)"
            e.currentTarget.style.background = "rgb(var(--surface) / 0.4)"
          }
        }}
        aria-label="Notifications"
      >
        {unreadCount > 0
          ? <BellRing className="w-4 h-4" />
          : <Bell     className="w-4 h-4" />
        }

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[17px] h-[17px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1 animate-in zoom-in duration-200"
            style={{
              background: "linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-600)))",
              boxShadow: "0 2px 8px rgb(var(--accent-500) / 0.4)",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 top-11 w-[360px] z-50 rounded-2xl animate-in slide-in-from-top-2 fade-in duration-200"
          style={{
            background: "rgb(var(--bg-base) / 0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgb(var(--brand-500) / 0.2)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.35), 0 0 0 1px rgb(var(--brand-500) / 0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5"
            style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
          >
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4" style={{ color: "rgb(var(--brand-400))" }} />
              <span className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: "rgb(var(--brand-500) / 0.15)",
                    color: "rgb(var(--brand-300))",
                    border: "1px solid rgb(var(--brand-500) / 0.3)",
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="h-7 px-2 flex cursor-pointer items-center gap-1 rounded-lg text-[11px] transition-all duration-150"
                  style={{ color: "rgb(var(--text-faint))", border: "1px solid transparent" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#34d399"
                    e.currentTarget.style.background = "rgba(52,211,153,0.08)"
                    e.currentTarget.style.borderColor = "rgba(52,211,153,0.2)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgb(var(--text-faint))"
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "transparent"
                  }}
                >
                  <CheckCheck className="w-3 h-3" />All read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="h-7 px-2 cursor-pointer flex items-center gap-1 rounded-lg text-[11px] transition-all duration-150"
                  style={{ color: "rgb(var(--text-faint))", border: "1px solid transparent" }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = "#f87171"
                    e.currentTarget.style.background = "rgba(248,113,113,0.08)"
                    e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)"
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = "rgb(var(--text-faint))"
                    e.currentTarget.style.background = "transparent"
                    e.currentTarget.style.borderColor = "transparent"
                  }}
                >
                  <Trash2 className="w-3 h-3" />Clear
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-lg transition-all"
                style={{ color: "rgb(var(--text-faint))" }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = "rgb(var(--text-primary))"
                  e.currentTarget.style.background = "rgb(var(--surface-raised))"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = "rgb(var(--text-faint))"
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* List */}
          <ScrollArea className="max-h-[420px]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgb(var(--brand-400) / 0.6)" }} />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <Bell className="w-10 h-10 opacity-30" style={{ color: "rgb(var(--text-faint))" }} />
                <p className="text-sm" style={{ color: "rgb(var(--text-faint))" }}>
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => {
                  const read   = isReadByMe(n)
                  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.post_approved
                  const { Icon } = config

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className="group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-150"
                      style={{
                        background: read ? "transparent" : "rgb(var(--surface-raised) / 0.3)",
                        borderBottom: "1px solid rgb(var(--surface-border) / 0.12)",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = read
                        ? "rgb(var(--surface-raised) / 0.2)"
                        : "rgb(var(--surface-raised) / 0.45)"
                      }
                      onMouseLeave={e => e.currentTarget.style.background = read
                        ? "transparent"
                        : "rgb(var(--surface-raised) / 0.3)"
                      }
                    >
                      {/* Unread dot */}
                      {!read && (
                        <span
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "rgb(var(--brand-400))",
                            boxShadow: "0 0 6px rgb(var(--accent-400) / 0.7)",
                          }}
                        />
                      )}

                      {/* Icon */}
                      <div
                        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                        style={{ background: config.bg, border: `1px solid ${config.border}` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p
                          className="text-xs font-semibold leading-snug line-clamp-1"
                          style={{ color: read ? "rgb(var(--text-faint))" : "rgb(var(--text-secondary))" }}
                        >
                          {n.title}
                        </p>
                        <p
                          className="text-[11px] leading-relaxed line-clamp-2"
                          style={{ color: read ? "rgb(var(--text-faint) / 0.6)" : "rgb(var(--text-muted))" }}
                        >
                          {n.message}
                        </p>
                        <p className="text-[10px] pt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                          {relativeTime(n.created_at)}
                        </p>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteOne(n.id) }}
                        className="shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-md transition-all duration-150 mt-0.5"
                        style={{ color: "rgb(var(--text-faint))" }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = "#f87171"
                          e.currentTarget.style.background = "rgba(248,113,113,0.1)"
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = "rgb(var(--text-faint))"
                          e.currentTarget.style.background = "transparent"
                        }}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.2)" }}
            >
              <span className="text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>
              {unreadCount === 0 && (
                <span
                  className="flex items-center gap-1 text-[11px]"
                  style={{ color: "#34d399", opacity: 0.6 }}
                >
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