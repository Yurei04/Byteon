"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import BlogPublicCard from "@/components/blog/blog-public-card"
import BlogEmpty from "@/components/blog/blog-empty"
import { motion } from "framer-motion"
import { Search, BookOpen, Sparkles } from "lucide-react"

const CATEGORIES = [
  "all", "Technology", "Personal Development",
  "Innovation", "Education", "Health", "AI", "Science",
]

const USER_PRIMARY   = "#c026d3"
const USER_SECONDARY = "#a855f7"
const COLOR_CACHE    = new Map()

export default function BlogPage() {
  const [blogs, setBlogs]           = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter]         = useState("all")
  const [loading, setLoading]       = useState(true)

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

      if (!COLOR_CACHE.has("user-default")) COLOR_CACHE.set("user-default", buildTheme(USER_PRIMARY, USER_SECONDARY))

      setBlogs(blogData.map(blog => ({
        ...blog,
        _authorType: blog.organization && COLOR_CACHE.has(blog.organization) ? "org" : "user",
        _theme: (blog.organization && COLOR_CACHE.has(blog.organization))
          ? COLOR_CACHE.get(blog.organization)
          : COLOR_CACHE.get("user-default"),
      })))
      setLoading(false)
    }
    fetchBlogs()
  }, [])

  const filteredData = useMemo(() => blogs.filter(item => {
    const s = searchTerm.toLowerCase()
    const themeArr = Array.isArray(item.theme)
      ? item.theme.map(t => t.toLowerCase())
      : (item.theme || "").split(/[,|]/).map(t => t.trim().toLowerCase())
    return (
      [(item.title||""),(item.des||""),(item.content||""),(item.organization||"")].some(f => f.toLowerCase().includes(s)) ||
      themeArr.some(t => t.includes(s))
    ) && (filter === "all" || themeArr.includes(filter.toLowerCase()))
  }), [blogs, searchTerm, filter])

  return (
    <div className="w-full min-h-screen relative overflow-x-hidden">
      <div class="absolute inset-0">
        <div class="absolute top-0 z-[-2] h-full w-full bg-[#000000] bg-[radial-gradient(#ffffff33_1px,#00091d_1px)] bg-[size:20px_20px]"></div>
      </div>

      {/* ══════════════════════════════════════
          CONTENT
      ══════════════════════════════════════ */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 sm:px-6 pb-20">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-5xl mt-28 mb-14 text-center relative"
        >
          {/* Floating icon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(192,38,211,0.12)",
              border: "1px solid rgba(192,38,211,0.35)",
              color: "#e879f9",
              boxShadow: "0 0 20px rgba(192,38,211,0.15)",
            }}
          >
            <Sparkles className="w-3 h-3" />
            Community Knowledge
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-none tracking-tight">
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #f0abfc 0%, #c026d3 40%, #a855f7 70%, #818cf8 100%)" }}>
              Byteon Blog
            </span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: "rgba(240,171,252,0.5)" }}>
            Stories, insights, and discoveries from our community of builders and thinkers.
          </p>

          {/* Decorative lines */}
          <div className="absolute -left-8 top-1/2 w-px h-24 -translate-y-1/2 hidden lg:block"
            style={{ background: "linear-gradient(to bottom, transparent, #c026d350, transparent)" }} />
          <div className="absolute -right-8 top-1/2 w-px h-24 -translate-y-1/2 hidden lg:block"
            style={{ background: "linear-gradient(to bottom, transparent, #a855f750, transparent)" }} />
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          className="w-full max-w-2xl mb-5 relative"
        >
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200"
              style={{ color: "rgba(192,38,211,0.5)" }} />
            <input
              type="text" value={searchTerm}
              placeholder="Search articles, topics, authors…"
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm text-white outline-none transition-all duration-200"
              style={{
                background: "rgba(192,38,211,0.08)",
                border: "1px solid rgba(192,38,211,0.25)",
                boxShadow: "0 0 0 0 transparent",
                color: "rgba(255,255,255,0.85)",
              }}
              onFocus={e => {
                e.target.style.background = "rgba(192,38,211,0.12)"
                e.target.style.borderColor = "rgba(192,38,211,0.55)"
                e.target.style.boxShadow = "0 0 0 3px rgba(192,38,211,0.12), 0 0 20px rgba(192,38,211,0.08)"
              }}
              onBlur={e => {
                e.target.style.background = "rgba(192,38,211,0.08)"
                e.target.style.borderColor = "rgba(192,38,211,0.25)"
                e.target.style.boxShadow = "none"
              }}
            />
          </div>
        </motion.div>

        {/* ── Category filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl"
        >
          {CATEGORIES.map((cat, i) => {
            const active = filter === cat
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.04 }}
                onClick={() => setFilter(cat)}
                className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={active ? {
                  background: "linear-gradient(135deg, #c026d3, #a855f7)",
                  color: "#ffffff",
                  border: "1px solid rgba(192,38,211,0.6)",
                  boxShadow: "0 0 20px rgba(192,38,211,0.35), 0 2px 8px rgba(0,0,0,0.3)",
                  transform: "translateY(-1px)",
                } : {
                  background: "rgba(192,38,211,0.07)",
                  color: "rgba(240,171,252,0.6)",
                  border: "1px solid rgba(192,38,211,0.18)",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(192,38,211,0.14)"; e.currentTarget.style.color = "#f0abfc"; e.currentTarget.style.borderColor = "rgba(192,38,211,0.35)" }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(192,38,211,0.07)"; e.currentTarget.style.color = "rgba(240,171,252,0.6)"; e.currentTarget.style.borderColor = "rgba(192,38,211,0.18)" }}}
              >
                {cat === "all" ? "All Posts" : cat}
              </motion.button>
            )
          })}
        </motion.div>

        {/* ── Results count ── */}
        {!loading && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xs mb-6 self-start max-w-6xl w-full"
            style={{ color: "rgba(192,38,211,0.5)" }}
          >
            {filteredData.length} {filteredData.length === 1 ? "post" : "posts"} found
            {filter !== "all" && <span style={{ color: "rgba(168,85,247,0.6)" }}> in <em>{filter}</em></span>}
          </motion.p>
        )}

        {/* ── Grid ── */}
        <motion.div
          key={filter + searchTerm}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="w-full max-w-6xl"
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl h-64 animate-pulse"
                  style={{ background: "rgba(192,38,211,0.07)", border: "1px solid rgba(192,38,211,0.12)" }} />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center mt-16"><BlogEmpty /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <BlogPublicCard item={item} theme={item._theme} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}