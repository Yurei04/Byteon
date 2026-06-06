"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Layers, ChevronLeft, ChevronRight, ChevronDown, SlidersHorizontal } from "lucide-react"
import ResourcePublicCard from "@/components/resourceHub/resource-public-card"

const USER_PRIMARY   = "#d946ef"
const USER_SECONDARY = "#f472b6"
const COLOR_CACHE    = new Map()
const ITEMS_PER_PAGE = 9

const CATEGORIES = [
  { label: "All resources", value: "all",                icon: "✦" },
  { label: "Web Dev",       value: "Web Development",    icon: "⬡" },
  { label: "Mobile",        value: "Mobile Development", icon: "◈" },
  { label: "AI & ML",       value: "AI & ML",            icon: "◇" },
  { label: "Deployment",    value: "Deployment",         icon: "△" },
  { label: "DevOps",        value: "DevOps",             icon: "□" },
  { label: "UI / UX",       value: "UI/UX Design",       icon: "○" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
]

export default function ResourceHubPage() {
  const [resources, setResources]   = useState([])
  const [filter, setFilter]         = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sort, setSort]             = useState("newest")
  const [loading, setLoading]       = useState(true)
  const [page, setPage]             = useState(1)
  const [catOpen, setCatOpen]       = useState(false)
  const [sortOpen, setSortOpen]     = useState(false)
  const catRef  = useRef(null)
  const sortRef = useRef(null)

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))   setCatOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

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

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1) }, [filter, searchTerm, sort])

  const countFor = (value) =>
    value === "all"
      ? resources.length
      : resources.filter(r => (r.category || "").toLowerCase() === value.toLowerCase()).length

  const activeCat  = CATEGORIES.find(c => c.value === filter) ?? CATEGORIES[0]
  const activeSort = SORT_OPTIONS.find(s => s.value === sort) ?? SORT_OPTIONS[0]
  const orgCount   = [...new Set(resources.map(r => r.organization).filter(Boolean))].length

  const filteredData = useMemo(() => {
    let result = resources.filter(item => {
      const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filter === "all" || (item.category || "").toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
    if (sort === "oldest") result = [...result].reverse()
    return result
  }, [resources, searchTerm, filter, sort])

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE))
  const paginated  = filteredData.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  /* Shared dropdown item style helper */
  const dropItemStyle = (active) => ({
    borderRadius: 10,
    background: active
      ? `linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--accent-500)))`
      : "transparent",
    color: active ? "#fff" : "rgb(var(--text-secondary))",
  })

  return (
    <div
      className="w-full min-h-screen relative overflow-x-hidden"
      style={{ background: "rgb(var(--bg-base))" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 40% at 50% -5%, rgb(var(--brand-500) / 0.12) 0%, transparent 70%),
            linear-gradient(rgb(var(--surface-border) / 0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgb(var(--surface-border) / 0.07) 1px, transparent 1px)
          `,
          backgroundSize: "auto, 40px 40px, 40px 40px",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 pb-24">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl mt-24 mb-10 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{
              background: "rgb(var(--brand-500) / 0.08)",
              border: "1px solid rgb(var(--brand-500) / 0.25)",
              color: "rgb(var(--text-muted))",
            }}
          >
            <Layers className="w-3 h-3" />
            <span className="text-[11px] font-semibold uppercase tracking-widest">Curated Resources</span>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-4 leading-none tracking-tight">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(135deg,
                  rgb(var(--brand-200)) 0%,
                  rgb(var(--brand-500)) 40%,
                  rgb(var(--accent-400)) 80%,
                  rgb(var(--brand-300)) 100%)`,
              }}
            >
              Resource Hub
            </span>
          </h1>

          <div
            className="w-14 h-px mx-auto mb-4"
            style={{ background: `linear-gradient(90deg, transparent, rgb(var(--brand-500)), transparent)` }}
          />

          <p
            className="text-base sm:text-lg max-w-xl mx-auto font-light"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            Curated tools, guides, and materials to sharpen your tech skills.
          </p>
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-8 mb-8 py-3.5 px-7 rounded-2xl"
          style={{
            background: "rgb(var(--surface-raised))",
            border: "1px solid rgb(var(--surface-border) / 0.2)",
          }}
        >
          {[
            { label: "Total",         count: resources.length,      color: "rgb(var(--brand-500))"  },
            { label: "Categories",    count: CATEGORIES.length - 1, color: "rgb(var(--accent-400))" },
            { label: "Organizations", count: orgCount,              color: "rgb(var(--brand-400))"  },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="text-xl font-bold" style={{ color }}>
                {loading ? "—" : count}
              </span>
              <span style={{ color: "rgb(var(--text-faint))" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── ONE-ROW TOOLBAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="w-full max-w-3xl flex items-center gap-2 mb-3"
        >

          {/* Search — flex grows */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] pointer-events-none"
              style={{ color: "rgb(var(--brand-400))" }}
            />
            <input
              type="text"
              placeholder="Search resources, tools, guides…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-[10px] text-[13px] outline-none transition-all duration-200"
              style={{
                borderRadius: 12,
                border: "1.5px solid rgb(var(--surface-border) / 0.5)",
                background: "rgb(var(--surface-raised))",
                color: "rgb(var(--text-primary))",
              }}
              onFocus={e => {
                e.target.style.borderColor = "rgb(var(--brand-500) / 0.6)"
                e.target.style.boxShadow = "0 0 0 3px rgb(var(--brand-500) / 0.08)"
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgb(var(--surface-border) / 0.5)"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>

          {/* Category dropdown */}
          <div className="relative flex-shrink-0" ref={catRef}>
            <button
              onClick={() => { setCatOpen(o => !o); setSortOpen(false) }}
              className="flex items-center gap-2 px-3.5 py-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-200"
              style={{
                borderRadius: 12,
                border: catOpen
                  ? "1.5px solid rgb(var(--brand-500) / 0.6)"
                  : "1.5px solid rgb(var(--surface-border) / 0.5)",
                background: catOpen ? "rgb(var(--bg-subtle))" : "rgb(var(--surface-raised))",
                color: "rgb(var(--text-secondary))",
                boxShadow: catOpen ? "0 0 0 3px rgb(var(--brand-500) / 0.08)" : "none",
              }}
            >
              <span style={{ fontSize: 13 }}>{activeCat.icon}</span>
              <span>{activeCat.label}</span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  color: "rgb(var(--brand-400))",
                  transform: catOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] right-0 z-50 p-1.5"
                  style={{
                    minWidth: 220,
                    borderRadius: 16,
                    border: "1.5px solid rgb(var(--surface-border) / 0.5)",
                    background: "rgb(var(--surface-raised))",
                    boxShadow: "0 12px 40px rgb(var(--brand-700) / 0.15), 0 2px 8px rgb(0 0 0 / 0.06)",
                  }}
                >
                  {CATEGORIES.map(cat => {
                    const active = filter === cat.value
                    const count  = countFor(cat.value)
                    return (
                      <button
                        key={cat.value}
                        onClick={() => { setFilter(cat.value); setCatOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-left transition-all duration-150"
                        style={dropItemStyle(active)}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
                      >
                        <span className="w-5 text-center flex-shrink-0 text-[13px]">{cat.icon}</span>
                        <span className="flex-1">{cat.label}</span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full leading-relaxed"
                          style={{
                            background: active ? "rgba(255,255,255,0.2)" : "rgb(var(--bg-muted))",
                            color: active ? "#fff" : "rgb(var(--text-muted))",
                          }}
                        >
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sort dropdown */}
          <div className="relative flex-shrink-0" ref={sortRef}>
            <button
              onClick={() => { setSortOpen(o => !o); setCatOpen(false) }}
              className="flex items-center gap-2 px-3.5 py-[10px] text-[13px] font-semibold whitespace-nowrap transition-all duration-200"
              style={{
                borderRadius: 12,
                border: sortOpen
                  ? "1.5px solid rgb(var(--brand-500) / 0.6)"
                  : "1.5px solid rgb(var(--surface-border) / 0.5)",
                background: sortOpen ? "rgb(var(--bg-subtle))" : "rgb(var(--surface-raised))",
                color: "rgb(var(--text-secondary))",
                boxShadow: sortOpen ? "0 0 0 3px rgb(var(--brand-500) / 0.08)" : "none",
              }}
            >
              <SlidersHorizontal className="w-[14px] h-[14px]" style={{ color: "rgb(var(--brand-400))" }} />
              <span>{activeSort.label}</span>
              <ChevronDown
                className="w-3.5 h-3.5 transition-transform duration-200"
                style={{
                  color: "rgb(var(--brand-400))",
                  transform: sortOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            <AnimatePresence>
              {sortOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] right-0 z-50 p-1.5"
                  style={{
                    minWidth: 168,
                    borderRadius: 16,
                    border: "1.5px solid rgb(var(--surface-border) / 0.5)",
                    background: "rgb(var(--surface-raised))",
                    boxShadow: "0 12px 40px rgb(var(--brand-700) / 0.15), 0 2px 8px rgb(0 0 0 / 0.06)",
                  }}
                >
                  {SORT_OPTIONS.map(opt => {
                    const active = sort === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setSort(opt.value); setSortOpen(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-[13px] font-medium text-left transition-all duration-150"
                        style={dropItemStyle(active)}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
                      >
                        <span className="flex-1">{opt.label}</span>
                        {active && <span className="text-[11px] opacity-80">✓</span>}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Results count + clear ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="w-full max-w-3xl flex items-center gap-2 mb-7"
          >
            <span className="text-[11px] font-semibold" style={{ color: "rgb(var(--text-faint))" }}>
              {filteredData.length} {filteredData.length === 1 ? "resource" : "resources"}
              {filter !== "all" && (
                <span style={{ color: "rgb(var(--text-muted))" }}>
                  {" "}in <em>{activeCat.label}</em>
                </span>
              )}
              {searchTerm && (
                <span style={{ color: "rgb(var(--text-muted))" }}>
                  {" "}for "<em>{searchTerm}</em>"
                </span>
              )}
              {totalPages > 1 && (
                <span> · page {page} of {totalPages}</span>
              )}
            </span>

            {(filter !== "all" || searchTerm) && (
              <button
                onClick={() => { setFilter("all"); setSearchTerm("") }}
                className="text-[11px] font-semibold underline underline-offset-2 transition-colors duration-150"
                style={{ color: "rgb(var(--brand-500))" }}
              >
                Clear
              </button>
            )}
          </motion.div>
        )}

        {/* ── Grid ── */}
        <div className="w-full max-w-3xl">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(9)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl h-56 animate-pulse"
                  style={{
                    background: "rgb(var(--surface-raised))",
                    border: "1px solid rgb(var(--surface-border) / 0.15)",
                  }}
                />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <motion.p
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm mt-20"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              No resources found. Try a different filter or search term.
            </motion.p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={filter + searchTerm + sort + page}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {paginated.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
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
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: "rgb(var(--surface-raised))",
                border: "1px solid rgb(var(--surface-border) / 0.3)",
                color: "rgb(var(--text-muted))",
              }}
              onMouseEnter={e => { if (page !== 1) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgb(var(--surface-raised))" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce((acc, n, idx, arr) => {
                if (idx > 0 && n - arr[idx - 1] > 1) acc.push("…")
                acc.push(n)
                return acc
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`e-${i}`} className="px-1 text-xs" style={{ color: "rgb(var(--text-faint))" }}>…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }) }}
                    className="w-9 h-9 rounded-xl text-xs font-semibold transition-all duration-200"
                    style={page === n ? {
                      background: `linear-gradient(135deg, rgb(var(--brand-500)), rgb(var(--accent-500)))`,
                      color: "#fff",
                      border: "1px solid rgb(var(--brand-500) / 0.6)",
                      boxShadow: "0 0 16px rgb(var(--brand-500) / 0.25)",
                    } : {
                      background: "rgb(var(--surface-raised))",
                      border: "1px solid rgb(var(--surface-border) / 0.3)",
                      color: "rgb(var(--text-muted))",
                    }}
                    onMouseEnter={e => { if (page !== n) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
                    onMouseLeave={e => { if (page !== n) e.currentTarget.style.background = "rgb(var(--surface-raised))" }}
                  >
                    {n}
                  </button>
                )
              )}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-25 disabled:cursor-not-allowed"
              style={{
                background: "rgb(var(--surface-raised))",
                border: "1px solid rgb(var(--surface-border) / 0.3)",
                color: "rgb(var(--text-muted))",
              }}
              onMouseEnter={e => { if (page !== totalPages) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgb(var(--surface-raised))" }}
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}