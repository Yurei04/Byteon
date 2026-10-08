"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar, Award, Users, AlertCircle, MousePointerClick, Trophy, Clock,
  ChevronRight, MapPin, Sparkles, Megaphone, Lock,
  Globe, Code2, MessageCircle, FileText, ArrowUpRight, Activity,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { getPhase, daysUntil } from "@/lib/announcement-config"
import AnnouncementTrackingBadge from "./announce-tracking-badge"
import InviteCodeGate from "./invite-code-gate"

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function formatUTCDateTime(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  return (
    new Intl.DateTimeFormat("en-GB", {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
      hour12: false, timeZone: "UTC",
    }).format(date) + " UTC"
  )
}

function formatUTCDateShort(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    month: "short", day: "numeric", year: "numeric",
    timeZone: "UTC",
  }).format(date)
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")

/**
 * Public links. google_sheet_csv_url is intentionally NOT here — it is an
 * internal tracking source and must never be shown to visitors.
 * `rgb` is a space-separated triple so we can build tinted backgrounds/borders.
 */
const LINK_DEFS = [
  {
    key: "website_link", Icon: Globe, rgb: "139 92 246",
    sm: (manual) => (manual ? "Register" : "Website"),
    lg: (manual) => (manual ? "Register Now" : "Visit Website"),
    hint: "Official event page",
  },
  {
    key: "dev_link", Icon: Code2, rgb: "59 130 246",
    sm: () => "DevPost", lg: () => "View on DevPost",
    hint: "Submissions & project gallery",
  },
  {
    key: "community_link", Icon: MessageCircle, rgb: "16 185 129",
    sm: () => "Community", lg: () => "Join Community",
    hint: "Chat with organizers & teammates",
  },
  {
    key: "google_forms_url", Icon: FileText, rgb: "245 158 11",
    sm: () => "Form", lg: () => "Open Form",
    hint: "Registration / application form",
  },
]

