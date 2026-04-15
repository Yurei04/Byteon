"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import AnnounceEmpty from "@/components/(dashboard)/announce/announce-empty"
import { motion } from "framer-motion"
import { Search, Zap, CalendarDays } from "lucide-react"
import AnnouncementPublicCard from "@/components/(dashboard)/announce/announce-public-card"

const COLOR_CACHE      = new Map()
const DEFAULT_PRIMARY   = "#c026d3"
const DEFAULT_SECONDARY = "#a855f7"

const STATUS_META = [
  { value: "active",   label: "Active",   dot: "#22c55e", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.28)"  },
  { value: "upcoming", label: "Upcoming", dot: "#38bdf8", bg: "rgba(56,189,248,0.12)", border: "rgba(56,189,248,0.28)" },
  { value: "finished", label: "Finished", dot: "#71717a", bg: "rgba(113,113,122,0.1)", border: "rgba(113,113,122,0.2)" },
]

function getStatus(item) {
  const now   = new Date()
  const begin = item.date_begin ? new Date(item.date_begin) : null
  const end   = item.date_end   ? new Date(item.date_end)   : null
  if (!begin || !end) return "unknown"
  if (now < begin)                return "upcoming"
  if (now >= begin && now <= end) return "active"
  return "finished"
}

export default function AnnouncePage() {
  const [announcements, setAnnouncements] = useState([])
  const [searchTerm, setSearchTerm]       = useState("")
  const [filter, setFilter]               = useState("all")
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    async function fetchAnnouncements() {
      setLoading(true)
      const { data, error } = await supabase
        .from("announcements").select("*").order("created_at", { ascending: false })

      if (error || !data?.length) { setLoading(false); return }

      const orgNames = [...new Set(data.map(a => a.organization).filter(Boolean))]
      const uncached = orgNames.filter(n => !COLOR_CACHE.has(n))

      if (uncached.length) {
        const { data: orgData } = await supabase
          .from("organizations").select("name, primary_color, secondary_color").in("name", uncached)
        ;(orgData || []).forEach(org => {
          COLOR_CACHE.set(org.name, buildTheme(org.primary_color ?? DEFAULT_PRIMARY, org.secondary_color ?? DEFAULT_SECONDARY))
        })
      }

      setAnnouncements(data.map(item => ({
        ...item,
        _theme: item.organization && COLOR_CACHE.has(item.organization)
          ? COLOR_CACHE.get(item.organization)
          : buildTheme(DEFAULT_PRIMARY, DEFAULT_SECONDARY),
      })))
      setLoading(false)
    }
    fetchAnnouncements()
  }, [])

  const filteredData = useMemo(() =>
    announcements.filter(item => {
      const s = searchTerm.toLowerCase()
      const matchesSearch = [(item.title||""),(item.des||""),(item.organization||""),(item.author||""),(item.open_to||"")]
        .some(f => f.toLowerCase().includes(s))
      return matchesSearch && (filter === "all" || getStatus(item) === filter)
    }), [announcements, searchTerm, filter])

  // accent for this page: electric blue/cyan
  const A  = "#0ea5e9"  // sky-500
  const A2 = "#38bdf8"  // sky-400

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
          {/* Label badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs font-semibold uppercase tracking-widest"
            style={{
              background: `rgba(14,165,233,0.1)`,
              border: `1px solid rgba(14,165,233,0.35)`,
              color: A2,
              boxShadow: `0 0 20px rgba(14,165,233,0.12)`,
            }}
          >
            <CalendarDays className="w-3 h-3" />
            Hackathon Events
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-black mb-5 leading-none tracking-tight">
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: `linear-gradient(135deg, #bae6fd 0%, ${A} 40%, #6366f1 80%, #c026d3 100%)` }}>
              Announcements
            </span>
          </h1>
          <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: `rgba(186,230,253,0.45)` }}>
            Discover hackathons and competitions from organizations worldwide.
          </p>

          {/* Decorative corner accents */}
          <div className="absolute -left-4 top-8 hidden lg:block">
            <div className="w-px h-16" style={{ background: `linear-gradient(to bottom, transparent, ${A}60, transparent)` }} />
          </div>
          <div className="absolute -right-4 top-8 hidden lg:block">
            <div className="w-px h-16" style={{ background: `linear-gradient(to bottom, transparent, #6366f160, transparent)` }} />
          </div>
        </motion.div>

        {/* ── Status count strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex items-center gap-6 mb-8"
        >
          {STATUS_META.map(({ value, label, dot, bg, border }) => {
            const count = announcements.filter(a => getStatus(a) === value).length
            return (
              <div key={value} className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
                <span style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: bg, color: dot, border: `1px solid ${border}` }}>
                  {count}
                </span>
              </div>
            )
          })}
        </motion.div>

        {/* ── Search ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-2xl mb-5"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: `${A}60` }} />
            <input
              type="text" placeholder="Search hackathons, organizations…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
              style={{
                background: `rgba(14,165,233,0.07)`,
                border: `1px solid rgba(14,165,233,0.22)`,
                color: "rgba(255,255,255,0.85)",
              }}
              onFocus={e => { e.target.style.background = `rgba(14,165,233,0.12)`; e.target.style.borderColor = `${A}55`; e.target.style.boxShadow = `0 0 0 3px rgba(14,165,233,0.1)` }}
              onBlur={e => { e.target.style.background = `rgba(14,165,233,0.07)`; e.target.style.borderColor = `rgba(14,165,233,0.22)`; e.target.style.boxShadow = "none" }}
            />
          </div>
        </motion.div>

        {/* ── Filter chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {[{ value: "all", label: "All Events", dot: null }, ...STATUS_META].map(({ value, label, dot }) => {
            const active = filter === value
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={active ? {
                  background: `linear-gradient(135deg, ${A}, #6366f1)`,
                  color: "#ffffff",
                  border: `1px solid ${A}60`,
                  boxShadow: `0 0 20px rgba(14,165,233,0.3), 0 2px 8px rgba(0,0,0,0.3)`,
                  transform: "translateY(-1px)",
                } : {
                  background: `rgba(14,165,233,0.06)`,
                  color: `rgba(186,230,253,0.55)`,
                  border: `1px solid rgba(14,165,233,0.18)`,
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = `rgba(14,165,233,0.12)`; e.currentTarget.style.color = A2; e.currentTarget.style.borderColor = `rgba(14,165,233,0.35)` }}}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = `rgba(14,165,233,0.06)`; e.currentTarget.style.color = `rgba(186,230,253,0.55)`; e.currentTarget.style.borderColor = `rgba(14,165,233,0.18)` }}}
              >
                {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
                {label}
              </button>
            )
          })}
        </motion.div>

        {/* ── Grid ── */}
        <motion.div
          key={filter + searchTerm}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
          className="w-full max-w-6xl"
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl h-72 animate-pulse"
                  style={{ background: `rgba(14,165,233,0.06)`, border: `1px solid rgba(14,165,233,0.1)` }} />
              ))}
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex justify-center mt-16"><AnnounceEmpty /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}>
                  <AnnouncementPublicCard item={item} theme={item._theme} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}