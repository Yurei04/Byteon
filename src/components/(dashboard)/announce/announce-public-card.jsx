"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Calendar, ExternalLink, Award, Users, AlertCircle,
  MousePointerClick, Trophy, Globe, Clock, ChevronRight,
  MapPin, Sparkles,
} from "lucide-react"
import { Button } from "../../ui/button"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import AnnouncementTrackingBadge from "./announce-tracking-badge"

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

function getDaysRemaining(dateEnd) {
  if (!dateEnd) return null
  const diff = new Date(dateEnd) - new Date()
  if (diff <= 0) return null
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  return days
}

/* ─── Constants ──────────────────────────────────────────────────────────── */

const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")

const getPrizeColorScheme = (prizeName) => {
  const name = prizeName.toLowerCase()

  if (name.includes("1st") || name.includes("first") || name.includes("gold"))
    return {
      gradient:
        "from-yellow-500/40 via-yellow-400/15 to-transparent dark:from-yellow-500/15 dark:to-yellow-500/5",
      border: "border-yellow-500/20 dark:border-yellow-500/30",
      glow: "shadow-yellow-500/10",
      icon: "text-yellow-500 dark:text-yellow-400",
      value: "text-foreground",
      label: "text-muted-foreground",
      rank: "🥇",
    }

  if (name.includes("2nd") || name.includes("second") || name.includes("silver"))
    return {
      gradient:
        "from-slate-400/40 via-slate-300/15 to-transparent dark:from-slate-400/15 dark:to-slate-400/5",
      border: "border-slate-400/20 dark:border-slate-400/30",
      glow: "shadow-slate-400/10",
      icon: "text-slate-500 dark:text-slate-300",
      value: "text-foreground",
      label: "text-muted-foreground",
      rank: "🥈",
    }

  if (name.includes("3rd") || name.includes("third") || name.includes("bronze"))
    return {
      gradient:
        "from-orange-500/40 via-amber-500/15 to-transparent dark:from-orange-500/15 dark:to-orange-500/5",
      border: "border-orange-500/20 dark:border-orange-500/30",
      glow: "shadow-orange-500/10",
      icon: "text-orange-500 dark:text-orange-400",
      value: "text-foreground",
      label: "text-muted-foreground",
      rank: "🥉",
    }

  if (name.includes("participation"))
    return {
      gradient:
        "from-violet-500/10 via-purple-500/5 to-transparent dark:from-violet-500/15 dark:to-violet-500/5",
      border: "border-violet-500/20 dark:border-violet-500/30",
      glow: "shadow-violet-500/10",
      icon: "text-violet-500 dark:text-violet-400",
      value: "text-foreground",
      label: "text-muted-foreground",
      rank: "🎖️",
    }

  return {
    gradient:
      "from-sky-500/10 via-blue-500/5 to-transparent dark:from-sky-500/15 dark:to-sky-500/5",
    border: "border-sky-500/20 dark:border-sky-500/30",
    glow: "shadow-sky-500/10",
    icon: "text-sky-500 dark:text-sky-400",
    value: "text-foreground",
    label: "text-muted-foreground",
    rank: "🏆",
  }
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StatusPill({ isExpired, daysRemaining, t }) {
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide bg-red-500/15 border border-red-500/30 text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
        Expired
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
      style={{ background: t.badgeBgPrimary, border: t.borderColorLight, color: t.primaryText }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: "currentColor" }} />
      {daysRemaining ? `${daysRemaining}d left` : "Active"}
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
        <p className="text-sm  leading-relaxed"
          style={{ color: "rgb(var(--text-secondary))" }}
        >{value}</p>
      </div>
    </div>
  )
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function AnnouncementPublicCard({ item, theme, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const t = theme || FALLBACK_THEME

  const isExpired    = new Date(item.date_end) < new Date()
  const daysRemaining = getDaysRemaining(item.date_end)
  const prizes       = item.prizes || []

  const handleWebsiteLinkClick = async (e) => {
    e.stopPropagation()
    if (item.tracking_method === "manual" && item.website_link) {
      try {
        await supabase.from("announcements").update({
          website_clicks:    (item.website_clicks    || 0) + 1,
          registrants_count: (item.registrants_count || 0) + 1,
        }).eq("id", item.id)
      } catch (err) { console.error("Error tracking click:", err) }
    }
  }

  const getTrackingStats = () => {
    const method = item.tracking_method || "manual"
    if (method === "manual")
      return { icon: <MousePointerClick className="w-3.5 h-3.5" />, label: "Clicks", count: item.website_clicks || 0 }
    if (method === "automatic")
      return { icon: <Users className="w-3.5 h-3.5" />, label: "Registrants", count: item.registrants_count || 0, hasError: item.sync_error }
    return null
  }

  const trackingStats = getTrackingStats()

  return (
    <>
      {/* ══════════════════════════════════════════
          CARD
      ══════════════════════════════════════════ */}
      <Card
        className="group relative overflow-hidden cursor-pointer transition-all duration-300"
        style={{
          background: "rgb(var(--surface-raised))",
          border: "1px solid rgb(var(--surface-border) / 0.60)",
          borderRadius: "16px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)"
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Gradient hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: t.overlayGradient }}
        />

        {/* Top accent line */}
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
            <StatusPill isExpired={isExpired} daysRemaining={daysRemaining} t={t} />
          </div>

          {/* ── Date range ── */}
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-secondary))" }} />
            <span className=" text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>{formatUTCDateShort(item.date_begin)}</span>
            <ChevronRight className="w-3 h-3 shrink-0"  style={{ color: "rgb(var(--text-secondary))" }}/>
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-secondary))" }}>{formatUTCDateShort(item.date_end)}</span>
          </div>

          {/* ── Meta chips ── */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {item.open_to && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md" 
              style={{ color: "rgb(var(--text-faint))", border: "rgb(var(--bg-muted:   250 232 255; ))" }}>
                <Users className="w-3 h-3" />
                {item.open_to}
              </span>
            )}
            {item.countries && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md"
              style={{ color: "rgb(var(--text-faint))"}}
              >
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
            {item.google_sheet_csv_url && (
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
          <div className="flex items-center justify-between text-xs text-white/35">
            <span style={{ color: "rgb(var(--text-faint))"}}>By <span className="text-white/55 font-medium"
              style={{ color: "rgb(var(--text-faint))"}}
            >{item.author}</span></span>
            {trackingStats && (
              <span className="flex items-center gap-1" style={{ color: "rgb(var(--text-faint))"}}>
                {trackingStats.icon}
                <span className="font-semibold" style={{ color: "rgb(var(--text-primary))"}}>{trackingStats.count}</span>
                <span style={{ color: "rgb(var(--text-muted))"}}>{trackingStats.label.toLowerCase()}</span>
              </span>
            )}
          </div>

          {/* ── Action buttons ── */}
          {(item.website_link || item.dev_link) && (
            <div className="flex gap-2 pt-1" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {item.website_link && (
                <a
                  href={item.website_link} target="_blank" rel="noopener noreferrer"
                  className="flex-1" onClick={handleWebsiteLinkClick}
                >
                  <button
                    className="
                      w-full cursor-pointer flex items-center justify-center gap-1.5
                      px-3 py-2 rounded-lg text-xs font-semibold
                      transition-all duration-200

                      text-text-primary
                      bg-[rgb(var(--bg-overlay))]
                      border border-surface-border

                      hover:text-text-secondary
                      hover:border-surface-border
                      hover:bg-[rgb(var(--bg-overlay))]
                    "
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {item.tracking_method === "manual" ? "Register" : "Website"}
                  </button>
                </a>
              )}
              {item.dev_link && (
                <a
                  href={item.dev_link} target="_blank" rel="noopener noreferrer"
                  className="flex-1" onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                    style={{
                      color: "rgb(var(--text-primary))",
                      background: "rgb(var(--bg-overlay))",
                      border: "1px solid rgb(var(--bg-surface-border))",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgb(var(--bg-overlay) / 0.15)"}}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgb(var(--bg-overlay))" }}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />DevPost
                  </button>
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════
          DIALOG
      ══════════════════════════════════════════ */}
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
              <DialogTitle className="text-2xl font-bold tleading-tight" style={{ color: "rgb(var(--text-primary))" }}>
                {item.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusPill style={{ color: "rgb(var(--text-muted))" }} isExpired={isExpired} daysRemaining={daysRemaining} t={t} />
                {prizes.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100/90 border-amber-500/50 text-amber-600 dark:bg-amber-500/10 border dark:border-amber-500/20 dark:text-amber-400/80">
                    <Trophy className="w-3 h-3" />
                    {prizes.length} Prize{prizes.length !== 1 ? "s" : ""} Available
                  </span>
                )}
                {trackingStats && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold" 
                    style={{
                      background: "rgb(var(--surface-raised))",
                      border: "1px solid rgb(var(--surface-border) / 0.15)",
                      color: "rgb(var(--text-faint))"
                    }}
                  >
                    {trackingStats.icon}
                    {trackingStats.count} {trackingStats.label}
                  </span>
                )}
              </div>
            </DialogHeader>
          </div>

          <div className="px-7 pb-7 space-y-6 pt-5">

            {/* ── Description ── */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold  mb-3" style={{ color: "rgb(var(--text-muted))" }}>About</p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgb(var(--text-secondary))" }}>{item.des}</p>
            </div>

            {/* ── Prizes ── */}
            {prizes.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: "rgb(var(--text-muted))" }}>Prize Pool</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {prizes.map((prize, index) => {
                    const cs = getPrizeColorScheme(prize.name)
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
                            </p>
                            <p className={`text-xl font-bold ${cs.value} leading-tight`}>
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

            {/* ── Event Details ── */}
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-white/25 mb-3">Event Details</p>
              <div
                className="rounded-xl overflow-hidden divide-y divide-white/5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <DetailRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Starts"
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
                  <DetailRow
                    icon={<Users className="w-4 h-4" />}
                    label="Open To"
                    value={item.open_to}
                    iconColor={t.labelText}
                  />
                )}
                {item.countries && (
                  <DetailRow
                    icon={<MapPin className="w-4 h-4" />}
                    label="Location"
                    value={item.countries}
                    iconColor="#60a5fa"
                  />
                )}
                <DetailRow
                  icon={<Award className="w-4 h-4" />}
                  label="Organized By"
                  value={item.author}
                  iconColor={t.labelText}
                />
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

            {/* ── Action buttons ── */}
            {(item.website_link || item.dev_link) && (
              <div className="flex gap-3 pt-1">
                {item.website_link && (
                  <a
                    href={item.website_link} target="_blank" rel="noopener noreferrer"
                    className="flex-1"
                    onClick={(e) => { e.stopPropagation(); handleWebsiteLinkClick(e) }}
                  >
                    <button
                      className="
                        w-full cursor-pointer flex items-center justify-center gap-1.5
                        px-3 py-2 rounded-lg text-xs font-semibold
                        transition-all duration-200

                        text-text-primary
                        bg-[rgb(var(--bg-overlay))]
                        border border-surface-border

                        hover:text-text-secondary
                        hover:border-surface-border
                        hover:bg-[rgb(var(--bg-overlay))]
                      "
                    >
                      <ExternalLink className="w-4 h-4" />
                      {item.tracking_method === "manual" ? "Register Now" : "Visit Website"}
                    </button>
                  </a>
                )}
                {item.dev_link && (
                  <a
                    href={item.dev_link} target="_blank" rel="noopener noreferrer"
                    className="flex-1" onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white/75 transition-all duration-200"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.10)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)" }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View on DevPost
                    </button>
                  </a>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}