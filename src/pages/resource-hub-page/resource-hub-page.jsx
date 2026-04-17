"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Layers, ChevronLeft, ChevronRight } from "lucide-react"
import ResourcePublicCard from "@/components/resourceHub/resource-public-card"

const USER_PRIMARY   = "#d946ef"
const USER_SECONDARY = "#f472b6"
const COLOR_CACHE    = new Map()
const ITEMS_PER_PAGE = 9

const CATEGORIES = [
  { label: "All",        value: "all",                icon: "✦" },
  { label: "Web Dev",    value: "Web Development",    icon: "🌐" },
  { label: "Mobile",     value: "Mobile Development", icon: "📱" },
  { label: "AI & ML",    value: "AI & ML",            icon: "🤖" },
  { label: "Deployment", value: "Deployment",         icon: "🚀" },
  { label: "DevOps",     value: "DevOps",             icon: "⚙️" },
  { label: "UI / UX",    value: "UI/UX Design",       icon: "🎨" },
]

// Fuchsia/pink accent tokens
const A  = "#d946ef"   // fuchsia-500
const A2 = "#e879f9"   // fuchsia-400
const A3 = "#f472b6"   // pink-400

export default function ResourceHubPage() {
  const [resources, setResources]   = useState([])
  const [filter, setFilter]         = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from("resource_hub").select("*").order("created_at", { ascending: false })

      if (error || !data?.length) { setLoading(false); return }

      const orgNames = [...new Set(data.map(r => r.organization).filter(Boolean))]
      const uncached = orgNames.filter(n => !COLOR_CACHE.has(n))

      if (uncached.length) {
        const { data: orgData } = await supabase
          .from("organizations").select("name, primary_color, secondary_color").in("name", uncached)
        ;(orgData || []).forEach(org => {
          COLOR_CACHE.set(org.name, buildTheme(org.primary_color ?? USER_PRIMARY, org.secondary_color ?? USER_SECONDARY))
        })
      }

      if (!COLOR_CACHE.has("user-default"))
        COLOR_CACHE.set("user-default", buildTheme(USER_PRIMARY, USER_SECONDARY))

      setResources(data.map(item => ({
        ...item,
        _theme: item.organization && COLOR_CACHE.has(item.organization)
          ? COLOR_CACHE.get(item.organization)
          : COLOR_CACHE.get("user-default"),
      })))
      setLoading(false)
    }
    fetchData()
  }, [])

  // Reset to page 1 whenever filter or search changes
  useEffect(() => { setPage(1) }, [filter, searchTerm])

  const filteredData = useMemo(() =>
    resources.filter(item => {
      const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filter === "all" || (item.category || "").toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    }), [resources, searchTerm, filter])

  const totalPages   = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))
  const paginated    = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const orgCount     = [...new Set(resources.map(r => r.organization).filter(Boolean))].length

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden bg-[#08020f]">

      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 40% at 50% -5%, rgba(217,70,239,0.18) 0%, transparent 70%),
            linear-gradient(rgba(217,70,239,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(217,70,239,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "auto, 40px 40px, 40px 40px"
        }}
      />
      {/* Ambient glows */}
      <div className="fixed pointer-events-none z-0" style={{ width: 500, height: 500, top: "5%", left: "-15%", background: "radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)" }} />
      <div className="fixed pointer-events-none z-0" style={{ width: 400, height: 400, bottom: "10%", right: "-12%", background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)" }} />

      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 pb-24">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-5xl mt-28 mb-12 text-center"
        >
          {/* Eyebrow pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(217,70,239,0.08)",
              border: "1px solid rgba(217,70,239,0.3)",
              color: A2,
            }}
          >
            <Layers className="w-3 h-3" />
            <span className="text-xs font-semibold uppercase tracking-widest">Curated Resources</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-none tracking-tight">
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(135deg, #f0abfc 0%, ${A} 40%, ${A3} 80%, #fb7185 100%)` }}
            >
              Resource Hub
            </span>
          </h1>

          <div className="w-16 h-px mx-auto mb-5" style={{ background: `linear-gradient(90deg, transparent, ${A}, transparent)` }} />

          <p className="text-base sm:text-lg max-w-xl mx-auto font-light" style={{ color: "rgba(240,171,252,0.45)" }}>
            Curated tools, guides, and materials to sharpen your tech skills.
          </p>
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-8 mb-10 py-4 px-8 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(217,70,239,0.1)" }}
        >
          {[
            { label: "Total Resources", count: resources.length,       color: A  },
            { label: "Categories",      count: CATEGORIES.length - 1, color: A3 },
            { label: "Organizations",   count: orgCount,              color: "#a855f7" },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2.5 text-xs">
              <span className="text-xl font-bold" style={{ color }}>{loading ? "—" : count}</span>
              <span style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-2xl mb-5"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${A}70` }} />
            <input
              type="text"
              placeholder="Search resources, tools, guides…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
              style={{
                background: "rgba(217,70,239,0.06)",
                border: "1px solid rgba(217,70,239,0.2)",
                color: "rgba(255,255,255,0.85)",
              }}
              onFocus={e => {
                e.target.style.background    = "rgba(217,70,239,0.1)"
                e.target.style.borderColor   = `${A}55`
                e.target.style.boxShadow     = `0 0 0 3px rgba(217,70,239,0.1)`
              }}
              onBlur={e => {
                e.target.style.background    = "rgba(217,70,239,0.06)"
                e.target.style.borderColor   = "rgba(217,70,239,0.2)"
                e.target.style.boxShadow     = "none"
              }}
            />
          </div>
        </motion.div>

        {/* ── Category filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-10 max-w-3xl"
        >
          {CATEGORIES.map(({ label, value, icon }, i) => {
            const active = filter === value
            return (
              <motion.button
                key={value}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => setFilter(value)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={active ? {
                  background: `linear-gradient(135deg, ${A}, ${A3})`,
                  color: "#fff",
                  border: `1px solid ${A}60`,
                  boxShadow: `0 0 20px rgba(217,70,239,0.3)`,
                  transform: "translateY(-1px)",
                } : {
                  background: "rgba(217,70,239,0.06)",
                  color: "rgba(240,171,252,0.55)",
                  border: "1px solid rgba(217,70,239,0.18)",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(217,70,239,0.12)"; e.currentTarget.style.color = A2; e.currentTarget.style.borderColor = "rgba(217,70,239,0.35)" } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(217,70,239,0.06)"; e.currentTarget.style.color = "rgba(240,171,252,0.55)"; e.currentTarget.style.borderColor = "rgba(217,70,239,0.18)" } }}
              >
                <span>{icon}</span>
                {label}
              </motion.button>
            )
          })}
        </motion.div>

        {/* ── Results count ── */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xs mb-5 self-start max-w-6xl w-full"
            style={{ color: "rgba(217,70,239,0.5)" }}
          >
            {filteredData.length} {filteredData.length === 1 ? "resource" : "resources"} found
            {filter !== "all" && (
              <span style={{ color: "rgba(232,121,249,0.65)" }}>
                {" "}in <em>{CATEGORIES.find(c => c.value === filter)?.label}</em>
              </span>
            )}
            {totalPages > 1 && (
              <span style={{ color: "rgba(217,70,239,0.35)" }}>
                {" "}· page {page} of {totalPages}
              </span>
            )}
          </motion.p>
        )}

        {/* ── Grid ── */}
        <div className="w-full max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="rounded-2xl h-64 animate-pulse"
                  style={{ background: "rgba(217,70,239,0.05)", border: "1px solid rgba(217,70,239,0.1)" }} />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <p className="text-center text-sm mt-20" style={{ color: "rgba(232,121,249,0.35)" }}>
              No resources found for this filter.
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter + searchTerm + page}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {paginated.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    <ResourcePublicCard item={item} theme={item._theme} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 mt-12"
          >
            {/* Prev */}
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: "rgba(217,70,239,0.06)",
                border: "1px solid rgba(217,70,239,0.18)",
                color: A2,
              }}
              onMouseEnter={e => { if (page !== 1) e.currentTarget.style.background = "rgba(217,70,239,0.12)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(217,70,239,0.06)" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…")
                acc.push(n)
                return acc
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs" style={{ color: "rgba(217,70,239,0.3)" }}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className="w-9 h-9 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={page === n ? {
                      background: `linear-gradient(135deg, ${A}, ${A3})`,
                      color: "#fff",
                      border: `1px solid ${A}60`,
                      boxShadow: `0 0 16px rgba(217,70,239,0.3)`,
                    } : {
                      background: "rgba(217,70,239,0.06)",
                      border: "1px solid rgba(217,70,239,0.18)",
                      color: "rgba(240,171,252,0.55)",
                    }}
                    onMouseEnter={e => { if (page !== n) e.currentTarget.style.background = "rgba(217,70,239,0.12)" }}
                    onMouseLeave={e => { if (page !== n) e.currentTarget.style.background = "rgba(217,70,239,0.06)" }}
                  >
                    {n}
                  </button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: "rgba(217,70,239,0.06)",
                border: "1px solid rgba(217,70,239,0.18)",
                color: A2,
              }}
              onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.background = "rgba(217,70,239,0.12)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(217,70,239,0.06)" }}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}