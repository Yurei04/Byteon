"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import AnnounceEmpty from "@/components/(dashboard)/announce/announce-empty"
import { motion } from "framer-motion"
import { Search, Zap, CalendarDays, Radio, Clock, CheckCircle2, ChevronRight } from "lucide-react"
import AnnouncementPublicCard from "@/components/(dashboard)/announce/announce-public-card"

/* ─── Color Tokens ─── */
const COLOR_CACHE       = new Map()
const DEFAULT_PRIMARY   = "#a21caf"
const DEFAULT_SECONDARY = "#7c3aed"

const P  = "#d946ef"   // fuchsia-500
const P2 = "#a855f7"   // purple-500
const P3 = "#e9d5ff"   // purple-200

/* ─── Status Config ─── */
const STATUS_META = [
  { value: "active",   label: "Active",   icon: Radio,        dot: "#22c55e",  bg: "rgba(34,197,94,0.08)",   border: "rgba(34,197,94,0.2)",    pulse: true  },
  { value: "upcoming", label: "Upcoming", icon: Clock,        dot: "#d946ef",  bg: "rgba(217,70,239,0.08)",  border: "rgba(217,70,239,0.22)",  pulse: false },
  { value: "finished", label: "Finished", icon: CheckCircle2, dot: "#a1a1aa",  bg: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.18)", pulse: false },
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

function formatDate(d) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

/* ─── Featured Card ─── */
function FeaturedCard({ item }) {
  if (!item) return (
    <div className="w-full rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(168,85,247,0.04)",
        border: "1px solid rgba(168,85,247,0.12)",
        minHeight: 260,
      }}>
      <p className="text-sm" style={{ color: "rgba(233,213,255,0.3)" }}>No active events right now</p>
    </div>
  )

  return (
    <div className="relative w-full rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(135deg, rgba(217,70,239,0.07) 0%, rgba(168,85,247,0.06) 100%)",
        border: "1px solid rgba(168,85,247,0.2)",
        minHeight: 260,
      }}>
      {/* Live badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#4ade80" }}>
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-400" />
        </span>
        Live
      </div>

      <div className="p-6 flex flex-col gap-3 h-full">
        {item.organization && (
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: P2 }}>
            {item.organization}
          </p>
        )}
        <h2 className="text-xl font-black leading-snug" style={{ color: "rgba(255,255,255,0.9)" }}>
          {item.title || "Untitled Event"}
        </h2>
        {item.des && (
          <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "rgba(233,213,255,0.45)" }}>
            {item.des}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(168,85,247,0.12)" }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(233,213,255,0.35)" }}>
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{formatDate(item.date_begin)} – {formatDate(item.date_end)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: P2 }}>
            View <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Stat Pill ─── */
function StatPill({ icon: Icon, label, count, dot, bg, border, pulse }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
      style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="relative flex items-center justify-center">
        {pulse && (
          <span className="absolute inline-flex w-4 h-4 rounded-full animate-ping opacity-25"
            style={{ background: dot }} />
        )}
        <Icon className="w-3.5 h-3.5 relative" style={{ color: dot }} />
      </div>
      <div>
        <p className="text-base font-black leading-none" style={{ color: dot }}>{count}</p>
        <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: `${dot}88` }}>{label}</p>
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
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

  const featuredItem  = useMemo(() =>
    announcements.find(a => getStatus(a) === "active") || null, [announcements])

  const counts = useMemo(() =>
    STATUS_META.reduce((acc, { value }) => ({
      ...acc,
      [value]: announcements.filter(a => getStatus(a) === value).length,
    }), {}), [announcements])

  return (
    <div className="w-full min-h-screen relative bg-[#0a0015] bg-[radial-gradient(#ffffff22_1px,#0a0015_1px)] bg-[size:20px_20px]">

      <div className="relative z-10 w-full flex flex-col items-center">

        {/* ══════════════════════════════
            TOP NAV / WORDMARK
        ══════════════════════════════ */}
        <div className="w-full max-w-7xl px-4 sm:px-8 pt-8 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Wordmark */}
            <span className="text-lg font-black tracking-tighter" style={{ color: "#fff" }}>
              byte<span style={{ color: P2 }}>on</span>
            </span>
            {/* Divider */}
            <span className="text-xs mx-1" style={{ color: "rgba(219,39,119,0.25)" }}>/</span>
            <span className="text-xs font-medium" style={{ color: "rgba(251,207,232,0.3)" }}>
              Events
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{ background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.2)", color: P2 }}>
            <Zap className="w-3 h-3" />
            Hackathon Hub
          </div>
        </div>

        {/* ══════════════════════════════
            HERO — SPLIT LAYOUT
        ══════════════════════════════ */}
        <section className="w-full max-w-7xl px-4 sm:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

            {/* Left */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <h1 className="font-black leading-[0.93] tracking-tight mb-5"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}>
                <span className="block" style={{ color: "rgba(255,255,255,0.9)" }}>Find Your</span>
                <span className="block" style={{ color: "rgba(255,255,255,0.9)" }}>Next Big</span>
                <span className="block"
                  style={{
                    backgroundImage: `linear-gradient(90deg, ${P} 0%, ${P2} 55%, #c084fc 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                  Hackathon.
                </span>
              </h1>

              <p className="text-sm leading-relaxed mb-8 max-w-sm"
                style={{ color: "rgba(233,213,255,0.35)" }}>
                Competitions and events posted by organizations on byteon — one hub, every opportunity.
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                {STATUS_META.map(({ value, label, icon, dot, bg, border, pulse }) => (
                  <StatPill key={value} icon={icon} label={label}
                    count={loading ? "–" : counts[value] ?? 0}
                    dot={dot} bg={bg} border={border} pulse={pulse} />
                ))}
              </div>
            </motion.div>

            {/* Right: Spotlight */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "rgba(168,85,247,0.5)" }}>
                  Spotlight
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(168,85,247,0.12)" }} />
              </div>
              {loading ? (
                <div className="w-full rounded-2xl h-64 animate-pulse"
                  style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.1)" }} />
              ) : (
                <FeaturedCard item={featuredItem} />
              )}
            </motion.div>
          </div>
        </section>

        {/* Thin divider */}
        <div className="w-full max-w-7xl px-4 sm:px-8 mb-10">
          <div className="w-full h-px" style={{ background: "rgba(168,85,247,0.12)" }} />
        </div>

        {/* ══════════════════════════════
            BROWSE SECTION
        ══════════════════════════════ */}
        <section className="w-full max-w-7xl px-4 sm:px-8 pb-24">

          {/* Header + Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-5"
          >
            <div className="flex-1">
              <h2 className="text-base font-black tracking-tight" style={{ color: "rgba(255,255,255,0.8)" }}>
                All Events
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(233,213,255,0.25)" }}>
                {loading ? "Loading…" : `${filteredData.length} event${filteredData.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "rgba(168,85,247,0.45)" }} />
              <input
                type="text"
                placeholder="Search events…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: "rgba(168,85,247,0.06)",
                  border: "1px solid rgba(168,85,247,0.18)",
                  color: "rgba(255,255,255,0.8)",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(168,85,247,0.4)"
                  e.target.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.07)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(168,85,247,0.18)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>
          </motion.div>

          {/* Filter tabs */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="flex gap-1 p-1 rounded-xl w-fit mb-8"
            style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.14)" }}
          >
            {[{ value: "all", label: "All", dot: null }, ...STATUS_META].map(({ value, label, dot }) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={active ? {
                    background: `linear-gradient(135deg, ${P} 0%, ${P2} 100%)`,
                    color: "#fff",
                  } : {
                    color: "rgba(233,213,255,0.35)",
                    background: "transparent",
                  }}
                >
                  {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />}
                  {label}
                </button>
              )
            })}
          </motion.div>

          {/* Cards grid */}
          <motion.div
            key={filter + searchTerm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl h-56 animate-pulse"
                    style={{ background: "rgba(168,85,247,0.05)", border: "1px solid rgba(168,85,247,0.1)" }} />
                ))}
              </div>
            ) : filteredData.length === 0 ? (
              <div className="flex justify-center mt-16"><AnnounceEmpty /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className={i === 0 && filteredData.length >= 3 ? "lg:col-span-2" : ""}
                  >
                    <AnnouncementPublicCard item={item} theme={item._theme} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  )
}