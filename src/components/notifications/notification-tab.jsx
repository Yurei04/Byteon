"use client"

import { useState } from "react"
import { useNotifications } from "./use-notification"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  Bell, BellRing, CheckCheck, Trash2, X, Loader2,
  ShieldOff, ShieldCheck, CheckCircle, XCircle,
  Trash, Building2, FileText, Inbox, Clock, Hash,
  MailOpen, Mail,
} from "lucide-react"

const TYPE_CONFIG = {
  account_suspended:      { Icon: ShieldOff,   color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.22)",  label: "Account Suspended"   },
  account_reactivated:    { Icon: ShieldCheck, color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)",  label: "Account Reactivated" },
  post_approved:          { Icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)",  label: "Post Approved"       },
  post_rejected:          { Icon: XCircle,     color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.22)", label: "Post Rejected"       },
  post_deleted_by_admin:  { Icon: Trash,       color: "#fb7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.22)", label: "Content Removed"     },
  content_deleted_by_org: { Icon: Building2,   color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.22)",  label: "Org Deleted Content" },
  blog_deleted_by_user:   { Icon: FileText,    color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.22)", label: "User Deleted Blog"   },
}

const DEFAULT_CONFIG = TYPE_CONFIG.post_approved

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

function fullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function NotificationsTab({ userId, role }) {
  const {
    notifications, unreadCount, loading,
    isReadByMe, markRead, markAllRead, deleteOne, clearAll,
  } = useNotifications({ userId, role })

  const [selected, setSelected] = useState(null)
  const selectedNotif = notifications.find(n => n.id === selected) ?? null

  const handleSelect = (n) => {
    setSelected(prev => prev === n.id ? null : n.id)
    if (!isReadByMe(n)) markRead(n.id)
  }

  const handleDelete = (e, id) => {
    e.stopPropagation()
    if (selected === id) setSelected(null)
    deleteOne(id)
  }

  return (
    <div className="flex flex-col h-full gap-4">

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {unreadCount > 0
            ? <BellRing className="w-5 h-5" style={{ color: "rgb(var(--brand-400))" }} />
            : <Bell     className="w-5 h-5" style={{ color: "rgb(var(--text-faint))" }} />
          }
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
              {unreadCount > 0
                ? <><span style={{ color: "rgb(var(--brand-300))" }}>{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}</>
                : "All caught up"
              }
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
              {notifications.length} total notification{notifications.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              size="sm" onClick={markAllRead} variant="ghost"
              className="h-8 px-3 cursor-pointer text-xs gap-1.5 transition-all"
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
              <CheckCheck className="w-3.5 h-3.5" />Mark all read
            </Button>
          )}
          {notifications.some(n => n.recipient_user_id === userId) && (
            <Button
              size="sm" onClick={() => { clearAll(); setSelected(null) }} variant="ghost"
              className="h-8 px-3 text-xs cursor-pointer gap-1.5 transition-all"
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
              <Trash2 className="w-3.5 h-3.5" />Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand-400) / 0.6)" }} />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 select-none">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.3)",
              background: "rgb(var(--surface-raised) / 0.3)",
            }}
          >
            <Bell className="w-7 h-7 opacity-40" style={{ color: "rgb(var(--text-faint))" }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium" style={{ color: "rgb(var(--text-faint))" }}>
              No notifications yet
            </p>
            <p className="text-xs mt-1" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>
              Activity and alerts will appear here
            </p>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 h-[580px]">

          {/* LEFT — list */}
          <div
            className="w-[320px] max-w-[320px] shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: "rgb(var(--surface) / 0.3)",
              border: selectedNotif
                ? `1px solid ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}50`
                : "1px solid rgb(var(--surface-border) / 0.25)",
              boxShadow: selectedNotif
                ? `0 0 20px ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}15`
                : "none",
            }}
          >
            {/* Panel header */}
            <div
              className="px-4 py-3 flex items-center justify-between shrink-0"
              style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
            >
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "rgb(var(--brand-400))" }}
              >
                Inbox
              </span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{
                      background: "rgb(var(--brand-500) / 0.15)",
                      color: "rgb(var(--brand-300))",
                      border: "1px solid rgb(var(--brand-500) / 0.3)",
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
                <span className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                  {notifications.length} item{notifications.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div style={{ borderTop: "none" }}>
                {notifications.map((n) => {
                  const read       = isReadByMe(n)
                  const cfg        = TYPE_CONFIG[n.type] || DEFAULT_CONFIG
                  const { Icon }   = cfg
                  const isSelected = selected === n.id

                  return (
                    <button
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      className="w-full cursor-pointer text-left group relative flex items-start gap-3 px-4 py-3.5 transition-all duration-150 border-l-2"
                      style={{
                        background: isSelected ? `${cfg.color}10` : read ? "transparent" : "rgb(var(--surface-raised) / 0.3)",
                        borderLeftColor: isSelected ? cfg.color : "transparent",
                        borderBottom: "1px solid rgb(var(--surface-border) / 0.12)",
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `${cfg.color}08` }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = read ? "transparent" : "rgb(var(--surface-raised) / 0.3)" }}
                    >
                      {/* Unread dot */}
                      {!read && (
                        <span
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "rgb(var(--brand-400))",
                            boxShadow: "0 0 6px rgb(var(--accent-400) / 0.8)",
                          }}
                        />
                      )}

                      {/* Icon tile */}
                      <div
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="text-xs font-semibold leading-snug truncate"
                            style={{
                              color: isSelected
                                ? "rgb(var(--text-primary))"
                                : read
                                  ? "rgb(var(--text-faint))"
                                  : "rgb(var(--text-secondary))",
                            }}
                          >
                            {n.title}
                          </p>
                          <span className="text-[10px] shrink-0" style={{ color: "rgb(var(--text-faint))" }}>
                            {relativeTime(n.created_at)}
                          </span>
                        </div>
                        <p
                          className="text-[11px] leading-relaxed line-clamp-2"
                          style={{ color: read ? "rgb(var(--text-faint))" : "rgb(var(--text-muted))" }}
                        >
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, opacity: 0.85 }}
                          >
                            {cfg.label}
                          </span>
                          {!read && (
                            <span
                              className="text-[10px] font-medium"
                              style={{ color: "rgb(var(--brand-400) / 0.6)" }}
                            >
                              ● Unread
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Dismiss */}
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg transition-all duration-150 mt-0.5"
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
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* CENTER — detail pane */}
          <div
            className="flex-1 rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: "rgb(var(--surface) / 0.3)",
              border: selectedNotif
                ? `1px solid ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}50`
                : "1px solid rgb(var(--surface-border) / 0.25)",
              boxShadow: selectedNotif
                ? `0 0 24px ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}12`
                : "none",
            }}
          >
            {selectedNotif
              ? <NotificationDetail
                  notif={selectedNotif}
                  onDelete={() => { setSelected(null); deleteOne(selectedNotif.id) }}
                />
              : (
                <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{
                      border: "1px solid rgb(var(--surface-border) / 0.25)",
                      background: "rgb(var(--surface-raised) / 0.3)",
                    }}
                  >
                    <MailOpen className="w-6 h-6 opacity-40" style={{ color: "rgb(var(--text-faint))" }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium" style={{ color: "rgb(var(--text-faint))" }}>
                      No notification selected
                    </p>
                    <p className="text-xs mt-1" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>
                      Pick a notification from the left to read it
                    </p>
                  </div>
                </div>
              )
            }
          </div>

          {/* RIGHT — summary sidebar */}
          <div className="w-[200px] shrink-0 flex flex-col gap-3">

            {/* Type breakdown */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid rgb(var(--surface-border) / 0.25)",
                background: "rgb(var(--surface) / 0.2)",
              }}
            >
              <div
                className="px-4 py-3 shrink-0"
                style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
              >
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  Summary
                </span>
              </div>
              <div className="p-3 space-y-1">
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const count = notifications.filter(n => n.type === type).length
                  if (count === 0) return null
                  const { Icon } = cfg
                  return (
                    <div
                      key={type}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors"
                      style={{ cursor: "default" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.4)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                      </div>
                      <span
                        className="text-[11px] flex-1 truncate leading-tight"
                        style={{ color: "rgb(var(--text-faint))" }}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: cfg.color }}>
                        {count}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Read status */}
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{
                border: "1px solid rgb(var(--surface-border) / 0.25)",
                background: "rgb(var(--surface) / 0.2)",
              }}
            >
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                Status
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>Unread</span>
                  <span className="text-[11px] font-bold" style={{ color: "rgb(var(--brand-300))" }}>
                    {unreadCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>Read</span>
                  <span className="text-[11px] font-bold" style={{ color: "rgb(var(--text-muted))" }}>
                    {notifications.length - unreadCount}
                  </span>
                </div>
                <div
                  className="h-px my-1"
                  style={{ background: "rgb(var(--surface-border) / 0.2)" }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>Total</span>
                  <span className="text-[11px] font-bold" style={{ color: "rgb(var(--text-secondary))" }}>
                    {notifications.length}
                  </span>
                </div>
              </div>

              {notifications.length > 0 && (
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgb(var(--surface-border) / 0.3)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(((notifications.length - unreadCount) / notifications.length) * 100)}%`,
                      background: "linear-gradient(to right, rgb(var(--brand-500)), rgb(var(--accent-500)))",
                    }}
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

// ── Detail pane ───────────────────────────────────────────────────────────────
function NotificationDetail({ notif, onDelete }) {
  const cfg      = TYPE_CONFIG[notif.type] || DEFAULT_CONFIG
  const { Icon } = cfg

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 pt-6 pb-5 shrink-0"
        style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
      >
        <div
          className="h-px mb-4 -mx-6 -mt-6 rounded-t-2xl"
          style={{ background: `linear-gradient(to right, transparent, ${cfg.color}60, transparent)` }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <Icon className="w-5 h-5" style={{ color: cfg.color }} />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <h2
                className="text-base font-bold leading-snug"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                {notif.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span
                  className="flex items-center gap-1 text-[11px]"
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  <MailOpen className="w-3 h-3" />Read
                </span>
              </div>
            </div>
          </div>

          {/* Dismiss */}
          <button
            onClick={onDelete}
            className="shrink-0 h-8 px-3 flex items-center gap-1.5 rounded-xl text-xs transition-all duration-150"
            style={{
              color: "rgb(var(--text-faint))",
              border: "1px solid rgb(var(--surface-border) / 0.3)",
              background: "transparent",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "#f87171"
              e.currentTarget.style.background = "rgba(248,113,113,0.08)"
              e.currentTarget.style.borderColor = "rgba(248,113,113,0.2)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgb(var(--text-faint))"
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.3)"
            }}
          >
            <X className="w-3.5 h-3.5" />Dismiss
          </button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-5">

          {/* Message */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              <Mail className="w-3.5 h-3.5 opacity-70" />Message
            </p>
            <div
              className="px-4 py-3.5 rounded-xl text-sm leading-relaxed"
              style={{
                background: "rgb(var(--surface-raised) / 0.4)",
                border: "1px solid rgb(var(--surface-border) / 0.25)",
                color: "rgb(var(--text-secondary))",
              }}
            >
              {notif.message}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              <Clock className="w-3.5 h-3.5 opacity-70" />Received
            </p>
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>
              {fullDate(notif.created_at)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
              {relativeTime(notif.created_at)}
            </p>
          </div>

          {/* Metadata */}
          {(notif.content_type || notif.content_title || notif.reason) && (
            <div>
              <p
                className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                <Hash className="w-3.5 h-3.5 opacity-70" />Details
              </p>
              <div className="space-y-2">
                {notif.content_type  && <MetaRow label="Content type"  value={notif.content_type}  />}
                {notif.content_title && <MetaRow label="Content title" value={notif.content_title} />}
                {notif.reason        && <MetaRow label="Reason"        value={notif.reason}        highlight />}
              </div>
            </div>
          )}

          {/* ID */}
          <div className="pt-1 pb-2">
            <p
              className="flex items-center gap-1.5 text-[11px] font-mono"
              style={{ color: "rgb(var(--text-faint) / 0.4)" }}
            >
              <Hash className="w-3 h-3" />{notif.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function MetaRow({ label, value, highlight = false }) {
  return (
    <div
      className="flex items-start gap-3 px-3.5 py-2.5 rounded-xl"
      style={{
        background: "rgb(var(--surface-raised) / 0.3)",
        border: "1px solid rgb(var(--surface-border) / 0.2)",
      }}
    >
      <span className="text-[11px] shrink-0 w-24" style={{ color: "rgb(var(--text-faint))" }}>
        {label}
      </span>
      <span
        className="text-[11px] font-medium break-words"
        style={{ color: highlight ? "#fbbf24" : "rgb(var(--text-muted))" }}
      >
        {value}
      </span>
    </div>
  )
}