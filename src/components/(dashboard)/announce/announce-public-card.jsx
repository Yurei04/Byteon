"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, ExternalLink, Award, Users, AlertCircle, MousePointerClick, Trophy, Globe } from "lucide-react"
import { Button } from "../../ui/button"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import AnnouncementTrackingBadge from "./announce-tracking-badge"


// UTC date + time formatter
function formatUTCDateTime(dateString) {
  if (!dateString) return "—"

  const date = new Date(dateString)
  if (isNaN(date)) return "—"

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date) + " UTC"
}
// Prize card color schemes based on common prize names
// ── Fallback theme if no org theme is passed ────────────────────────────────
const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")

// ── Prize colors stay semantic (gold/silver/bronze — not org-branded) ───────
const getPrizeColorScheme = (prizeName) => {
  const name = prizeName.toLowerCase()
  if (name.includes("1st") || name.includes("first") || name.includes("gold"))
    return { gradient: "from-yellow-500/10 to-amber-500/10", border: "border-yellow-400/30", icon: "text-yellow-400", text: "text-yellow-200", label: "text-yellow-300" }
  if (name.includes("2nd") || name.includes("second") || name.includes("silver"))
    return { gradient: "from-gray-400/10 to-slate-400/10", border: "border-gray-400/30", icon: "text-gray-400", text: "text-gray-200", label: "text-gray-300" }
  if (name.includes("3rd") || name.includes("third") || name.includes("bronze"))
    return { gradient: "from-orange-700/10 to-amber-700/10", border: "border-orange-600/30", icon: "text-orange-600", text: "text-orange-200", label: "text-orange-300" }
  if (name.includes("participation"))
    return { gradient: "from-purple-500/10 to-pink-500/10", border: "border-purple-400/30", icon: "text-purple-400", text: "text-purple-200", label: "text-purple-300" }
  return { gradient: "from-blue-500/10 to-indigo-500/10", border: "border-blue-400/30", icon: "text-blue-400", text: "text-blue-200", label: "text-blue-300" }
}

