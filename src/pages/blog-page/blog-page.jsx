"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import BlogPublicCard from "@/components/blog/blog-public-card"
import BlogEmpty from "@/components/blog/blog-empty"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, SlidersHorizontal } from "lucide-react"

const CATEGORIES = [
  { key: "all",                   label: "All posts",   icon: "✦" },
  { key: "Technology",            label: "Technology",  icon: "⬡" },
  { key: "AI",                    label: "AI",          icon: "◈" },
  { key: "Innovation",            label: "Innovation",  icon: "◇" },
  { key: "Personal Development",  label: "Growth",      icon: "△" },
  { key: "Education",             label: "Education",   icon: "□" },
  { key: "Health",                label: "Health",      icon: "○" },
  { key: "Science",               label: "Science",     icon: "⬟" },
]

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
]

const USER_PRIMARY   = "#a21caf"
const USER_SECONDARY = "#7c3aed"
const COLOR_CACHE    = new Map()

export default function BlogPage() {
  const [blogs, setBlogs]             = useState([])
  const [searchTerm, setSearchTerm]   = useState("")
  const [filter, setFilter]           = useState("all")
  const [sort, setSort]               = useState("newest")
  const [loading, setLoading]         = useState(true)
  const [catOpen, setCatOpen]         = useState(false)
  const [sortOpen, setSortOpen]       = useState(false)
  const catRef  = useRef(null)
  const sortRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target))   setCatOpen(false)
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  useEffect(() => {
    async function fetchBlogs() {
      setLoading(true)
      const { data: blogData, error } = await supabase
        .from("blogs").select("*").order("created_at", { ascending: false })

      if (error || !blogData?.length) { setLoading(false); return }

      const orgNames = [...new Set(blogData.map(b => b.organization).filter(Boolean))]
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

      setBlogs(blogData.map(blog => ({
        ...blog,
        _theme: blog.organization && COLOR_CACHE.has(blog.organization)
          ? COLOR_CACHE.get(blog.organization)
          : COLOR_CACHE.get("user-default"),
      })))
      setLoading(false)
    }
    fetchBlogs()
  }, [])

  const getThemeArr = (item) =>
    Array.isArray(item.theme)
      ? item.theme.map(t => t.toLowerCase())
      : (item.theme || "").split(/[,|]/).map(t => t.trim().toLowerCase())

  const countFor = (key) => key === "all"
    ? blogs.length
    : blogs.filter(b => getThemeArr(b).includes(key.toLowerCase())).length

  const activeCat = CATEGORIES.find(c => c.key === filter) ?? CATEGORIES[0]
  const activeSort = SORT_OPTIONS.find(s => s.value === sort) ?? SORT_OPTIONS[0]

  const filteredData = useMemo(() => {
    const s = searchTerm.toLowerCase()
    let result = blogs.filter(item => {
      const themes = getThemeArr(item)
      const matchSearch = !s || [item.title, item.des, item.content, item.organization]
        .some(f => (f || "").toLowerCase().includes(s)) || themes.some(t => t.includes(s))
      const matchFilter = filter === "all" || themes.includes(filter.toLowerCase())
      return matchSearch && matchFilter
    })
    if (sort === "oldest") result = [...result].reverse()
    return result
  }, [blogs, searchTerm, filter, sort])

  return (
    <div className="w-full min-h-screen" style={{ background: "rgb(var(--bg-base))" }}>

      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(var(--surface-border) / 0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 pb-24">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl mt-24 mb-12 text-center"
        >
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4"
            style={{ color: "rgb(var(--brand-500))" }}
          >
            ✦ &nbsp; Community voices &nbsp; ✦
          </motion.p>

          <h1
            className="text-5xl sm:text-7xl font-black leading-[0.95] tracking-[-0.04em] mb-5"
            style={{
              backgroundImage: `linear-gradient(135deg,
                rgb(var(--accent-400)) 0%,
                rgb(var(--brand-500)) 45%,
                rgb(var(--brand-600)) 75%,
                rgb(var(--accent-500)) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Byteon Blog
          </h1>

          <p className="text-sm sm:text-base max-w-md mx-auto leading-relaxed"
            style={{ color: "rgb(var(--text-secondary))" }}>
            Stories, insights, and discoveries from our community of builders and thinkers.
          </p>
        </motion.div>

        {/* ── Toolbar: Search + Category dropdown + Sort dropdown — all one row ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }}
          className="w-full max-w-3xl flex items-center gap-2 mb-3"
        >

          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[15px] h-[15px] pointer-events-none"
              style={{ color: "rgb(var(--brand-400))" }}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search articles, topics, authors…"
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
              className="flex items-center gap-2 px-3.5 py-[10px] text-[13px] font-semibold transition-all duration-200 whitespace-nowrap"
              style={{
                borderRadius: 12,
                border: catOpen
                  ? "1.5px solid rgb(var(--brand-500) / 0.6)"
                  : "1.5px solid rgb(var(--surface-border) / 0.5)",
                background: catOpen ? "rgb(var(--bg-subtle))" : "rgb(var(--surface-raised))",
                color: "rgb(var(--text-muted))",
                boxShadow: catOpen ? "0 0 0 3px rgb(var(--brand-500) / 0.08)" : "none",
              }}
            >
              <span style={{ fontSize: 14 }}>{activeCat.icon}</span>
              <span style={{ color: "rgb(var(--text-secondary))" }}>{activeCat.label}</span>
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
                    minWidth: 210,
                    borderRadius: 16,
                    border: "1.5px solid rgb(var(--surface-border) / 0.5)",
                    background: "rgb(var(--surface-raised))",
                    boxShadow: "0 12px 40px rgb(var(--brand-700) / 0.15), 0 2px 8px rgb(0 0 0 / 0.06)",
                  }}
                >
                  {CATEGORIES.map(cat => {
                    const active = filter === cat.key
                    const count = countFor(cat.key)
                    return (
                      <button
                        key={cat.key}
                        onClick={() => { setFilter(cat.key); setCatOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-left transition-all duration-150"
                        style={{
                          borderRadius: 10,
                          background: active
                            ? `linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--accent-500)))`
                            : "transparent",
                          color: active ? "#fff" : "rgb(var(--text-secondary))",
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
                      >
                        <span className="w-5 text-center flex-shrink-0" style={{ fontSize: 13 }}>{cat.icon}</span>
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
              className="flex items-center gap-2 px-3.5 py-[10px] text-[13px] font-semibold transition-all duration-200 whitespace-nowrap"
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
                    minWidth: 160,
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
                        style={{
                          borderRadius: 10,
                          background: active
                            ? `linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--accent-500)))`
                            : "transparent",
                          color: active ? "#fff" : "rgb(var(--text-secondary))",
                        }}
                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgb(var(--bg-muted))" }}
                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}
                      >
                        {opt.label}
                        {active && (
                          <span className="ml-auto text-[10px] opacity-80">✓</span>
                        )}
                      </button>
                    )
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Results count ── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="w-full max-w-3xl mb-7 flex items-center gap-2"
          >
            <span
              className="text-[11px] font-semibold"
              style={{ color: "rgb(var(--text-faint))" }}
            >
              {filteredData.length} {filteredData.length === 1 ? "post" : "posts"}
              {filter !== "all" && (
                <span style={{ color: "rgb(var(--text-muted))" }}> in <em>{activeCat.label}</em></span>
              )}
              {searchTerm && (
                <span style={{ color: "rgb(var(--text-muted))" }}> for "<em>{searchTerm}</em>"</span>
              )}
            </span>

            {(filter !== "all" || searchTerm) && (
              <button
                onClick={() => { setFilter("all"); setSearchTerm("") }}
                className="text-[11px] font-semibold transition-colors duration-150 underline underline-offset-2"
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
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="rounded-2xl h-64 animate-pulse"
                  style={{
                    background: "rgb(var(--surface-raised))",
                    border: "1.5px solid rgb(var(--surface-border) / 0.2)",
                  }}
                />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-20"
            >
              <BlogEmpty />
            </motion.div>
          ) : (
            <motion.div
              key={filter + searchTerm + sort}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredData.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                >
                  <BlogPublicCard item={item} theme={item._theme} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </div>
  )
}