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

/* ─── Status Config ─── */
const STATUS_META = [
  {
    value: "active",
    label: "Active",
    icon: Radio,
    dot: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.28)",
    pulse: true,
  },
  {
    value: "upcoming",
    label: "Upcoming",
    icon: Clock,
    dot: "#ec4899",
    bg: "rgba(236,72,153,0.12)",
    border: "rgba(236,72,153,0.28)",
    pulse: false,
  },
  {
    value: "finished",
    label: "Finished",
    icon: CheckCircle2,
    dot: "#71717a",
    bg: "rgba(113,113,122,0.10)",
    border: "rgba(113,113,122,0.25)",
    pulse: false,
  },
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
    <div
      className="w-full rounded-2xl flex items-center justify-center"
      style={{
        background: "rgb(var(--surface-raised))",
        border: "1px solid rgb(var(--surface-border) / 0.15)",
        minHeight: 260,
      }}
    >
      <p className="text-sm" style={{ color: "rgb(var(--text-faint))" }}>
        No active events right now
      </p>
    </div>
  )

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-150 hover:scale-[1.01]"
      style={{
        background: "rgb(var(--surface-raised))",
        border: "1px solid rgb(var(--surface-border) / 0.3)",
        minHeight: 260,
      }}
    >
      {/* Live badge */}
      <div
        className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
        style={{
          background: "rgba(34,197,94,0.1)",
          border: "1px solid rgba(34,197,94,0.25)",
          color: "#16a34a",
        }}
      >
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-60" />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5 bg-green-500" />
        </span>
        Live
      </div>

      <div className="p-6 flex flex-col gap-3 h-full">
        {item.organization && (
          <p
            className="text-[11px] font-bold uppercase tracking-widest"
            style={{ color: "rgb(var(--text-muted))" }}
          >
            {item.organization}
          </p>
        )}
        <h2
          className="text-xl font-black leading-snug"
          style={{ color: "rgb(var(--text-primary))" }}
        >
          {item.title || "Untitled Event"}
        </h2>
        {item.des && (
          <p
            className="text-sm leading-relaxed line-clamp-3"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            {item.des}
          </p>
        )}
        <div
          className="mt-auto flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.2)" }}
        >
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "rgb(var(--text-faint))" }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>{formatDate(item.date_begin)} – {formatDate(item.date_end)}</span>
          </div>
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: "rgb(var(--brand-500))" }}
          >
            View <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ icon: Icon, label, count, dot, bg, border, pulse }) {
  return (
    <div
      className="
        flex items-center gap-2.5 px-4 py-2.5 rounded-xl
        backdrop-blur-sm
      "
      style={{
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      <div className="relative flex items-center justify-center">
        {pulse && (
          <span
            className="absolute inline-flex w-4 h-4 rounded-full animate-ping opacity-25"
            style={{ backgroundColor: dot }}
          />
        )}

        <Icon
          className="w-3.5 h-3.5 relative"
          style={{ color: dot }}
        />
      </div>

      <div>
        <p
          className="text-base font-black leading-none"
          style={{ color: dot }}
        >
          {count}
        </p>

        <p className="text-[10px] uppercase tracking-wider mt-0.5 text-muted-foreground">
          {label}
        </p>
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
      .from("announcements")
      .select("*")
      .neq("status", "suspended")
      .or("date_end.is.null,date_end.gt." + new Date().toISOString())
      .order("created_at", { ascending: false })
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

  const featuredItem = useMemo(() =>
    announcements.find(a => getStatus(a) === "active") || null, [announcements])

  const counts = useMemo(() =>
    STATUS_META.reduce((acc, { value }) => ({
      ...acc,
      [value]: announcements.filter(a => getStatus(a) === value).length,
    }), {}), [announcements])

  return (
    <div
      className="w-full min-h-screen"
      style={{ background: "rgb(var(--bg-base))" }}
    >
      {/* Dot grid overlay — adapts per theme */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(var(--surface-border) / 0.35) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center">

        {/* ══════════════════════════════
            TOP NAV / WORDMARK
        ══════════════════════════════ */}
        <div className="w-full max-w-7xl px-4 sm:px-8 pt-8 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="text-lg font-black tracking-tighter"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              byte<span style={{ color: "rgb(var(--brand-500))" }}>on</span>
            </span>
            <span
              className="text-xs mx-1"
              style={{ color: "rgb(var(--surface-border) / 0.6)" }}
            >
              /
            </span>
            <span className="text-xs font-medium" style={{ color: "rgb(var(--text-faint))" }}>
              Events
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              background: "rgb(var(--brand-500) / 0.1)",
              border: "1px solid rgb(var(--brand-500) / 0.2)",
              color: "rgb(var(--brand-500))",
            }}
          >
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
              <h1
                className="font-black leading-[0.93] tracking-tight mb-5"
                style={{ fontSize: "clamp(2.8rem, 5.5vw, 5rem)" }}
              >
                <span className="block" style={{ color: "rgb(var(--text-primary))" }}>Find Your</span>
                <span className="block" style={{ color: "rgb(var(--text-primary))" }}>Next Big</span>
                <span
                  className="block"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgb(var(--accent-500)) 0%, rgb(var(--brand-600)) 55%, rgb(var(--brand-400)) 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Hackathon.
                </span>
              </h1>

              <p
                className="text-sm leading-relaxed mb-8 max-w-sm"
                style={{ color: "rgb(var(--text-secondary))" }}
              >
                Competitions and events posted by organizations on byteon — one hub, every opportunity.
              </p>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                {STATUS_META.map(({ value, label, icon, dot, bg, border, pulse }) => (
                  <StatPill
                    key={value}
                    icon={icon}
                    label={label}
                    count={loading ? "–" : counts[value] ?? 0}
                    dot={dot}
                    bg={bg}
                    border={border}
                    pulse={pulse}
                  />
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
                <span
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  Spotlight
                </span>
                <div
                  className="flex-1 h-px"
                  style={{ background: "rgb(var(--surface-border) / 0.25)" }}
                />
              </div>
              {loading ? (
                <div
                  className="w-full rounded-2xl h-64 animate-pulse"
                  style={{
                    background: "rgb(var(--surface-raised))",
                    border: "1px solid rgb(var(--surface-border) / 0.15)",
                  }}
                />
              ) : (
                <FeaturedCard item={featuredItem} />
              )}
            </motion.div>
          </div>
        </section>

        {/* Thin divider */}
        <div className="w-full max-w-7xl px-4 sm:px-8 mb-10">
          <div
            className="w-full h-px"
            style={{ background: "rgb(var(--surface-border) / 0.2)" }}
          />
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
              <h2
                className="text-base font-black tracking-tight"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                All Events
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                {loading ? "Loading…" : `${filteredData.length} event${filteredData.length !== 1 ? "s" : ""} found`}
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                style={{ color: "rgb(var(--text-faint))" }}
              />
              <input
                type="text"
                placeholder="Search events…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                style={{
                  background: "rgb(var(--surface-raised))",
                  border: "1px solid rgb(var(--surface-border) / 0.3)",
                  color: "rgb(var(--text-primary))",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgb(var(--brand-500) / 0.5)"
                  e.target.style.boxShadow = "0 0 0 3px rgb(var(--brand-500) / 0.08)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgb(var(--surface-border) / 0.3)"
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
            style={{
              background: "rgb(var(--surface-raised))",
              border: "1px solid rgb(var(--surface-border) / 0.2)",
            }}
          >
            {[{ value: "all", label: "All", dot: null }, ...STATUS_META].map(({ value, label, dot }) => {
              const active = filter === value
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={
                    active
                      ? {
                          background: `linear-gradient(135deg, rgb(var(--accent-500)), rgb(var(--brand-500)))`,
                          color: "rgb(var(--fg-on-brand, 255 255 255))",
                        }
                      : {
                          color: "rgb(var(--text-faint))",
                          background: "transparent",
                        }
                  }
                >
                  {dot && (
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot }} />
                  )}
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
              <div className="flex justify-center mt-16">
                <AnnounceEmpty />
              </div>
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