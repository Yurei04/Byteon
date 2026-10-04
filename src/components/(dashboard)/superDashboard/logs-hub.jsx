"use client"

import { useMemo, useState, useEffect, useCallback } from "react"
import { useNotifications } from "@/components/notifications/use-notification" 
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import {
  ScrollText, CheckCheck, Loader2, Search, Copy, Check,
  ShieldOff, ShieldCheck, CheckCircle, XCircle, Trash, Building2, FileText,
  Users, Gavel, Eraser, Clock, Hash, MailOpen, Mail, ArrowRight, Filter,
} from "lucide-react"

/* ── Config ─────────────────────────────────────────────────────────────── */

const TYPE_CONFIG = {
  account_suspended:      { Icon: ShieldOff,   color: "#fbbf24", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.22)",  label: "Account suspended",   group: "accounts"   },
  account_reactivated:    { Icon: ShieldCheck, color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)",  label: "Account reactivated", group: "accounts"   },
  post_approved:          { Icon: CheckCircle, color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.22)",  label: "Post approved",       group: "moderation" },
  post_rejected:          { Icon: XCircle,     color: "#f87171", bg: "rgba(248,113,113,0.1)", border: "rgba(248,113,113,0.22)", label: "Post rejected",       group: "moderation" },
  post_deleted_by_admin:  { Icon: Trash,       color: "#fb7185", bg: "rgba(251,113,133,0.1)", border: "rgba(251,113,133,0.22)", label: "Content removed",     group: "moderation" },
  content_deleted_by_org: { Icon: Building2,   color: "#38bdf8", bg: "rgba(56,189,248,0.1)",  border: "rgba(56,189,248,0.22)",  label: "Org deleted content", group: "deletions"  },
  blog_deleted_by_user:   { Icon: FileText,    color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.22)", label: "User deleted blog",   group: "deletions"  },
}
const DEFAULT_CONFIG = TYPE_CONFIG.post_approved

const GROUPS = [
  { id: "all",        label: "Everything", Icon: ScrollText },
  { id: "accounts",   label: "Accounts",   Icon: Users      },
  { id: "moderation", label: "Moderation", Icon: Gavel      },
  { id: "deletions",  label: "Deletions",  Icon: Eraser     },
]

const RANGES = [
  { id: "24h", label: "24h", ms: 86_400_000 },
  { id: "7d",  label: "7d",  ms: 7 * 86_400_000 },
  { id: "30d", label: "30d", ms: 30 * 86_400_000 },
  { id: "all", label: "All", ms: Infinity },
]

const PAGE_SIZE = 50
const cfgOf = (n) => TYPE_CONFIG[n.type] || DEFAULT_CONFIG

/* ── Helpers ────────────────────────────────────────────────────────────── */

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

function clockTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function fullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function dayLabel(dateStr) {
  const d = new Date(dateStr)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const that = new Date(d); that.setHours(0, 0, 0, 0)
  const diff = Math.round((today - that) / 86_400_000)
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

const dayKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

/* ── Main ───────────────────────────────────────────────────────────────── */

export default function LogsHub({ userId, role = "super_admin" }) {
  const {
    notifications, unreadCount, loading,
    isReadByMe, markRead, markAllRead,
  } = useNotifications({ userId, role })

  const [selectedId, setSelectedId] = useState(null)
  const [group, setGroup]           = useState("all")
  const [type, setType]             = useState("all")
  const [range, setRange]           = useState("7d")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [query, setQuery]           = useState("")
  const [limit, setLimit]           = useState(PAGE_SIZE)

  // reset pagination whenever filters change
  useEffect(() => { setLimit(PAGE_SIZE) }, [group, type, range, unreadOnly, query])

  const rangeMs = RANGES.find(r => r.id === range)?.ms ?? Infinity

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = Date.now()
    return notifications
      .filter(n => {
        const cfg = cfgOf(n)
        if (group !== "all" && cfg.group !== group) return false
        if (type !== "all" && n.type !== type) return false
        if (rangeMs !== Infinity && now - new Date(n.created_at).getTime() > rangeMs) return false
        if (unreadOnly && isReadByMe(n)) return false
        if (q) {
          const hay = `${n.title} ${n.message} ${n.content_title ?? ""} ${n.reason ?? ""} ${cfg.label}`.toLowerCase()
          if (!hay.includes(q)) return false
        }
        return true
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [notifications, group, type, rangeMs, unreadOnly, query, isReadByMe])

  const visible = filtered.slice(0, limit)

  const grouped = useMemo(() => {
    const out = []
    visible.forEach(n => {
      const key = dayKey(n.created_at)
      const last = out[out.length - 1]
      if (last && last.key === key) last.items.push(n)
      else out.push({ key, label: dayLabel(n.created_at), items: [n] })
    })
    return out
  }, [visible])

  const selected = notifications.find(n => n.id === selectedId) ?? null

  const select = useCallback((n) => {
    setSelectedId(n.id)
    if (!isReadByMe(n)) markRead(n.id)
  }, [isReadByMe, markRead])

  // ↑ / ↓ to move through the feed
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest("input, textarea")) return
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
      if (!filtered.length) return
      e.preventDefault()
      const i = filtered.findIndex(n => n.id === selectedId)
      const next = e.key === "ArrowDown" ? Math.min(i + 1, filtered.length - 1) : Math.max(i - 1, 0)
      select(filtered[i === -1 ? 0 : next])
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [filtered, selectedId, select])

  const resetFilters = () => {
    setGroup("all"); setType("all"); setRange("all"); setUnreadOnly(false); setQuery("")
  }

  const hasFilters = group !== "all" || type !== "all" || range !== "7d" || unreadOnly || query

  return (
    <div className="flex flex-col gap-4">

      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ScrollText className="w-5 h-5" style={{ color: "rgb(var(--brand-400))" }} />
          <div>
            <h3 className="text-sm font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
              {unreadCount > 0
                ? <><span style={{ color: "rgb(var(--brand-300))" }}>{unreadCount}</span> unreviewed event{unreadCount !== 1 ? "s" : ""}</>
                : "Everything reviewed"}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
              Showing {filtered.length} of {notifications.length} logged events
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <GhostButton hover="#34d399" hoverBg="rgba(52,211,153,0.08)" hoverBorder="rgba(52,211,153,0.2)" onClick={markAllRead}>
              <CheckCheck className="w-3.5 h-3.5" />Mark all reviewed
            </GhostButton>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand-400) / 0.6)" }} />
        </div>
      ) : (
        <div className="grid gap-3 h-[680px] grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)_360px]">

          {/* ── COLUMN 1 — Filters & overview ───────────────────────── */}
          <Panel className="hidden lg:flex flex-col">
            <PanelHeader title="Filter" accent>
              {hasFilters && (
                <button onClick={resetFilters} className="text-[11px] cursor-pointer" style={{ color: "rgb(var(--brand-300))" }}>
                  Reset
                </button>
              )}
            </PanelHeader>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-3 space-y-5">

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgb(var(--text-faint))" }} />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search logs"
                    className="w-full h-8 pl-8 pr-2 rounded-lg text-xs outline-none"
                    style={{
                      background: "rgb(var(--surface-raised) / 0.4)",
                      border: "1px solid rgb(var(--surface-border) / 0.3)",
                      color: "rgb(var(--text-primary))",
                    }}
                  />
                </div>

                {/* Time range */}
                <Section label="Time range">
                  <div className="flex gap-1">
                    {RANGES.map(r => (
                      <button
                        key={r.id}
                        onClick={() => setRange(r.id)}
                        className="flex-1 h-7 rounded-lg text-[11px] font-medium cursor-pointer transition-colors"
                        style={{
                          background: range === r.id ? "rgb(var(--brand-500) / 0.15)" : "transparent",
                          border: `1px solid ${range === r.id ? "rgb(var(--brand-500) / 0.35)" : "rgb(var(--surface-border) / 0.25)"}`,
                          color: range === r.id ? "rgb(var(--brand-300))" : "rgb(var(--text-faint))",
                        }}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Category */}
                <Section label="Category">
                  <div className="space-y-0.5">
                    {GROUPS.map(({ id, label, Icon }) => {
                      const count = id === "all"
                        ? notifications.length
                        : notifications.filter(n => cfgOf(n).group === id).length
                      const active = group === id
                      return (
                        <button
                          key={id}
                          onClick={() => { setGroup(id); setType("all") }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                          style={{
                            background: active ? "rgb(var(--brand-500) / 0.12)" : "transparent",
                            color: active ? "rgb(var(--brand-300))" : "rgb(var(--text-muted))",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span className="flex-1 text-left">{label}</span>
                          <span className="tabular-nums text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>{count}</span>
                        </button>
                      )
                    })}
                  </div>
                </Section>

                {/* Event type */}
                <Section label="Event type">
                  <div className="space-y-0.5">
                    {Object.entries(TYPE_CONFIG)
                      .filter(([, c]) => group === "all" || c.group === group)
                      .map(([key, cfg]) => {
                        const count = notifications.filter(n => n.type === key).length
                        const active = type === key
                        const { Icon } = cfg
                        return (
                          <button
                            key={key}
                            onClick={() => setType(active ? "all" : key)}
                            disabled={count === 0}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-default"
                            style={{
                              background: active ? cfg.bg : "transparent",
                              color: active ? cfg.color : "rgb(var(--text-muted))",
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                            <span className="flex-1 text-left truncate">{cfg.label}</span>
                            <span className="tabular-nums text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>{count}</span>
                          </button>
                        )
                      })}
                  </div>
                </Section>

                {/* Review state */}
                <Section label="Review state">
                  <button
                    onClick={() => setUnreadOnly(v => !v)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
                    style={{
                      background: unreadOnly ? "rgb(var(--brand-500) / 0.12)" : "transparent",
                      color: unreadOnly ? "rgb(var(--brand-300))" : "rgb(var(--text-muted))",
                    }}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span className="flex-1 text-left">Unreviewed only</span>
                    <span className="tabular-nums text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>{unreadCount}</span>
                  </button>
                  <ReviewBar total={notifications.length} unread={unreadCount} />
                </Section>
              </div>
            </ScrollArea>
          </Panel>

          {/* ── COLUMN 2 — Live feed ────────────────────────────────── */}
          <Panel className="flex flex-col min-w-0">
            <PanelHeader title="Event feed">
              <span className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                {filtered.length} event{filtered.length !== 1 ? "s" : ""}
              </span>
            </PanelHeader>

            {/* Mobile search (filters column is hidden below lg) */}
            <div className="lg:hidden px-3 pt-3">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search logs"
                className="w-full h-8 px-3 rounded-lg text-xs outline-none"
                style={{
                  background: "rgb(var(--surface-raised) / 0.4)",
                  border: "1px solid rgb(var(--surface-border) / 0.3)",
                  color: "rgb(var(--text-primary))",
                }}
              />
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                Icon={notifications.length === 0 ? ScrollText : Search}
                title={notifications.length === 0 ? "No events logged yet" : "No events match these filters"}
                hint={notifications.length === 0
                  ? "Account, moderation and deletion events will appear here."
                  : "Widen the time range or reset the filters."}
                action={notifications.length > 0 && hasFilters ? { label: "Reset filters", onClick: resetFilters } : null}
              />
            ) : (
              <ScrollArea className="flex-1 min-h-0">
                {grouped.map(({ key, label, items }) => (
                  <div key={key}>
                    <div
                      className="sticky top-0 z-10 px-4 py-1.5 text-[11px] font-semibold backdrop-blur"
                      style={{
                        background: "rgb(var(--surface) / 0.85)",
                        color: "rgb(var(--text-faint))",
                        borderBottom: "1px solid rgb(var(--surface-border) / 0.15)",
                      }}
                    >
                      {label} <span className="font-normal opacity-70">· {items.length}</span>
                    </div>

                    {items.map(n => (
                      <FeedRow
                        key={n.id}
                        n={n}
                        read={isReadByMe(n)}
                        active={selectedId === n.id}
                        onSelect={() => select(n)}
                      />
                    ))}
                  </div>
                ))}

                {filtered.length > limit && (
                  <div className="p-3">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setLimit(l => l + PAGE_SIZE)}
                      className="w-full h-8 text-xs cursor-pointer"
                      style={{ color: "rgb(var(--brand-300))", border: "1px solid rgb(var(--surface-border) / 0.25)" }}
                    >
                      Show {Math.min(PAGE_SIZE, filtered.length - limit)} more
                    </Button>
                  </div>
                )}
              </ScrollArea>
            )}
          </Panel>

          {/* ── COLUMN 3 — Inspector ────────────────────────────────── */}
          <Panel
            className="flex flex-col min-w-0"
            style={selected ? {
              border: `1px solid ${cfgOf(selected).color}50`,
              boxShadow: `0 0 24px ${cfgOf(selected).color}12`,
            } : undefined}
          >
            {selected ? (
              <Inspector
                key={selected.id}
                notif={selected}
                related={notifications
                  .filter(n => n.id !== selected.id && (
                    (selected.content_title && n.content_title === selected.content_title) ||
                    (selected.recipient_user_id && n.recipient_user_id === selected.recipient_user_id && n.type === selected.type)
                  ))
                  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                  .slice(0, 5)}
                onSelectRelated={select}
              />
            ) : (
              <EmptyState
                Icon={MailOpen}
                title="Select an event"
                hint="Pick a log from the feed, or use ↑ ↓ to move through them."
              />
            )}
          </Panel>
        </div>
      )}
    </div>
  )
}

/* ── Feed row ───────────────────────────────────────────────────────────── */

function FeedRow({ n, read, active, onSelect }) {
  const cfg = cfgOf(n)
  const { Icon } = cfg

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect() } }}
      className="group relative flex items-start gap-3 pl-5 pr-3 py-3 cursor-pointer border-l-2 transition-colors outline-none focus-visible:ring-1"
      style={{
        background: active ? `${cfg.color}10` : read ? "transparent" : "rgb(var(--surface-raised) / 0.25)",
        borderLeftColor: active ? cfg.color : "transparent",
        borderBottom: "1px solid rgb(var(--surface-border) / 0.1)",
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = `${cfg.color}08` }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = read ? "transparent" : "rgb(var(--surface-raised) / 0.25)" }}
    >
      {!read && (
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{ background: "rgb(var(--brand-400))", boxShadow: "0 0 6px rgb(var(--accent-400) / 0.8)" }}
        />
      )}

      <div
        className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
      >
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className="text-xs font-semibold truncate"
            style={{ color: read ? "rgb(var(--text-muted))" : "rgb(var(--text-primary))" }}
          >
            {n.title}
          </p>
          <span className="text-[11px] shrink-0 tabular-nums" style={{ color: "rgb(var(--text-faint))" }}>
            {clockTime(n.created_at)}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed line-clamp-2 mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
          {n.message}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
          >
            {cfg.label}
          </span>
          {n.content_title && (
            <span className="text-[10px] truncate" style={{ color: "rgb(var(--text-faint))" }}>
              {n.content_title}
            </span>
          )}
        </div>
      </div>

    </div>
  )
}

