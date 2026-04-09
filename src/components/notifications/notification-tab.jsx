"use client"

// components/notifications/NotificationsTab.jsx
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

// ── Per-type icon + color config ──────────────────────────────────────────────
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

  const [selected, setSelected] = useState(null)

  // Keep selected in sync if the notification gets deleted
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

      {/* ── Header bar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {unreadCount > 0
            ? <BellRing className="w-5 h-5 text-fuchsia-400" />
            : <Bell     className="w-5 h-5 text-white/30"    />}
          <div>
            <h3 className="text-sm font-semibold text-white">
              {unreadCount > 0
                ? <><span className="text-fuchsia-300">{unreadCount}</span> unread notification{unreadCount !== 1 ? "s" : ""}</>
                : "All caught up"}
            </h3>
            <p className="text-white/25 text-xs mt-0.5">
              {notifications.length} total notification{notifications.length !== 1 ? "s" : ""}
            </p>
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
            <Button size="sm" onClick={() => { clearAll(); setSelected(null) }} variant="ghost"
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
        <div className="flex gap-3 h-[580px]">

          {/* ── LEFT — notification list ── */}
          <div
            className="w-[320px] max-w-[320px] shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: "rgba(0,0,0,0.2)",
              border: selectedNotif
                ? `1px solid ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}50`
                : "1px solid rgba(255,255,255,0.07)",
              boxShadow: selectedNotif
                ? `0 0 20px ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}15`
                : "none",
            }}
          >
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-400">Inbox</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                    {unreadCount} new
                  </span>
                )}
                <span className="text-white/25 text-xs">
                  {notifications.length} item{notifications.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <ScrollArea className="flex-1 min-h-0 overflow-hidden">
              <div className="divide-y divide-white/[0.04]">
                {notifications.map((n) => {
                  const read       = isReadByMe(n)
                  const cfg        = TYPE_CONFIG[n.type] || DEFAULT_CONFIG
                  const { Icon }   = cfg
                  const isSelected = selected === n.id

                  return (
                    <button
                      key={n.id}
                      onClick={() => handleSelect(n)}
                      className="w-full text-left group relative flex items-start gap-3 px-4 py-3.5 transition-all duration-150 border-l-2"
                      style={{
                        background:    isSelected ? `${cfg.color}10` : read ? "transparent" : "rgba(255,255,255,0.02)",
                        borderLeftColor: isSelected ? cfg.color : "transparent",
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `${cfg.color}08` }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = read ? "transparent" : "rgba(255,255,255,0.02)" }}
                    >
                      {/* unread pulse dot */}
                      {!read && (
                        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_6px_rgba(232,121,249,0.8)]" />
                      )}

                      {/* icon tile */}
                      <div
                        className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                      </div>

                      {/* content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold leading-snug truncate"
                            style={{ color: isSelected ? "#fff" : read ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.88)" }}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-white/20 shrink-0">{relativeTime(n.created_at)}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed line-clamp-2"
                          style={{ color: read ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.50)" }}>
                          {n.message}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color, opacity: 0.75 }}
                          >
                            {cfg.label}
                          </span>
                          {!read && <span className="text-[10px] font-medium text-fuchsia-400/60">● Unread</span>}
                        </div>
                      </div>

                      {/* dismiss X */}
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 h-6 w-6 flex items-center justify-center rounded-lg text-white/25 hover:text-rose-300 hover:bg-rose-500/12 transition-all duration-150 mt-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>

          {/* ── RIGHT — detail pane ── */}
          <div
            className="flex-1 rounded-2xl overflow-hidden transition-all duration-300"
            style={{
              background: "rgba(0,0,0,0.2)",
              border: selectedNotif
                ? `1px solid ${(TYPE_CONFIG[selectedNotif.type] || DEFAULT_CONFIG).color}50`
                : "1px solid rgba(255,255,255,0.07)",
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
                <div className="h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
                  <div className="w-14 h-14 rounded-2xl border border-white/8 flex items-center justify-center bg-white/3">
                    <MailOpen className="w-6 h-6 opacity-40" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-white/20">No notification selected</p>
                    <p className="text-xs text-white/10 mt-1">Pick a notification from the left to read it</p>
                  </div>
                </div>
              )}
          </div>

          {/* ── RIGHT-most — summary sidebar ── */}
          <div className="w-[200px] shrink-0 flex flex-col gap-3">

            {/* Type breakdown */}
            <div className="rounded-2xl border border-white/8 bg-black/20 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/8 shrink-0">
                <span className="text-xs font-bold uppercase tracking-widest text-white/30">Summary</span>
              </div>
              <div className="p-3 space-y-1">
                {Object.entries(TYPE_CONFIG).map(([type, cfg]) => {
                  const count = notifications.filter(n => n.type === type).length
                  if (count === 0) return null
                  const { Icon } = cfg
                  return (
                    <div key={type} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/4 transition-colors">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
                      >
                        <Icon className="w-3 h-3" style={{ color: cfg.color }} />
                      </div>
                      <span className="text-[11px] text-white/40 flex-1 truncate leading-tight">{cfg.label}</span>
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: cfg.color }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Read status */}
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

// ── Notification detail pane ──────────────────────────────────────────────────
function NotificationDetail({ notif, onDelete }) {
  const cfg      = TYPE_CONFIG[notif.type] || DEFAULT_CONFIG
  const { Icon } = cfg

  return (
    <div className="h-full flex flex-col">
      {/* Accent line + header */}
      <div className="px-6 pt-6 pb-5 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div
          className="h-px mb-4 -mx-6 -mt-6 rounded-t-2xl"
          style={{ background: `linear-gradient(to right, transparent, ${cfg.color}60, transparent)` }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Large icon tile */}
            <div
              className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center mt-0.5"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <Icon className="w-5 h-5" style={{ color: cfg.color }} />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <h2 className="text-base font-bold text-white leading-snug">{notif.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {/* Type badge */}
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                {/* Read status */}
                <span className="flex items-center gap-1 text-[11px] text-white/30">
                  <MailOpen className="w-3 h-3" />Read
                </span>
              </div>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={onDelete}
            className="shrink-0 h-8 px-3 flex items-center gap-1.5 rounded-xl text-xs text-white/35 border border-white/8 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all duration-150"
          >
            <X className="w-3.5 h-3.5" />Dismiss
          </button>
        </div>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-5">

          {/* Message body */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2">
              <Mail className="w-3.5 h-3.5 opacity-70" />Message
            </p>
            <div
              className="px-4 py-3.5 rounded-xl text-sm text-white/70 leading-relaxed"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              {notif.message}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 opacity-70" />Received
            </p>
            <p className="text-sm text-white/55">{fullDate(notif.created_at)}</p>
            <p className="text-xs text-white/25 mt-0.5">{relativeTime(notif.created_at)}</p>
          </div>

          {/* Metadata — show any extra fields the notification carries */}
          {(notif.content_type || notif.content_title || notif.reason) && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2">
                <Hash className="w-3.5 h-3.5 opacity-70" />Details
              </p>
              <div className="space-y-2">
                {notif.content_type && (
                  <MetaRow label="Content type" value={notif.content_type} />
                )}
                {notif.content_title && (
                  <MetaRow label="Content title" value={notif.content_title} />
                )}
                {notif.reason && (
                  <MetaRow label="Reason" value={notif.reason} highlight />
                )}
              </div>
            </div>
          )}

          {/* Notification ID */}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] text-white/15 font-mono">
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
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <span className="text-[11px] text-white/30 shrink-0 w-24">{label}</span>
      <span className={`text-[11px] font-medium break-words ${highlight ? "text-amber-300/80" : "text-white/60"}`}>
        {value}
      </span>
    </div>
  )
}