"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { motion } from "framer-motion"
import { Search, Library, Layers } from "lucide-react"
import ResourcePublicCard from "@/components/resourceHub/resource-public-card"

const USER_PRIMARY   = "#c026d3"
const USER_SECONDARY = "#a855f7"
const COLOR_CACHE    = new Map()

const CATEGORIES = [
  { label: "All",        value: "all",                icon: "✦" },
  { label: "Web Dev",    value: "Web Development",    icon: "🌐" },
  { label: "Mobile",     value: "Mobile Development", icon: "📱" },
  { label: "AI & ML",    value: "AI & ML",            icon: "🤖" },
  { label: "Deployment", value: "Deployment",         icon: "🚀" },
  { label: "DevOps",     value: "DevOps",             icon: "⚙️" },
  { label: "UI / UX",    value: "UI/UX Design",       icon: "🎨" },
]

export default function ResourceHubPage() {
  const [resources, setResources]   = useState([])
  const [filter, setFilter]         = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading]       = useState(true)

  // emerald/teal accent
  const A  = "#10b981"  // emerald-500
  const A2 = "#34d399"  // emerald-400
  const A3 = "#06b6d4"  // cyan-500

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

      if (!COLOR_CACHE.has("user-default")) COLOR_CACHE.set("user-default", buildTheme(USER_PRIMARY, USER_SECONDARY))

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

  const filteredData = useMemo(() =>
    resources.filter(item => {
      const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filter === "all" || (item.category || "").toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    }), [resources, searchTerm, filter])

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
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-5xl mt-28 mb-12 text-center relative"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: `rgba(16,185,129,0.1)`,
              border: `1px solid rgba(16,185,129,0.35)`,
              color: A2,
              boxShadow: `0 0 20px rgba(16,185,129,0.12)`,
            }}
          >
            <Layers className="w-3 h-3" />
            Curated Resources
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-none tracking-tight">
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(135deg, #a7f3d0 0%, ${A} 35%, ${A3} 65%, #6366f1 100%)` }}>
              Resource Hub
            </span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: `rgba(167,243,208,0.45)` }}>
            Curated tools, guides, and materials to sharpen your tech skills.
          </p>

          {/* Decorative side lines */}
          <div className="absolute -left-4 top-12 hidden lg:block w-px h-16"
            style={{ background: `linear-gradient(to bottom, transparent, ${A}60, transparent)` }} />
          <div className="absolute -right-4 top-12 hidden lg:block w-px h-16"
            style={{ background: `linear-gradient(to bottom, transparent, ${A3}60, transparent)` }} />
        </motion.div>

        {/* ── Stats strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mb-8"
        >
          {[
            { label: "Total Resources", count: resources.length,        accent: A  },
            { label: "Categories",      count: CATEGORIES.length - 1,  accent: A3 },
            { label: "Organizations",   count: [...new Set(resources.map(r => r.organization).filter(Boolean))].length, accent: "#a855f7" },
          ].map(({ label, count, accent }) => (
            <div key={label} className="flex items-center gap-2.5 text-xs">
              <span className="text-lg font-bold" style={{ color: accent }}>{loading ? "—" : count}</span>
              <span style={{ color: "rgba(255,255,255,0.35)" }}>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-2xl mb-5"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${A}60` }} />
            <input
              type="text" placeholder="Search resources, tools, guides…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
              style={{
                background: `rgba(16,185,129,0.07)`,
                border: `1px solid rgba(16,185,129,0.22)`,
                color: "rgba(255,255,255,0.85)",
              }}
              onFocus={e => { e.target.style.background = `rgba(16,185,129,0.11)`; e.target.style.borderColor = `${A}55`; e.target.style.boxShadow = `0 0 0 3px rgba(16,185,129,0.1)` }}
              onBlur={e => { e.target.style.background = `rgba(16,185,129,0.07)`; e.target.style.borderColor = `rgba(16,185,129,0.22)`; e.target.style.boxShadow = "none" }}
            />
          </div>
        </motion.div>

        {/* ── Category filters ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12 max-w-3xl"
        >
          {CATEGORIES.map(({ label, value, icon }, i) => {
            const active = filter === value
            return (
              <motion.button
                key={value}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => setFilter(value)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={active ? {
                  background: `linear-gradient(135deg, ${A}, ${A3})`,
                  color: "#ffffff",
                  border: `1px solid ${A}60`,
                  boxShadow: `0 0 20px rgba(16,185,129,0.35), 0 2px 8px rgba(0,0,0,0.3)`,
                  transform: "translateY(-1px)",
                } : {
                  background: `rgba(16,185,129,0.06)`,
                  color: `rgba(167,243,208,0.55)`,
                  border: `1px solid rgba(16,185,129,0.18)`,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = `rgba(16,185,129,0.12)`; e.currentTarget.style.color = A2; e.currentTarget.style.borderColor = `rgba(16,185,129,0.35)` }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = `rgba(16,185,129,0.06)`; e.currentTarget.style.color = `rgba(167,243,208,0.55)`; e.currentTarget.style.borderColor = `rgba(16,185,129,0.18)` }}}
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
            className="text-xs mb-6 self-start max-w-6xl w-full"
            style={{ color: `rgba(16,185,129,0.5)` }}
          >
            {filteredData.length} {filteredData.length === 1 ? "resource" : "resources"} found
            {filter !== "all" && (
              <span style={{ color: `rgba(52,211,153,0.6)` }}>
                {" "}in <em>{CATEGORIES.find(c => c.value === filter)?.label}</em>
              </span>
            )}
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
                  style={{ background: `rgba(16,185,129,0.06)`, border: `1px solid rgba(16,185,129,0.1)` }} />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <p className="text-center text-sm mt-16" style={{ color: `rgba(52,211,153,0.35)` }}>
              No resources found for this filter.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <ResourcePublicCard item={item} theme={item._theme} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}