const getPrizeColorScheme = (prizeName, prizeType) => {
  const name = prizeName.toLowerCase()
  const base = { value: "text-foreground", label: "text-muted-foreground" }

  if (name.includes("1st") || name.includes("first") || name.includes("gold"))
    return { ...base,
      gradient: "from-yellow-500/40 via-yellow-400/15 to-transparent dark:from-yellow-500/15 dark:to-yellow-500/5",
      border: "border-yellow-500/20 dark:border-yellow-500/30", glow: "shadow-yellow-500/10",
      icon: "text-yellow-500 dark:text-yellow-400", rank: "🥇" }

  if (name.includes("2nd") || name.includes("second") || name.includes("silver"))
    return { ...base,
      gradient: "from-slate-400/40 via-slate-300/15 to-transparent dark:from-slate-400/15 dark:to-slate-400/5",
      border: "border-slate-400/20 dark:border-slate-400/30", glow: "shadow-slate-400/10",
      icon: "text-slate-500 dark:text-slate-300", rank: "🥈" }

  if (name.includes("3rd") || name.includes("third") || name.includes("bronze"))
    return { ...base,
      gradient: "from-orange-500/40 via-amber-500/15 to-transparent dark:from-orange-500/15 dark:to-orange-500/5",
      border: "border-orange-500/20 dark:border-orange-500/30", glow: "shadow-orange-500/10",
      icon: "text-orange-500 dark:text-orange-400", rank: "🥉" }

  if (name.includes("participation"))
    return { ...base,
      gradient: "from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-500/15 dark:to-violet-500/5",
      border: "border-violet-500/20 dark:border-violet-500/30", glow: "shadow-violet-500/10",
      icon: "text-violet-500 dark:text-violet-400", rank: "🎖️" }

  if (prizeType === "non_cash")
    return { ...base,
      gradient: "from-teal-500/10 via-emerald-500/5 to-transparent dark:from-teal-500/15 dark:to-teal-500/5",
      border: "border-teal-500/20 dark:border-teal-500/30", glow: "shadow-teal-500/10",
      icon: "text-teal-500 dark:text-teal-400", rank: "🎁" }

  return { ...base,
    gradient: "from-sky-500/10 via-blue-500/5 to-transparent dark:from-sky-500/15 dark:to-sky-500/5",
    border: "border-sky-500/20 dark:border-sky-500/30", glow: "shadow-sky-500/10",
    icon: "text-sky-500 dark:text-sky-400", rank: "🏆" }
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

// phase: "upcoming" | "open" | "live" | "ended"  (see getPhase)
function StatusPill({ phase, item, t }) {
  const fixed = {
    ended:    { text: "Ended",                                       cls: "bg-red-500/15 border border-red-500/30 text-red-400",             dot: "bg-red-400",     pulse: false },
    upcoming: { text: `Opens in ${daysUntil(item.promo_begin)}d`,    cls: "bg-amber-500/15 border border-amber-500/30 text-amber-500",       dot: "bg-amber-400",   pulse: false },
    live:     { text: `Live · ${daysUntil(item.date_end)}d left`,    cls: "bg-emerald-500/15 border border-emerald-500/30 text-emerald-500", dot: "bg-emerald-400", pulse: true  },
  }[phase]

  if (fixed) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide ${fixed.cls}`}>
        <span className={`w-1.5 h-1.5 rounded-full inline-block ${fixed.dot} ${fixed.pulse ? "animate-pulse" : ""}`} />
        {fixed.text}
      </span>
    )
  }
  // "open": promotion running, hackathon not started yet
  const d = daysUntil(item.date_begin)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
      style={{ background: t.badgeBgPrimary, border: t.borderColorLight, color: t.primaryText }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "currentColor" }} />
      {d > 0 ? `Starts in ${d}d` : "Starting soon"}
    </span>
  )
}

function DetailRow({ icon, label, value, iconColor }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="mt-0.5 shrink-0" style={{ color: iconColor }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "rgb(var(--text-muted))" }}>{label}</p>
        <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{value}</p>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function AnnouncementPublicCard({ item, theme, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [unlockedLinks, setUnlockedLinks] = useState(null) // set after a valid invite code
  const t = theme || FALLBACK_THEME

  const phase    = getPhase(item)
  const prizes   = item.prizes || []
  const isInvite = !!item.is_invite_only
  const isManual = (item.tracking_method || "manual") === "manual"
  const isAuto   = item.tracking_method === "automatic"

  // Links are only exposed once the schedule allows it and, for invite-only events, once the code is verified.
  // NOTE: for invite-only events, the unlock RPC should return
  // { website_link, dev_link, community_link, google_forms_url }.
  const links = isInvite
    ? (unlockedLinks ?? {})
    : {
        website_link:     item.website_link,
        dev_link:         item.dev_link,
        community_link:   item.community_link,
        google_forms_url: item.google_forms_url,
      }
  const activeLinks = LINK_DEFS.filter((d) => links[d.key])

  const registrationClosedYet = phase === "upcoming"
  const showLinks = !registrationClosedYet && activeLinks.length > 0
  const needsCode = isInvite && !unlockedLinks && !registrationClosedYet

  const handleLinkClick = async (e, key) => {
    e.stopPropagation()
    if (key === "website_link" && isManual && links.website_link) {
      try {
        await supabase.from("announcements").update({
          website_clicks:    (item.website_clicks    || 0) + 1,
          registrants_count: (item.registrants_count || 0) + 1,
        }).eq("id", item.id)
      } catch (err) { console.error("Error tracking click:", err) }
    }
  }

  const getTrackingStats = () => {
    if (registrationClosedYet) return null // nothing to track before promotion starts
    if (isManual)
      return {
        Icon: MousePointerClick, label: "Clicks", rgb: "139 92 246",
        count: item.website_clicks || 0,
        note: "Counted each time someone taps Register",
      }
    if (isAuto)
      return {
        Icon: Users, label: "Registrants", rgb: "16 185 129",
        count: item.registrants_count || 0, hasError: item.sync_error,
        note: "Updated automatically from registrations",
      }
    return null
  }

  const trackingStats = getTrackingStats()

  /* ── Link buttons: each type has its own icon + color ── */
  const renderLinkButtons = (size) => {
    if (size === "lg") {
      return (
        <div>
          <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
            Links
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeLinks.map(({ key, Icon, rgb, lg, hint }, i) => (
              <a
                key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
                onClick={(e) => handleLinkClick(e, key)}
                className={`group/link flex items-center gap-3 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 ${
                  activeLinks.length % 2 === 1 && i === activeLinks.length - 1 ? "sm:col-span-2" : ""
                }`}
                style={{ background: `rgb(${rgb} / 0.08)`, border: `1px solid rgb(${rgb} / 0.28)` }}
              >
                <span
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ background: `rgb(${rgb} / 0.18)`, color: `rgb(${rgb})` }}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold truncate" style={{ color: "rgb(var(--text-primary))" }}>
                    {lg(isManual)}
                  </span>
                  <span className="block text-xs truncate" style={{ color: "rgb(var(--text-muted))" }}>{hint}</span>
                </span>
                <ArrowUpRight
                  className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
                  style={{ color: `rgb(${rgb})` }}
                />
              </a>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div
        className="grid grid-cols-2 gap-2 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {activeLinks.map(({ key, Icon, rgb, sm }, i) => (
          <a
            key={key} href={links[key]} target="_blank" rel="noopener noreferrer"
            onClick={(e) => handleLinkClick(e, key)}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200 hover:-translate-y-px ${
              activeLinks.length % 2 === 1 && i === activeLinks.length - 1 ? "col-span-2" : ""
            }`}
            style={{
              background: `rgb(${rgb} / 0.12)`,
              border: `1px solid rgb(${rgb} / 0.30)`,
              color: `rgb(${rgb})`,
            }}
          >
            <Icon className="w-3.5 h-3.5" />
            {sm(isManual)}
          </a>
        ))}
      </div>
    )
  }

  return (
    <>
      {/* ══════════════ CARD ══════════════ */}
      <Card
        className="group relative overflow-hidden cursor-pointer transition-all duration-300"
        style={{
          background: "rgb(var(--surface-raised))",
          border: "1px solid rgb(var(--surface-border) / 0.60)",
          borderRadius: "16px",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)" }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)" }}
        onClick={() => setIsDialogOpen(true)}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: t.overlayGradient }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          style={{ background: t.bottomBarGradient }}
        />

        <CardContent className="relative p-5 flex flex-col gap-4">

          {/* ── Header: org + status ── */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {item.organization && (
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "rgb(var(--text-faint))" }}>
                  {item.organization}
                </p>
              )}
              <h3 className="text-lg font-bold leading-snug line-clamp-2" style={{ color: "rgb(var(--text-primary))" }}>
                {item.title}
              </h3>
            </div>
            <StatusPill phase={phase} item={item} t={t} />
          </div>

          {/* ── Date range (hackathon) ── */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-secondary))" }} />
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>{formatUTCDateShort(item.date_begin)}</span>
            <ChevronRight className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--text-secondary))" }} />
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>{formatUTCDateShort(item.date_end)}</span>
          </div>

          {registrationClosedYet && (
            <div className="flex items-center gap-2 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              Promotion starts {formatUTCDateShort(item.promo_begin)}
            </div>
          )}

          {/* ── Meta chips ── */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {isInvite && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-indigo-100/90 border-indigo-400/50 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/25 dark:text-indigo-300">
                <Lock className="w-3 h-3" />
                Invite only
              </span>
            )}
            {item.open_to && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: "rgb(var(--text-faint))" }}>
                <Users className="w-3 h-3" />
                {item.open_to}
              </span>
            )}
            {item.countries && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md" style={{ color: "rgb(var(--text-faint))" }}>
                <MapPin className="w-3 h-3" />
                {item.countries}
              </span>
            )}
            {prizes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100/90 border-amber-500/50 text-amber-600 dark:bg-amber-500/10 border dark:border-amber-500/20 dark:text-amber-400/80">
                <Trophy className="w-3 h-3" />
                {prizes.length} Prize{prizes.length !== 1 ? "s" : ""}
              </span>
            )}
            {/* Gate on tracking method, not on the sheet URL (which is not public) */}
            {isAuto && !registrationClosedYet && (
              <AnnouncementTrackingBadge announcementId={item.id} />
            )}
            {trackingStats?.hasError && (
              <span title={item.sync_error} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400/80 cursor-help">
                <AlertCircle className="w-3 h-3" />
                Sync Error
              </span>
            )}
          </div>

          {/* ── Author + tracking ── */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="truncate" style={{ color: "rgb(var(--text-faint))" }}>
              By <span className="font-medium">{item.author}</span>
            </span>
            {trackingStats && (
              <span
                className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full shrink-0"
                style={{
                  background: `rgb(${trackingStats.rgb} / 0.10)`,
                  border: `1px solid rgb(${trackingStats.rgb} / 0.25)`,
                }}
              >
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full"
                  style={{ background: `rgb(${trackingStats.rgb} / 0.22)`, color: `rgb(${trackingStats.rgb})` }}
                >
                  <trackingStats.Icon className="w-3 h-3" />
                </span>
                <span className="font-bold tabular-nums" style={{ color: "rgb(var(--text-primary))" }}>
                  {trackingStats.count.toLocaleString()}
                </span>
                <span style={{ color: "rgb(var(--text-muted))" }}>{trackingStats.label.toLowerCase()}</span>
              </span>
            )}
          </div>

          {/* ── Actions ── */}
          {needsCode && (
            <div
              className="flex items-center justify-center gap-1.5 pt-3 text-xs font-medium"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "rgb(var(--text-muted))" }}
            >
              <Lock className="w-3.5 h-3.5" />
              Invite code required · tap to enter
            </div>
          )}
          {showLinks && renderLinkButtons("sm")}
        </CardContent>
      </Card>

      {/* ══════════════ DIALOG ══════════════ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-3xl max-h-[92vh] overflow-y-auto p-0"
          style={{
            color: "rgb(var(--text-primary))",
            background: "rgb(var(--bg-muted))",
            border: "rgb(var(--surface-raised))",
            borderRadius: "20px",
          }}
        >
          {/* ── Dialog Header ── */}
          <div
            className="sticky top-0 z-10 px-7 pt-7 pb-5"
            style={{
              color: "rgb(var(--text-primary))",
              background: "rgb(var(--bg-muted))",
              borderBottom: "rgb(var(--surface-raised))",
            }}
          >
            <DialogHeader>
              {item.organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "rgb(var(--text-primary))" }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.primaryText }}>
                    {item.organization}
                  </span>
                </div>
              )}
              <DialogTitle className="text-2xl font-bold leading-tight" style={{ color: "rgb(var(--text-primary))" }}>
                {item.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusPill phase={phase} item={item} t={t} />
                {isInvite && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border bg-indigo-100/90 border-indigo-400/50 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/25 dark:text-indigo-300">
                    <Lock className="w-3 h-3" />
                    Invite only
                  </span>
                )}
                {prizes.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100/90 border-amber-500/50 text-amber-600 dark:bg-amber-500/10 border dark:border-amber-500/20 dark:text-amber-400/80">
                    <Trophy className="w-3 h-3" />
                    {prizes.length} Prize{prizes.length !== 1 ? "s" : ""} Available
                  </span>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="px-7 pb-7 space-y-6 pt-5">

            {/* ── Description ── */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>About</p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgb(var(--text-secondary))" }}>{item.des}</p>
            </div>

            {/* ── Prizes ── */}
            {prizes.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>Prize Pool</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prizes.map((prize, index) => {
                    const cs = getPrizeColorScheme(prize.name, prize.type)
                    return (
                      <div
                        key={index}
                        className={`bg-gradient-to-br ${cs.gradient} rounded-xl p-4 border ${cs.border} shadow-lg ${cs.glow} transition-transform duration-200 hover:scale-[1.02]`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl leading-none mt-0.5">{cs.rank}</span>
                          <div className="min-w-0">
                            <p className={`text-[10px] uppercase tracking-widest font-bold ${cs.label} mb-1`}>
                              {prize.name}
                              {prize.type === "non_cash" && <span className="ml-1.5 normal-case tracking-normal font-medium opacity-70">· item</span>}
                            </p>
                            <p className={`${prize.type === "non_cash" ? "text-base" : "text-xl"} font-bold ${cs.value} leading-tight break-words`}>
                              {prize.value}
                            </p>
                            {prize.description && (
                              <p className={`text-xs ${cs.label} mt-1.5 leading-relaxed opacity-80`}>
                                {prize.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ── Live tracking panel ── */}
            {trackingStats && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>
                  Live Tracking
                </p>
                <div
                  className="relative overflow-hidden flex items-center gap-4 rounded-xl p-4"
                  style={{
                    background: `linear-gradient(135deg, rgb(${trackingStats.rgb} / 0.14), rgb(${trackingStats.rgb} / 0.03))`,
                    border: `1px solid rgb(${trackingStats.rgb} / 0.28)`,
                  }}
                >
                  <span
                    className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0"
                    style={{ background: `rgb(${trackingStats.rgb} / 0.2)`, color: `rgb(${trackingStats.rgb})` }}
                  >
                    <trackingStats.Icon className="w-6 h-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold tabular-nums leading-none" style={{ color: "rgb(var(--text-primary))" }}>
                        {trackingStats.count.toLocaleString()}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: `rgb(${trackingStats.rgb})` }}>
                        {trackingStats.label}
                      </span>
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "rgb(var(--text-muted))" }}>{trackingStats.note}</p>
                  </div>
                  <Activity className="w-14 h-14 absolute -right-2 -bottom-2 opacity-[0.07]" style={{ color: `rgb(${trackingStats.rgb})` }} />
                </div>
              </div>
            )}

            {/* ── Event Details ── */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>Event Details</p>
              <div
                className="rounded-xl overflow-hidden divide-y divide-white/5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <DetailRow
                  icon={<Megaphone className="w-4 h-4" />}
                  label="Promotion starts"
                  value={item.promo_begin ? formatUTCDateTime(item.promo_begin) : null}
                  iconColor="#f59e0b"
                />
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Hackathon starts"
                  value={formatUTCDateTime(item.date_begin)}
                  iconColor={"rgb(var(--text-muted))"}
                />
                <DetailRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Ends"
                  value={formatUTCDateTime(item.date_end)}
                  iconColor={t.secondaryText}
                />
                {item.open_to && (
                  <DetailRow icon={<Users className="w-4 h-4" />} label="Open To" value={item.open_to} iconColor={t.labelText} />
                )}
                {item.countries && (
                  <DetailRow icon={<MapPin className="w-4 h-4" />} label="Location" value={item.countries} iconColor="#60a5fa" />
                )}
                <DetailRow
                  icon={<Lock className="w-4 h-4" />}
                  label="Access"
                  value={isInvite ? "Invite only — a code is required to join" : null}
                  iconColor="#818cf8"
                />
                <DetailRow icon={<Award className="w-4 h-4" />} label="Organized By" value={item.author} iconColor={t.labelText} />
              </div>
            </div>

            {/* ── Sync error notice ── */}
            {trackingStats?.hasError && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-xs uppercase tracking-wide mb-0.5">Sync Error</p>
                  <p className="text-xs text-red-400/70">{item.sync_error}</p>
                </div>
              </div>
            )}

            {/* ── Registration: not open yet / invite gate / links ── */}
            {registrationClosedYet && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-500 text-sm">
                <Megaphone className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Registration opens on {formatUTCDateTime(item.promo_begin)}. Check back then to join.
                </p>
              </div>
            )}
            {needsCode && <InviteCodeGate announcementId={item.id} onUnlock={setUnlockedLinks} />}
            {showLinks && renderLinkButtons("lg")}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}