/* ── Inspector ──────────────────────────────────────────────────────────── */

function Inspector({ notif, related, onSelectRelated }) {
  const cfg = cfgOf(notif)
  const { Icon } = cfg
  const [copied, setCopied] = useState(false)

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(notif.id))
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-5 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}>
        <div
          className="h-px mb-4 -mx-5 -mt-5"
          style={{ background: `linear-gradient(to right, transparent, ${cfg.color}60, transparent)` }}
        />
        <div className="flex items-start gap-3">
          <div
            className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
          >
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h2 className="text-sm font-bold leading-snug" style={{ color: "rgb(var(--text-primary))" }}>
              {notif.title}
            </h2>
            <span
              className="inline-block text-[11px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-5 py-4 space-y-5">

          <Block Icon={Mail} label="Message">
            <div
              className="px-3.5 py-3 rounded-xl text-sm leading-relaxed"
              style={{
                background: "rgb(var(--surface-raised) / 0.4)",
                border: "1px solid rgb(var(--surface-border) / 0.25)",
                color: "rgb(var(--text-secondary))",
              }}
            >
              {notif.message}
            </div>
          </Block>

          <Block Icon={Clock} label="Logged">
            <p className="text-sm" style={{ color: "rgb(var(--text-muted))" }}>{fullDate(notif.created_at)}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>{relativeTime(notif.created_at)}</p>
          </Block>

          {(notif.content_type || notif.content_title || notif.reason) && (
            <Block Icon={Hash} label="Details">
              <div className="space-y-2">
                {notif.content_type  && <MetaRow label="Content type"  value={notif.content_type} />}
                {notif.content_title && <MetaRow label="Content title" value={notif.content_title} />}
                {notif.reason        && <MetaRow label="Reason"        value={notif.reason} highlight />}
              </div>
            </Block>
          )}

          {related.length > 0 && (
            <Block Icon={ArrowRight} label="Related events">
              <div className="space-y-1.5">
                {related.map(r => {
                  const rc = cfgOf(r)
                  return (
                    <button
                      key={r.id}
                      onClick={() => onSelectRelated(r)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left cursor-pointer transition-colors"
                      style={{
                        background: "rgb(var(--surface-raised) / 0.3)",
                        border: "1px solid rgb(var(--surface-border) / 0.2)",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = `${rc.color}50`}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.2)"}
                    >
                      <rc.Icon className="w-3.5 h-3.5 shrink-0" style={{ color: rc.color }} />
                      <span className="flex-1 min-w-0 text-[11px] truncate" style={{ color: "rgb(var(--text-muted))" }}>
                        {r.title}
                      </span>
                      <span className="text-[10px] shrink-0" style={{ color: "rgb(var(--text-faint))" }}>
                        {relativeTime(r.created_at)}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Block>
          )}
        </div>
      </ScrollArea>

      {/* Actions */}
      <div
        className="px-5 py-3 shrink-0 flex items-center justify-between gap-2"
        style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.2)" }}
      >
        <button
          onClick={copyId}
          className="flex items-center gap-1.5 text-[11px] font-mono cursor-pointer min-w-0"
          style={{ color: "rgb(var(--text-faint))" }}
          title="Copy log ID"
        >
          {copied ? <Check className="w-3 h-3 shrink-0" style={{ color: "#34d399" }} /> : <Copy className="w-3 h-3 shrink-0" />}
          <span className="truncate max-w-[170px]">{copied ? "Copied" : notif.id}</span>
        </button>

        <span className="text-[11px] shrink-0" style={{ color: "rgb(var(--text-faint))" }}>
          Read-only record
        </span>
      </div>
    </div>
  )
}

/* ── Small building blocks ──────────────────────────────────────────────── */

function Panel({ children, className = "", style }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: "rgb(var(--surface) / 0.3)",
        border: "1px solid rgb(var(--surface-border) / 0.25)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function PanelHeader({ title, accent = false, children }) {
  return (
    <div
      className="px-4 py-3 flex items-center justify-between shrink-0"
      style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
    >
      <span
        className="text-xs font-bold tracking-wide"
        style={{ color: accent ? "rgb(var(--brand-400))" : "rgb(var(--text-secondary))" }}
      >
        {title}
      </span>
      {children}
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold px-0.5" style={{ color: "rgb(var(--text-faint))" }}>{label}</p>
      {children}
    </div>
  )
}

function Block({ Icon, label, children }) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold flex items-center gap-1.5 mb-2"
        style={{ color: "rgb(var(--text-faint))" }}
      >
        <Icon className="w-3.5 h-3.5 opacity-70" />{label}
      </p>
      {children}
    </div>
  )
}

