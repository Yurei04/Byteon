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
      gradient: "from-yellow-500/15 to-amber-600/10",
      border: "border-yellow-500/25",
      glow: "shadow-yellow-500/10",
      icon: "text-yellow-400",
      value: "text-yellow-100",
      label: "text-yellow-400/80",
      rank: "🥇",
    }
  if (name.includes("2nd") || name.includes("second") || name.includes("silver"))
    return {
      gradient: "from-slate-400/15 to-gray-500/10",
      border: "border-slate-400/25",
      glow: "shadow-slate-400/10",
      icon: "text-slate-300",
      value: "text-slate-100",
      label: "text-slate-400/80",
      rank: "🥈",
    }
  if (name.includes("3rd") || name.includes("third") || name.includes("bronze"))
    return {
      gradient: "from-orange-600/15 to-amber-700/10",
      border: "border-orange-600/25",
      glow: "shadow-orange-600/10",
      icon: "text-orange-500",
      value: "text-orange-100",
      label: "text-orange-400/80",
      rank: "🥉",
    }
  if (name.includes("participation"))
    return {
      gradient: "from-violet-500/15 to-purple-600/10",
      border: "border-violet-500/25",
      glow: "shadow-violet-500/10",
      icon: "text-violet-400",
      value: "text-violet-100",
      label: "text-violet-400/80",
      rank: "🎖️",
    }
  return {
    gradient: "from-sky-500/15 to-blue-600/10",
    border: "border-sky-500/25",
    glow: "shadow-sky-500/10",
    icon: "text-sky-400",
    value: "text-sky-100",
    label: "text-sky-400/80",
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
        <p className="text-[11px] uppercase tracking-wider font-semibold text-white/30 mb-0.5">{label}</p>
        <p className="text-sm text-white/80 leading-relaxed">{value}</p>
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
          background:  t.cardBg,
          border:      t.borderColor,
          boxShadow:   "none",
          borderRadius: "16px",
          ...t.cssVars,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = t.cardShadow
          e.currentTarget.style.border    = t.borderColorStrong
          e.currentTarget.style.transform = "translateY(-2px)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none"
          e.currentTarget.style.border    = t.borderColor
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
                <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: t.primaryText }}>
                  {item.organization}
                </p>
              )}
              <h3 className="text-lg font-bold leading-snug line-clamp-2 text-white">
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
            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: t.primaryText }} />
            <span className="text-white/50 text-xs">{formatUTCDateShort(item.date_begin)}</span>
            <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
            <span className="text-white/70 text-xs font-medium">{formatUTCDateShort(item.date_end)}</span>
          </div>

          {/* ── Meta chips ── */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {item.open_to && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/8 text-white/55">
                <Users className="w-3 h-3" />
                {item.open_to}
              </span>
            )}
            {item.countries && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/8 text-white/55">
                <MapPin className="w-3 h-3" />
                {item.countries}
              </span>
            )}
            {prizes.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400/80">
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
            <span>By <span className="text-white/55 font-medium">{item.author}</span></span>
            {trackingStats && (
              <span className="flex items-center gap-1" style={{ color: t.primaryText }}>
                {trackingStats.icon}
                <span className="font-semibold text-white/60">{trackingStats.count}</span>
                <span className="text-white/30">{trackingStats.label.toLowerCase()}</span>
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
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200"
                    style={{ background: t.buttonGradient, boxShadow: t.buttonShadow }}
                    onMouseEnter={(e) => e.currentTarget.style.background = t.buttonHoverGradient}
                    onMouseLeave={(e) => e.currentTarget.style.background = t.buttonGradient}
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
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white/80 transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)" }}
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
          className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 text-white"
          style={{
            background: "linear-gradient(160deg, #0a0a0f 0%, #0d0d18 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            ...t.cssVars,
          }}
        >
          {/* ── Dialog Header ── */}
          <div
            className="sticky top-0 z-10 px-7 pt-7 pb-5"
            style={{
              background: "linear-gradient(to bottom, #0a0a0f 70%, transparent)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <DialogHeader>
              {item.organization && (
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: t.primaryText }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: t.primaryText }}>
                    {item.organization}
                  </span>
                </div>
              )}
              <DialogTitle className="text-2xl font-bold text-white leading-tight">
                {item.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <StatusPill isExpired={isExpired} daysRemaining={daysRemaining} t={t} />
                {prizes.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 border border-amber-500/25 text-amber-400">
                    <Trophy className="w-3 h-3" />
                    {prizes.length} Prize{prizes.length !== 1 ? "s" : ""} Available
                  </span>
                )}
                {trackingStats && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-white/50">
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
              <p className="text-[11px] uppercase tracking-wider font-semibold text-white/25 mb-3">About</p>
              <p className="text-sm text-white/65 leading-relaxed whitespace-pre-line">{item.des}</p>
            </div>

            {/* ── Prizes ── */}
            {prizes.length > 0 && (
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-white/25 mb-3">Prize Pool</p>
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
                  iconColor={t.primaryText}
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
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                      style={{ background: t.buttonGradient, boxShadow: t.buttonShadow }}
                      onMouseEnter={(e) => e.currentTarget.style.background = t.buttonHoverGradient}
                      onMouseLeave={(e) => e.currentTarget.style.background = t.buttonGradient}
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