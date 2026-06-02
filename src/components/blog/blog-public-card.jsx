"use client"

import { Calendar, MapPin, Tag, Link2, User } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog"
import { ScrollArea } from "../ui/scroll-area"
import { buildTheme } from "@/lib/blog-color"

const FALLBACK_THEME = buildTheme("#a21caf", "#7c3aed")

function initials() {
  return (name || "??")
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase()
}

export default function BlogPublicCard({ item, theme }) {
  const t = theme || FALLBACK_THEME

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className="group relative flex flex-col h-full cursor-pointer select-none"
          style={{
            borderRadius: 20,
            overflow: "hidden",
            border: "1.5px solid rgb(var(--surface-border) / 0.35)",
            background: "rgb(var(--surface-raised))",
            transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s cubic-bezier(0.22,1,0.36,1), border-color 0.25s",
            ...t.cssVars,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-5px)"
            e.currentTarget.style.boxShadow = `0 20px 52px rgb(var(--brand-700) / 0.15), 0 4px 14px rgb(var(--brand-700) / 0.08)`
            e.currentTarget.style.borderColor = "rgb(var(--brand-400) / 0.45)"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)"
            e.currentTarget.style.boxShadow = "none"
            e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.35)"
          }}
        >
          {/* Top gradient bar */}
          <div
            className="h-[3px] w-full flex-shrink-0"
            style={{ background: t.bottomBarGradient }}
          />

          {/* Card body */}
          <div className="flex flex-col flex-1 p-5">

            {/* Org chip */}
            {item.organization && (
              <div className="flex items-center gap-1.5 mb-3 self-start">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full"
                  style={{
                    background: "rgb(var(--bg-muted))",
                    color: t.primaryText,
                    border: `1px solid ${t.primary30}`,
                  }}
                >
                  <span
                    className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                    style={{ background: t.primaryText }}
                  />
                  {item.organization}
                </span>
              </div>
            )}

            {/* Title */}
            <h3
              className="text-[15px] font-bold leading-snug tracking-tight line-clamp-2 mb-2"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              {item.title}
            </h3>

            {/* Description */}
            {item.des && (
              <p
                className="text-[12px] leading-relaxed line-clamp-3 flex-1 mb-4"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {item.des}
              </p>
            )}

            {/* Tags */}
            {(item.theme || item.place) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.theme && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgb(var(--bg-muted))",
                      color: t.labelText,
                      border: `1px solid ${t.primary30}`,
                    }}
                  >
                    <Tag className="w-[10px] h-[10px]" />
                    {item.theme}
                  </span>
                )}
                {item.place && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgb(var(--bg-muted))",
                      color: t.secondaryText,
                      border: `1px solid ${t.secondary30}`,
                    }}
                  >
                    <MapPin className="w-[10px] h-[10px]" />
                    {item.place}
                  </span>
                )}
              </div>
            )}

            {/* Divider */}
            <div
              className="h-px mb-3.5"
              style={{ background: "rgb(var(--surface-border) / 0.3)" }}
            />

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                  style={{ background: t.bottomBarGradient }}
                >
                  {initials(item.author)}
                </div>
                <div className="min-w-0">
                  <p
                    className="text-[11px] font-semibold leading-none mb-0.5 truncate"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {item.author}
                  </p>
                  <p
                    className="text-[10px] leading-none"
                    style={{ color: "rgb(var(--text-faint))" }}
                  >
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <span
                className="text-[11px] font-bold flex-shrink-0 ml-2 transition-transform duration-200 group-hover:translate-x-0.5"
                style={{ color: t.primaryText }}
              >
                Read →
              </span>
            </div>
          </div>

          {/* Bottom accent line — slides in on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[2px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
            style={{ background: t.bottomBarGradient }}
          />
        </div>
      </DialogTrigger>

      {/* ── MODAL ── */}
      <DialogContent
        className="max-w-2xl p-0 border-0 bg-transparent shadow-none overflow-hidden"
        style={{ ...t.cssVars }}
      >
        <div
          className="relative rounded-[22px] overflow-hidden"
          style={{
            background: "rgb(var(--surface-raised))",
            border: `1.5px solid rgb(var(--brand-400) / 0.35)`,
            boxShadow: `0 32px 80px rgb(var(--brand-700) / 0.2), 0 8px 24px rgb(0 0 0 / 0.08)`,
          }}
        >
          {/* Top bar */}
          <div className="h-[3px]" style={{ background: t.bottomBarGradient }} />

          <div className="p-6">
            {/* Org */}
            {item.organization && (
              <span
                className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full"
                style={{
                  background: "rgb(var(--bg-muted))",
                  color: t.primaryText,
                  border: `1px solid ${t.primary30}`,
                }}
              >
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: t.primaryText }} />
                {item.organization}
              </span>
            )}

            {/* Title */}
            <h2
              className="text-2xl font-bold tracking-tight leading-snug mb-3"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              {item.title}
            </h2>

            {/* Tags */}
            {(item.theme || item.place) && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.theme && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgb(var(--bg-muted))",
                      color: t.labelText,
                      border: `1px solid ${t.primary30}`,
                    }}
                  >
                    <Tag className="w-[10px] h-[10px]" /> {item.theme}
                  </span>
                )}
                {item.place && (
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      background: "rgb(var(--bg-muted))",
                      color: t.secondaryText,
                      border: `1px solid ${t.secondary30}`,
                    }}
                  >
                    <MapPin className="w-[10px] h-[10px]" /> {item.place}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {item.des && (
              <p
                className="text-sm leading-relaxed mb-5"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                {item.des}
              </p>
            )}

            {/* Meta bar */}
            <div
              className="flex items-center justify-between px-3.5 py-3 rounded-xl mb-4"
              style={{
                background: "rgb(var(--bg-muted))",
                border: `1px solid ${t.primary30}`,
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0"
                  style={{ background: t.bottomBarGradient }}
                >
                  {initials(item.author)}
                </div>
                <span className="text-[12px] font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  {item.author}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" style={{ color: t.secondaryText }} />
                <span className="text-[12px]" style={{ color: "rgb(var(--text-secondary))" }}>
                  {new Date(item.created_at).toLocaleDateString("en-US", {
                    month: "long", day: "numeric", year: "numeric"
                  })}
                </span>
              </div>
            </div>

            {/* Hackathon links */}
            {item.hackathon?.length > 0 && (
              <div
                className="flex items-start gap-2 px-3.5 py-3 rounded-xl mb-4 text-[12px]"
                style={{
                  background: "rgb(var(--bg-muted))",
                  border: `1px solid ${t.primary30}`,
                  color: "rgb(var(--text-secondary))",
                }}
              >
                <Link2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: t.primaryText }} />
                {item.hackathon.join(", ")}
              </div>
            )}

            {/* Full content */}
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: `1px solid rgb(var(--surface-border) / 0.3)`,
              }}
            >
              <ScrollArea className="h-72 p-4">
                <p
                  className="text-[13px] leading-relaxed whitespace-pre-wrap text-justify"
                  style={{ color: "rgb(var(--text-secondary))" }}
                >
                  {item.content}
                </p>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}