export default function AnnouncementPublicCard({ item, theme, onDelete }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Use org theme if passed, otherwise fall back to default
  const t = theme || FALLBACK_THEME

  const isExpired = new Date(item.date_end) < new Date()
  const prizes    = item.prizes || []

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
      return { icon: <MousePointerClick className="w-3.5 h-3.5" />, label: "Clicks",      count: item.website_clicks    || 0 }
    if (method === "automatic")
      return { icon: <Users             className="w-3.5 h-3.5" />, label: "Registrants", count: item.registrants_count || 0, hasError: item.sync_error }
    return null
  }

  const trackingStats = getTrackingStats()

  return (
    <>
      {/* ── CARD ── */}
      <Card
        className="group relative backdrop-blur-xl overflow-hidden transition-all duration-300 cursor-pointer"
        style={{
          background:  t.cardBg,
          border:      t.borderColor,
          boxShadow:   "none",
          ...t.cssVars,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = t.cardShadow
          e.currentTarget.style.border    = t.borderColorStrong
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none"
          e.currentTarget.style.border    = t.borderColor
        }}
        onClick={() => setIsDialogOpen(true)}
      >
        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: t.overlayGradient }}
        />
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: t.cornerGradient }}
        />

        <CardContent className="relative p-6">
          {/* Org name */}
          {item.organization && (
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: t.primaryText }}>
              {item.organization}
            </span>
          )}

          {/* Title */}
          <h3
            className="text-2xl font-bold mb-3 mt-1 line-clamp-2"
            style={{ backgroundImage: t.textGradient, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            {item.title}
          </h3>


<div className="text-sm text-gray-400 space-y-2 bg-black/20 rounded-lg p-3 border border-purple-500/10">
  <p className="flex items-center gap-2">
    <Calendar className="w-4 h-4 text-fuchsia-400" />
    <span className="text-gray-300">
      {formatUTCDateTime(item.date_begin)}
      <span className="text-white/25 mx-2">→</span>
      {formatUTCDateTime(item.date_end)}
    </span>
  </p>

  {item.open_to && (
    <p className="text-gray-400">
      <span className="text-fuchsia-400 font-medium">Open to:</span> {item.open_to}
    </p>
  )}

  {item.countries && (
    <p className="text-gray-400">
      <span className="text-purple-400 font-medium">Location:</span> {item.countries}
    </p>
  )}

  <p className="text-gray-400">
    <span className="text-pink-400 font-medium">By:</span> {item.author}
  </p>
</div>          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {prizes.length > 0 && (
              <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-400/30 text-emerald-300 rounded-full text-xs font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                {prizes.length} Prize{prizes.length !== 1 ? "s" : ""} Available
              </span>
            )}

            {item.google_sheet_csv_url && (
              <AnnouncementTrackingBadge announcementId={item.id} />
            )}

            {isExpired ? (
              <span className="px-3 py-1.5 bg-red-500/20 border border-red-400/30 text-red-300 rounded-full text-xs font-medium">
                Expired
              </span>
            ) : (
              <span
                className="px-3 py-1.5 rounded-full text-xs font-medium animate-pulse"
                style={{ background: t.badgeBgPrimary, border: t.borderColorLight, color: t.primaryText }}
              >
                Active
              </span>
            )}

            {trackingStats?.hasError && (
              <span className="px-3 py-1.5 bg-red-500/20 border border-red-400/30 text-red-300 rounded-full text-xs font-medium flex items-center gap-1.5 cursor-help" title={item.sync_error}>
                <AlertCircle className="w-3.5 h-3.5" />Sync Error
              </span>
            )}
          </div>

          {/* Action buttons */}
          {(item.website_link || item.dev_link) && (
            <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${t.primary30}` }}>
              {item.website_link && (
                <a href={item.website_link} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={handleWebsiteLinkClick}>
                  <Button
                    size="sm"
                    className="w-full cursor-pointer text-white border-0 transition-all duration-300"
                    style={{ background: t.buttonGradient, boxShadow: t.buttonShadow }}
                    onMouseEnter={(e) => e.currentTarget.style.background = t.buttonHoverGradient}
                    onMouseLeave={(e) => e.currentTarget.style.background = t.buttonGradient}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />
                    {item.tracking_method === "manual" ? "Register Now" : "Website"}
                  </Button>
                </a>
              )}
              {item.dev_link && (
                <a href={item.dev_link} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="sm"
                    className="w-full cursor-pointer text-white border-0 transition-all duration-300"
                    style={{ background: `linear-gradient(to right, ${t.secondaryFull}, ${t.primaryFull})` }}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />DevPost
                  </Button>
                </a>
              )}
            </div>
          )}

          {/* Bottom accent bar */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
            style={{ background: t.bottomBarGradient }}
          />
        </CardContent>
      </Card>

      {/* ── DIALOG ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto text-white"
          style={{ background: "linear-gradient(135deg, #020617 0%, rgba(2,6,23,0.97) 100%)", border: t.borderColor, ...t.cssVars }}
        >
          <DialogHeader>
            <div className="mb-2">
              {item.organization && (
                <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: t.primaryText }}>
                  {item.organization}
                </span>
              )}
              <DialogTitle
                className="text-3xl font-bold mt-2 bg-clip-text text-transparent"
                style={{ backgroundImage: t.textGradient }}
              >
                {item.title}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Description */}
            <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: t.borderColorFaint }}>
              <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: t.primaryText }}>Description</h4>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">{item.des}</p>
            </div>

            {/* Prizes — semantic gold/silver/bronze, unchanged */}
            {prizes.length > 0 && (
              <div className="rounded-xl p-5 bg-gradient-to-br from-amber-950/30 to-yellow-950/20 border border-amber-400/30">
                <h4 className="text-xs font-semibold uppercase tracking-wide mb-4 flex items-center gap-2 text-amber-300">
                  <Trophy className="w-4 h-4" />Prize Pool ({prizes.length} Prize{prizes.length !== 1 ? "s" : ""})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {prizes.map((prize, index) => {
                    const cs = getPrizeColorScheme(prize.name)
                    return (
                      <div key={index} className={`bg-gradient-to-br ${cs.gradient} rounded-lg p-4 border ${cs.border} transition-transform hover:scale-105`}>
                        <div className="text-center mb-3">
                          <Trophy className={`w-8 h-8 mx-auto mb-2 ${cs.icon}`} />
                          <div className={`text-xs ${cs.label} uppercase tracking-wider mb-1 font-semibold`}>{prize.name}</div>
                          <div className={`text-2xl font-bold ${cs.text}`}>{prize.value}</div>
                        </div>
                        {prize.description && (
                          <p className={`text-xs ${cs.label} text-center mt-2 pt-2 border-t ${cs.border}`}>{prize.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

{/* Event details grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {[
    {
      icon: <Calendar className="w-5 h-5" style={{ color: t.primaryText }} />,
      title: "Event Dates",
      titleColor: t.primaryText,
      content: (
        <>
          <p className="text-gray-300 text-sm">
            <span className="font-medium">Start:</span> {formatUTCDateTime(item.date_begin)}
          </p>
          <p className="text-gray-300 text-sm">
            <span className="font-medium">End:</span> {formatUTCDateTime(item.date_end)}
          </p>
        </>
      ),
    },
    item.open_to && {
      icon: <Users className="w-5 h-5" style={{ color: t.secondaryText }} />,
      title: "Open To",
      titleColor: t.secondaryText,
      content: <p className="text-gray-300 text-sm">{item.open_to}</p>,
    },
    item.countries && {
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      title: "Location",
      titleColor: "#60a5fa",
      content: <p className="text-gray-300 text-sm">{item.countries}</p>,
    },
    {
      icon: <Users className="w-5 h-5" style={{ color: t.labelText }} />,
      title: "Organized By",
      titleColor: t.labelText,
      content: <p className="text-gray-300 text-sm">{item.author}</p>,
    },
  ]
    .filter(Boolean)
    .map((detail, i) => (
      <div
        key={i}
        className="rounded-xl p-4"
        style={{ background: "rgba(255,255,255,0.04)", border: t.borderColorFaint }}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{detail.icon}</div>
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: detail.titleColor }}>
              {detail.title}
            </h4>
            {detail.content}
          </div>
        </div>
      </div>
    ))}
</div>

            {/* Status + tracking */}
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: t.borderColorFaint }}>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">Status</h4>
                {isExpired ? (
                  <span className="inline-flex items-center px-3 py-1.5 bg-red-500/20 border border-red-400/30 text-red-300 rounded-full text-sm font-medium">Expired</span>
                ) : (
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium animate-pulse"
                    style={{ background: t.badgeBgPrimary, border: t.borderColorLight, color: t.primaryText }}
                  >
                    Active
                  </span>
                )}
              </div>
              {trackingStats && (
                <div className="text-right">
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">{trackingStats.label}</h4>
                  <div className="flex items-center gap-2 justify-end" style={{ color: t.primaryText }}>
                    {trackingStats.icon}
                    <span className="text-2xl font-bold text-white">{trackingStats.count}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Dialog action buttons */}
            {(item.website_link || item.dev_link) && (
              <div className="flex gap-3 pt-2">
                {item.website_link && (
                  <a href={item.website_link} target="_blank" rel="noopener noreferrer" className="flex-1"
                    onClick={(e) => { e.stopPropagation(); handleWebsiteLinkClick(e) }}>
                    <Button
                      size="lg"
                      className="w-full text-white border-0 transition-all duration-300"
                      style={{ background: t.buttonGradient, boxShadow: t.buttonShadow }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {item.tracking_method === "manual" ? "Register Now" : "Visit Website"}
                    </Button>
                  </a>
                )}
                {item.dev_link && (
                  <a href={item.dev_link} target="_blank" rel="noopener noreferrer" className="flex-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="lg"
                      className="w-full text-white border-0 transition-all duration-300"
                      style={{ background: `linear-gradient(to right, ${t.secondaryFull}, ${t.primaryFull})` }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />DevPost
                    </Button>
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