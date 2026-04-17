"use client"

import { ExternalLink, BookOpen, Sparkles } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { buildTheme } from "@/lib/blog-color"

// Fuchsia/pink fallback theme
const FALLBACK_THEME = buildTheme("#d946ef", "#f472b6")

export default function ResourcePublicCard({ item, theme }) {
  const t = theme || FALLBACK_THEME

  return (
    <Card
      className="group relative backdrop-blur-xl overflow-hidden transition-all duration-300 w-full rounded-2xl"
      style={{
        background: t.cardBg,
        border:     t.borderColor,
        boxShadow:  "none",
        ...t.cssVars,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = t.cardShadow
        e.currentTarget.style.border    = t.borderColorStrong
        e.currentTarget.style.transform = "translateY(-3px)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none"
        e.currentTarget.style.border    = t.borderColor
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      {/* Top shimmer on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: "linear-gradient(90deg, transparent, rgba(232,121,249,0.4), transparent)" }}
      />

      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: t.overlayGradient }}
      />

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-28 h-28 rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: t.cornerGradient }}
      />

      <CardContent className="relative p-6">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          {/* Icon */}
          <div
            className="p-2 rounded-xl shrink-0 group-hover:scale-110 transition-transform duration-300"
            style={{
              background: t.badgeBgPrimary,
              border:     t.borderColorLight,
              boxShadow:  t.glowShadow,
            }}
          >
            <BookOpen className="w-4 h-4" style={{ color: t.primaryText }} />
          </div>

          <div className="flex-1 min-w-0">
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
              className="text-lg font-bold mt-0.5 leading-snug"
              style={{
                backgroundImage:      t.textGradient,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
              }}
            >
              {item.title}
            </h3>
          </div>
        </div>

        {/* Description */}
        {item.des && (
          <p className="text-sm leading-relaxed line-clamp-2 mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
            {item.des}
          </p>
        )}

        {/* Category badge */}
        {item.category && (
          <div className="mb-5">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
              style={{
                background: t.badgeBgSecondary,
                border:     `1px solid ${t.secondary30}`,
                color:      t.secondaryText,
              }}
            >
              <Sparkles className="w-3 h-3" />
              {item.category}
            </span>
          </div>
        )}

        {/* CTA */}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <Button
              size="sm"
              className="text-white border-0 transition-all duration-300 cursor-pointer group/btn rounded-xl text-xs font-semibold"
              style={{ background: t.buttonGradient, boxShadow: t.buttonShadow }}
              onMouseEnter={e => e.currentTarget.style.background = t.buttonHoverGradient}
              onMouseLeave={e => e.currentTarget.style.background = t.buttonGradient}
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 group-hover/btn:rotate-12 transition-transform duration-300" />
              Visit Resource
            </Button>
          </a>
        )}

        {/* Bottom accent bar */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
          style={{ background: t.bottomBarGradient }}
        />
      </CardContent>
    </Card>
  )
}