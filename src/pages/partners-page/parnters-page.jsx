"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import AnnounceEmpty from "@/components/(dashboard)/announce/announce-empty"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import AnnouncementPublicCard from "@/components/(dashboard)/announce/announce-public-card"

const COLOR_CACHE      = new Map()
const DEFAULT_PRIMARY   = "#c026d3"
const DEFAULT_SECONDARY = "#db2777"

const STATUS_META = [
  { value: "active",   label: "Active",   dot: "bg-green-400"  },
  { value: "upcoming", label: "Upcoming", dot: "bg-blue-400"   },
  { value: "finished", label: "Finished", dot: "bg-zinc-500"   },
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
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) { console.error(error); setLoading(false); return }
      if (!data?.length) { setAnnouncements([]); setLoading(false); return }

      const orgNames = [...new Set(data.map((a) => a.organization).filter(Boolean))]
      const uncached = orgNames.filter((n) => !COLOR_CACHE.has(n))

      if (uncached.length) {
        const { data: orgData, error: orgErr } = await supabase
          .from("organizations")
          .select("name, primary_color, secondary_color")
          .in("name", uncached)

        if (orgErr) console.error(orgErr)
        ;(orgData || []).forEach((org) => {
          COLOR_CACHE.set(org.name, buildTheme(
            org.primary_color   ?? DEFAULT_PRIMARY,
            org.secondary_color ?? DEFAULT_SECONDARY,
          ))
        })
      }

      setAnnouncements(data.map((item) => ({
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
    announcements.filter((item) => {
      const s = searchTerm.toLowerCase()
      const matchesSearch =
        (item.title        || "").toLowerCase().includes(s) ||
        (item.des          || "").toLowerCase().includes(s) ||
        (item.organization || "").toLowerCase().includes(s) ||
        (item.author       || "").toLowerCase().includes(s) ||
        (item.open_to      || "").toLowerCase().includes(s)
      const matchesFilter = filter === "all" || getStatus(item) === filter
      return matchesSearch && matchesFilter
    }),
  [announcements, searchTerm, filter])

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 py-8 flex flex-col items-center">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-5xl mb-8 text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-pink-400">
            Hackathon Announcements
          </span>
        </h1>
        <p className="text-fuchsia-300/60 text-sm">
          Discover competitions from organizations worldwide.
        </p>
      </motion.div>

      {/* Search */}
      <div className="w-full max-w-2xl mb-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400/40" />
          <input
            type="text"
            placeholder="Search hackathons…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
              bg-white/[0.04] border border-white/[0.08]
              text-fuchsia-100 placeholder-fuchsia-400/30
              focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40
              transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter chips + legend */}
      <div className="flex flex-col items-center gap-3 mb-8 w-full max-w-2xl">
        <div className="flex flex-wrap justify-center gap-2">
          {[{ value: "all", label: "All" }, ...STATUS_META].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium capitalize
                transition-all duration-150
                ${filter === value
                  ? "bg-fuchsia-600/80 text-white ring-1 ring-fuchsia-400/40 shadow-sm shadow-fuchsia-700/30"
                  : "bg-white/[0.04] text-fuchsia-300/60 border border-white/[0.07] hover:bg-fuchsia-900/30 hover:text-fuchsia-200"
                }`}
            >
              {label === "All" ? "All Hackathons" : label}
            </button>
          ))}
        </div>

        {/* Status legend */}
        <div className="flex gap-5">
          {STATUS_META.map(({ dot, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-fuchsia-300/40 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        key={filter + searchTerm}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl"
      >
        {loading ? (
          <p className="text-center text-fuchsia-300/40 text-sm mt-16">Loading hackathons…</p>
        ) : filteredData.length === 0 ? (
          <div className="flex justify-center mt-16"><AnnounceEmpty /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredData.map((item) => (
              <AnnouncementPublicCard key={item.id} item={item} theme={item._theme} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}