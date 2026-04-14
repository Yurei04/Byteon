"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import ResourcePublicCard from "@/components/resourceHub/resource-public-card"

const USER_PRIMARY   = "#c026d3"
const USER_SECONDARY = "#db2777"

const COLOR_CACHE = new Map()

const CATEGORIES = [
  { label: "All",          value: "all"               },
  { label: "Web Dev",      value: "Web Development"   },
  { label: "Mobile",       value: "Mobile Development"},
  { label: "AI & ML",      value: "AI & ML"           },
  { label: "Deployment",   value: "Deployment"        },
  { label: "DevOps",       value: "DevOps"            },
  { label: "UI / UX",      value: "UI/UX Design"      },
]

export default function ResourceHubPage() {
  const [resources, setResources]   = useState([])
  const [filter, setFilter]         = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("resource_hub")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) { console.error("Supabase Error:", error); return }
      if (!data?.length) { setResources([]); return }

      const orgNames = [...new Set(data.map((r) => r.organization).filter(Boolean))]
      const uncached = orgNames.filter((n) => !COLOR_CACHE.has(n))

      if (uncached.length) {
        const { data: orgData, error: orgErr } = await supabase
          .from("organizations")
          .select("name, primary_color, secondary_color")
          .in("name", uncached)

        if (orgErr) console.error("Error fetching org colors:", orgErr)
        ;(orgData || []).forEach((org) => {
          COLOR_CACHE.set(org.name, buildTheme(
            org.primary_color   ?? USER_PRIMARY,
            org.secondary_color ?? USER_SECONDARY,
          ))
        })
      }

      if (!COLOR_CACHE.has("user-default")) {
        COLOR_CACHE.set("user-default", buildTheme(USER_PRIMARY, USER_SECONDARY))
      }

      setResources(data.map((item) => ({
        ...item,
        _theme: item.organization && COLOR_CACHE.has(item.organization)
          ? COLOR_CACHE.get(item.organization)
          : COLOR_CACHE.get("user-default"),
      })))
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() =>
    resources.filter((item) => {
      const matchesSearch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filter === "all" || (item.category || "").toLowerCase() === filter.toLowerCase()
      return matchesSearch && matchesFilter
    }),
  [resources, searchTerm, filter])

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
            Resource Hub
          </span>
        </h1>
        <p className="text-fuchsia-300/60 text-sm">
          Find your stack and learn it.
        </p>
      </motion.div>

      {/* Search + filters */}
      <div className="w-full max-w-2xl flex flex-col gap-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fuchsia-400/40" />
          <input
            type="text"
            placeholder="Search resources..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
              bg-white/[0.04] border border-white/[0.08]
              text-fuchsia-100 placeholder-fuchsia-400/30
              focus:outline-none focus:ring-1 focus:ring-fuchsia-500/40
              transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150
                ${filter === cat.value
                  ? "bg-fuchsia-600/80 text-white ring-1 ring-fuchsia-400/40 shadow-sm shadow-fuchsia-700/30"
                  : "bg-white/[0.04] text-fuchsia-300/60 border border-white/[0.07] hover:bg-fuchsia-900/30 hover:text-fuchsia-200"
                }`}
            >
              {cat.label}
            </button>
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
        {filteredData.length === 0 ? (
          <p className="text-center text-fuchsia-300/40 text-sm mt-16">
            Resource Hub is currently empty…
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredData.map((item) => (
              <ResourcePublicCard key={item.id} item={item} theme={item._theme} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}