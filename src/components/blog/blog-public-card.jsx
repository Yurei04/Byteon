"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Tag, Link2, User } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { buildTheme } from "@/lib/blog-color"

// Fallback so the card never crashes if theme isn't passed
const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")

export default function BlogPublicCard({ item, theme }) {
  const t = theme || FALLBACK_THEME

  return (
    <Dialog>
      <DialogTrigger className="justify-start text-start w-full h-full">

        {/* ── CARD ── */}
        <Card
          className="group relative backdrop-blur-xl overflow-hidden transition-all duration-300"
          style={{
            background: t.cardBg,
            border:     t.borderColor,
            boxShadow:  "none",
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
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: t.primaryText }}
              >
                {item.organization}
              </span>
            )}

            {/* Title */}
            <h3
              className="text-2xl font-bold mb-3 mt-1 line-clamp-2"
              style={{
                backgroundImage:      t.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
              }}
            >
              {item.title}
            </h3>

            {/* Description */}
            {item.des && (
              <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                {item.des}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.theme && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{
                    background: t.badgeBgPrimary,
                    border:     t.borderColorLight,
                    color:      t.labelText,
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {item.theme}
                </span>
              )}

              {item.place && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{
                    background: t.badgeBgSecondary,
                    border:     `1px solid ${t.secondary30}`,
                    color:      t.secondaryText,
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  {item.place}
                </span>
              )}
            </div>

            {/* Meta row */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "rgba(0,0,0,0.2)",
                border:     `1px solid ${t.primary30}`,
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" style={{ color: t.primaryText }} />
                  <span style={{ color: t.primaryText }}>By:</span>{" "}
                  {item.author}
                </span>

                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: t.secondaryText }} />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {item.hackathon?.length > 0 && (
                <div className="pt-2" style={{ borderTop: `1px solid ${t.primary30}` }}>
                  <p className="text-xs text-gray-400 flex gap-2">
                    <Link2 className="w-3.5 h-3.5 shrink-0" style={{ color: t.primaryText }} />
                    {item.hackathon.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom accent bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-[3px] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
              style={{ background: t.bottomBarGradient }}
            />
          </CardContent>
        </Card>
      </DialogTrigger>

      {/* ── MODAL ── */}
      <DialogContent
        className="max-w-2xl p-0 border-0 bg-transparent shadow-none overflow-hidden"
        style={{ ...t.cssVars }}
      >
        <Card
          className="relative backdrop-blur-2xl overflow-hidden"
          style={{
            background: t.cardBg,
            border:     t.borderColorStrong,
            boxShadow:  t.cardShadow,
          }}
        >
          {/* Subtle top glow */}
          <div
            className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
            style={{ background: t.bottomBarGradient }}
          />

          {/* Corner accent */}
          <div
            className="absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none opacity-60"
            style={{ background: t.cornerGradient }}
          />

          <CardContent className="relative p-6">
            {/* Org name */}
            {item.organization && (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: t.primaryText }}
              >
                {item.organization}
              </span>
            )}

            {/* Title */}
            <h3
              className="text-2xl font-bold mb-3 mt-1"
              style={{
                backgroundImage:      t.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
              }}
            >
              {item.title}
            </h3>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.theme && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{
                    background: t.badgeBgPrimary,
                    border:     t.borderColorLight,
                    color:      t.labelText,
                  }}
                >
                  <Tag className="w-3 h-3" />
                  {item.theme}
                </span>
              )}

              {item.place && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1.5"
                  style={{
                    background: t.badgeBgSecondary,
                    border:     `1px solid ${t.secondary30}`,
                    color:      t.secondaryText,
                  }}
                >
                  <MapPin className="w-3 h-3" />
                  {item.place}
                </span>
              )}
            </div>

            {/* Description */}
            {item.des && (
              <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                {item.des}
              </p>
            )}

            {/* Meta */}
            <div
              className="rounded-lg p-3 space-y-2 mb-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                border:     `1px solid ${t.primary30}`,
              }}
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" style={{ color: t.primaryText }} />
                  <span style={{ color: t.primaryText }}>By:</span>{" "}
                  {item.author}
                </span>

                <span className="text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" style={{ color: t.secondaryText }} />
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {item.hackathon?.length > 0 && (
                <div className="pt-2" style={{ borderTop: `1px solid ${t.primary30}` }}>
                  <p className="text-xs text-gray-400 flex gap-2">
                    <Link2 className="w-3.5 h-3.5 shrink-0" style={{ color: t.primaryText }} />
                    {item.hackathon.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Full content */}
            <div
              className="rounded-lg"
              style={{
                background: "rgba(0,0,0,0.15)",
                border:     `1px solid ${t.primary30}`,
              }}
            >
              <ScrollArea className="h-72 p-4">
                <p className="text-gray-300 text-sm text-justify leading-relaxed whitespace-pre-wrap">
                  {item.content}
                </p>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}