"use client"

import { useState } from "react"
import {
  Home, Handshake, FileText, BookOpen,
  Zap, HelpCircle, Monitor, ExternalLink,
  RefreshCw, Maximize2, ChevronRight,
} from "lucide-react"

// ── Design tokens (match your dashboard) ─────────────────────────────────────
const P  = "#c026d3"
const S  = "#a855f7"

// ── Nav pages mirroring your NavBar ──────────────────────────────────────────
const PAGES = [
  { label: "Home",        href: "/",                  icon: <Home      className="w-4 h-4" />, accent: "#3b82f6" },
  { label: "Partners",    href: "/partners",           icon: <Handshake className="w-4 h-4" />, accent: "#10b981" },
  { label: "Blog",        href: "/blog",               icon: <FileText  className="w-4 h-4" />, accent: "#ec4899" },
  { label: "Resource",    href: "/resource-hub",       icon: <BookOpen  className="w-4 h-4" />, accent: "#f97316" },
  { label: "Hacks",       href: "/announce",           icon: <Zap       className="w-4 h-4" />, accent: "#a855f7" },
  { label: "HowToHack",  href: "/how-to-hackathon",   icon: <HelpCircle className="w-4 h-4" />, accent: "#fbbf24" },
]

// ── Mini nav item ─────────────────────────────────────────────────────────────
function PreviewNavItem({ page, isActive, onClick }) {
  return (
    <button
      onClick={() => onClick(page)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group text-left cursor-pointer"
      style={isActive ? {
        background: `linear-gradient(135deg, ${page.accent}22, ${page.accent}10)`,
        color: "#ffffff",
        border: `1px solid ${page.accent}45`,
        boxShadow: `0 0 14px ${page.accent}14`,
      } : {
        background: "transparent",
        color: "rgba(255,255,255,0.45)",
        border: "1px solid transparent",
      }}
    >
      {isActive && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: page.accent, boxShadow: `0 0 6px ${page.accent}` }}
        />
      )}
      <span style={{ color: isActive ? page.accent : "inherit", flexShrink: 0 }}>
        {page.icon}
      </span>
      <span className="flex-1">{page.label}</span>
      {isActive && (
        <ChevronRight className="w-3 h-3 opacity-60" style={{ color: page.accent }} />
      )}
    </button>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WebsitePreviewSection() {
  const [activePage, setActivePage]   = useState(PAGES[0])
  const [iframeKey, setIframeKey]     = useState(0)
  const [loading, setLoading]         = useState(true)
  const [fullscreen, setFullscreen]   = useState(false)

  const refresh = () => {
    setLoading(true)
    setIframeKey(k => k + 1)
  }

  const openExternal = () => window.open(activePage.href, "_blank")

  return (
    <div
      className={`flex gap-0 rounded-2xl overflow-hidden transition-all duration-300 ${fullscreen ? "fixed inset-4 z-50" : "h-[calc(100vh-220px)] min-h-[500px]"}`}
      style={{ background: "rgba(5,0,14,0.95)", border: `1px solid ${P}20` }}
    >

      {/* ── Preview sidebar ── */}
      <aside
        className="flex-shrink-0 w-48 flex flex-col"
        style={{ borderRight: `1px solid ${P}18`, background: "rgba(5,0,14,0.80)" }}
      >
        {/* Sidebar header */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: `1px solid ${P}14` }}>
          <div className="flex items-center gap-2 mb-1">
            <Monitor className="w-3.5 h-3.5" style={{ color: P }} />
            <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: `${P}90` }}>
              Site Preview
            </span>
          </div>
          <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            Browse pages live
          </p>
        </div>

        {/* Page nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {PAGES.map(page => (
            <PreviewNavItem
              key={page.href}
              page={page}
              isActive={activePage.href === page.href}
              onClick={(p) => { setActivePage(p); setLoading(true) }}
            />
          ))}
        </nav>

        {/* Current URL pill */}
        <div className="px-3 pb-4 pt-2" style={{ borderTop: `1px solid ${P}12` }}>
          <div
            className="px-2.5 py-1.5 rounded-lg text-[10px] break-all leading-relaxed"
            style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {activePage.href}
          </div>
        </div>
      </aside>

      {/* ── Preview pane ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Preview toolbar */}
        <div
          className="flex-shrink-0 flex items-center gap-3 px-4 h-11"
          style={{ borderBottom: `1px solid ${P}14`, background: "rgba(0,0,0,0.25)" }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#28c840" }} />
          </div>

          {/* URL bar */}
          <div
            className="flex-1 flex items-center gap-2 px-3 py-1 rounded-lg text-xs"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#22c55e" }} />
            <span className="truncate">localhost:3000{activePage.href}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={refresh}
              title="Refresh"
              className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={openExternal}
              title="Open in new tab"
              className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setFullscreen(f => !f)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer"
              style={{ color: fullscreen ? P : "rgba(255,255,255,0.4)" }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* iframe */}
        <div className="relative flex-1 min-h-0">
          {/* Loading shimmer */}
          {loading && (
            <div
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3"
              style={{ background: "rgba(9,5,15,0.85)" }}
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ background: P, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                Loading {activePage.label}…
              </p>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={activePage.href}
            title={`Preview — ${activePage.label}`}
            className="w-full h-full border-0"
            style={{ display: "block", background: "#ffffff" }}
            onLoad={() => setLoading(false)}
            // Allow same-origin scripts; loosen if your pages need more
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          />
        </div>
      </div>

      {/* Fullscreen backdrop close */}
      {fullscreen && (
        <button
          className="fixed inset-0 z-40 cursor-default"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setFullscreen(false)}
        />
      )}
    </div>
  )
}