function ReviewBar({ total, unread }) {
  if (!total) return null
  const pct = Math.round(((total - unread) / total) * 100)
  return (
    <div className="px-1 pt-2">
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgb(var(--surface-border) / 0.3)" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(to right, rgb(var(--brand-500)), rgb(var(--accent-500)))",
          }}
        />
      </div>
      <p className="text-[11px] mt-1.5" style={{ color: "rgb(var(--text-faint))" }}>{pct}% reviewed</p>
    </div>
  )
}

function EmptyState({ Icon, title, hint, action }) {
  return (
    <div className="flex-1 h-full flex flex-col items-center justify-center gap-4 px-6 py-16 select-none">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ border: "1px solid rgb(var(--surface-border) / 0.25)", background: "rgb(var(--surface-raised) / 0.3)" }}
      >
        <Icon className="w-6 h-6 opacity-40" style={{ color: "rgb(var(--text-faint))" }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-faint))" }}>{title}</p>
        <p className="text-xs mt-1 max-w-[240px]" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>{hint}</p>
      </div>
      {action && (
        <Button
          variant="ghost" size="sm" onClick={action.onClick}
          className="h-8 px-3 text-xs cursor-pointer"
          style={{ color: "rgb(var(--brand-300))", border: "1px solid rgb(var(--surface-border) / 0.3)" }}
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

function GhostButton({ children, onClick, hover, hoverBg, hoverBorder }) {
  return (
    <Button
      size="sm" variant="ghost" onClick={onClick}
      className="h-8 px-3 cursor-pointer text-xs gap-1.5 transition-all"
      style={{ color: "rgb(var(--text-faint))", border: "1px solid transparent" }}
      onMouseEnter={e => {
        e.currentTarget.style.color = hover
        e.currentTarget.style.background = hoverBg
        e.currentTarget.style.borderColor = hoverBorder
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = "rgb(var(--text-faint))"
        e.currentTarget.style.background = "transparent"
        e.currentTarget.style.borderColor = "transparent"
      }}
    >
      {children}
    </Button>
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
      <span className="text-[11px] shrink-0 w-20" style={{ color: "rgb(var(--text-faint))" }}>{label}</span>
      <span
        className="text-[11px] font-medium break-words min-w-0"
        style={{ color: highlight ? "#fbbf24" : "rgb(var(--text-muted))" }}
      >
        {value}
      </span>
    </div>
  )
}