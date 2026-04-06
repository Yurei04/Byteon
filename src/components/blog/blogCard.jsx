"use client"

import { buildTheme } from "@/lib/blog-color"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2, Calendar, MapPin, Tag, Link2, Edit } from "lucide-react"
import BlogEditOrg from "./blog-edit-org"

export default function BlogCard({ item, onDelete, onUpdate, primaryColor, secondaryColor }) {
  // Prefer explicit props → enriched item fields → defaults (handled inside buildTheme)
  const theme = buildTheme(
    primaryColor   ?? item?.primary_color,
    secondaryColor ?? item?.secondary_color,
  )

  return (
    <Card
      className="group relative backdrop-blur-xl overflow-hidden transition-all duration-300"
      style={{
        background:  theme.cardBg,
        border:      theme.borderColor,
        boxShadow:   "none",
        ...theme.cssVars,
      }}
      // Hover shadow via inline JS — Tailwind can't interpolate dynamic colors
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = theme.cardShadow; e.currentTarget.style.border = theme.borderColorStrong }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none";           e.currentTarget.style.border = theme.borderColor }}
    >
      {/* ── Animated gradient overlay (hover) ─────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: theme.overlayGradient }}
      />

      {/* ── Decorative corner accent (hover) ──────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: theme.cornerGradient }}
      />

      <CardContent className="relative p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* ── Org name ──────────────────────────────────────────────── */}
            {item.organization && (
              <div className="mb-2">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: theme.primaryText }}
                >
                  {item.organization}
                </span>
              </div>
            )}

            {/* ── Title ─────────────────────────────────────────────────── */}
            <h3
              className="text-2xl font-bold mb-3 line-clamp-2 transition-all duration-300"
              style={{
                backgroundImage: theme.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {item.title}
            </h3>

            {/* ── Description ───────────────────────────────────────────── */}
            {item.des && (
              <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 mb-4">
                {item.des}
              </p>
            )}

            {/* ── Badges ────────────────────────────────────────────────── */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.theme && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                  style={{
                    background: theme.badgeBgPrimary,
                    border:     theme.borderColor,
                    color:      theme.labelText,
                    boxShadow:  theme.glowShadow,
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {item.theme}
                </span>
              )}
              {item.place && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                  style={{
                    background: theme.badgeBgSecondary,
                    border:     `1px solid ${theme.secondary30}`,
                    color:      theme.secondaryText,
                    boxShadow:  `0 0 12px ${theme.secondary30}`,
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  {item.place}
                </span>
              )}
            </div>

            {/* ── Meta row ──────────────────────────────────────────────── */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${theme.primary30}` }}
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  <span className="font-medium" style={{ color: theme.primaryText }}>By:</span>{" "}
                  {item.author}
                </span>
                <span className="text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: theme.secondaryText }} />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {item.hackathon?.length > 0 && (
                <div className="pt-2" style={{ borderTop: `1px solid ${theme.primary30}` }}>
                  <p className="text-xs text-gray-400 flex items-start gap-2">
                    <Link2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: theme.primaryText }} />
                    <span>
                      <span className="font-medium" style={{ color: theme.primaryText }}>Related:</span>{" "}
                      <span className="text-gray-300">{item.hackathon.join(", ")}</span>
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Edit button ───────────────────────────────────────────────── */}
          <BlogEditOrg blog={item} onUpdate={onUpdate}>
            <Button
              size="sm"
              variant="outline"
              className="ml-3 transition-colors duration-200"
              style={{
                border:           theme.borderColor,
                color:            theme.labelText,
                background:       "transparent",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = theme.badgeBgPrimary }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </BlogEditOrg>

          {/* ── Delete button ─────────────────────────────────────────────── */}
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
            className="ml-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 border-0 shadow-lg shadow-red-500/30 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Bottom accent bar (hover) ──────────────────────────────────── */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          style={{ background: theme.bottomBarGradient }}
        />
      </CardContent>
    </Card>
  )
}