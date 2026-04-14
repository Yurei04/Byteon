"use client"

import { useState } from "react"
import {
  Home, Handshake, FileText, BookOpen,
  Zap, HelpCircle, RefreshCw, Maximize2,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

// ── Page component imports ────────────────────────────────────────────────────
import HomePage            from "@/pages/home-page/home"
import AboutSection        from "@/pages/about-page/about-page"
import TipPage             from "@/pages/home-page/tipPage"
import ClientFooterLoader  from "@/components/client-footer-loader"
import PartnersPage        from "@/pages/partners-page/parnters-page"
import ResourceHubPage     from "@/pages/resource-hub-page/resource-hub-page"
import AnnouncePage        from "@/pages/announce-control-page/announce-page"
import HowToHackathon     from "@/app/(layout)/how-to-hackathon/page" 
import BlogPage            from "@/pages/blog-page/blog-page"

// ── Design tokens ─────────────────────────────────────────────────────────────
const P = "#c026d3"
const S = "#a855f7"

// ── Page registry: maps href → rendered content ───────────────────────────────
// Each entry is a render function so components only mount when active.
const PAGE_REGISTRY = {
  "/": () => (
    <>
      <HomePage />
      <AboutSection />
      <TipPage />
      <ClientFooterLoader />
    </>
  ),
  "/partners": () => <PartnersPage />,
  "/blog":     () => <BlogPage />,
  "/resource-hub": () => <ResourceHubPage />,
  "/announce": () => <AnnouncePage />,
  "/how-to-hackathon": () => <HowToHackathon />,
}

// ── Exported page list (used by dashboard sidebar) ────────────────────────────
export const WEBSITE_PAGES = [
  { label: "Home",       href: "/",                 icon: <Home       className="w-4 h-4" />, accent: "#3b82f6" },
  { label: "Partners",   href: "/partners",          icon: <Handshake  className="w-4 h-4" />, accent: "#10b981" },
  { label: "Blog",       href: "/blog",              icon: <FileText   className="w-4 h-4" />, accent: "#ec4899" },
  { label: "Resource",   href: "/resource-hub",      icon: <BookOpen   className="w-4 h-4" />, accent: "#f97316" },
  { label: "Hacks",      href: "/announce",          icon: <Zap        className="w-4 h-4" />, accent: "#a855f7" },
  { label: "HowToHack",  href: "/how-to-hackathon",  icon: <HelpCircle className="w-4 h-4" />, accent: "#fbbf24" },
]

// ── Main component ────────────────────────────────────────────────────────────
// Accepts `href` from the dashboard (websitePage.href) and renders the matching
// page component directly — no iframe, no internal nav.
export default function WebsitePreviewSection({ href = "/" }) {
  const [renderKey, setRenderKey] = useState(0)   // force remount on refresh
  const [fullscreen, setFullscreen] = useState(false)

  const activePage  = WEBSITE_PAGES.find(p => p.href === href) ?? WEBSITE_PAGES[0]
  const PageContent = PAGE_REGISTRY[href] ?? PAGE_REGISTRY["/"]

  const refresh = () => setRenderKey(k => k + 1)

  return (
    <>
      {/* Fullscreen backdrop */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-40 cursor-default"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => setFullscreen(false)}
        />
      )}

      <div
        className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-300 ${
          fullscreen
            ? "fixed inset-4 z-50"
            : "h-[calc(100vh-220px)] min-h-[500px]"
        }`}
        style={{ background: "rgba(5,0,14,0.95)", border: `1px solid ${P}20` }}
      >
        {/* ── Browser chrome toolbar ── */}
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
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
            }}
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
              onClick={() => setFullscreen(f => !f)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="p-1.5 rounded-lg transition-all duration-200 hover:bg-white/10 cursor-pointer"
              style={{ color: fullscreen ? P : "rgba(255,255,255,0.4)" }}
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Page content area ── */}
        <div
          className="flex-1 min-h-0 overflow-y-auto"
          style={{
            background: "#0a0010",
            // Custom scrollbar
            scrollbarWidth: "thin",
            scrollbarColor: `${activePage.accent}40 transparent`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${href}-${renderKey}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              // Pointer-events none blocks accidental navigation while previewing.
              // Remove if you want the preview to be fully interactive.
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              <PageContent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom accent bar matching active page color ── */}
        <div
          className="flex-shrink-0 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${activePage.accent}60, transparent)`,
          }}
        />
      </div>
    </>
  )
}