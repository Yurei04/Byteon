"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { motion } from "framer-motion"
import ResourcePublicCard from "@/components/resourceHub/resource-public-card"

const USER_PRIMARY   = "#c026d3"
const USER_SECONDARY = "#db2777"

// Module-level — survives re-renders
const COLOR_CACHE = new Map()

const CATEGORIES = [
  { label: "All",                value: "all"              },
  { label: "Web Development",    value: "Web Development"  },
  { label: "Mobile Development", value: "Mobile Development"},
  { label: "AI & ML",            value: "AI & ML"          },
  { label: "Deployment",         value: "Deployment"       },
  { label: "DevOps",             value: "DevOps"           },
  { label: "UI / UX",            value: "UI/UX Design"     },
]

export default function ResourceHubPage() {
  const [resources, setResources]   = useState([])
  const [filter, setFilter]         = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    async function fetchData() {
      // ── 1. Fetch all resources ──────────────────────────────────────────
      const { data, error } = await supabase
        .from("resource_hub")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) { console.error("Supabase Error:", error); return }
      if (!data?.length) { setResources([]); return }

      // ── 2. Collect unique org names not yet cached ──────────────────────
      const orgNames = [...new Set(data.map((r) => r.organization).filter(Boolean))]
      const uncached = orgNames.filter((n) => !COLOR_CACHE.has(n))

      if (uncached.length) {
        const { data: orgData, error: orgErr } = await supabase
          .from("organizations")
          .select("name, primary_color, secondary_color")
          .in("name", uncached)

        if (orgErr) console.error("Error fetching org colors:", orgErr)

        ;(orgData || []).forEach((org) => {
          COLOR_CACHE.set(
            org.name,
            buildTheme(
              org.primary_color   ?? USER_PRIMARY,
              org.secondary_color ?? USER_SECONDARY,
            ),
          )
        })
      }

      // ── 3. Ensure user-default is cached ────────────────────────────────
      if (!COLOR_CACHE.has("user-default")) {
        COLOR_CACHE.set("user-default", buildTheme(USER_PRIMARY, USER_SECONDARY))
      }

      // ── 4. Stamp theme onto each resource ───────────────────────────────
      const enriched = data.map((item) => ({
        ...item,
        _theme: item.organization && COLOR_CACHE.has(item.organization)
          ? COLOR_CACHE.get(item.organization)
          : COLOR_CACHE.get("user-default"),
      }))

      setResources(enriched)
    }

    fetchData()
  }, [])

  const filteredData = useMemo(() => {
    return resources.filter((item) => {
      const title    = (item.title    || "").toLowerCase()
      const category = (item.category || "").toLowerCase()
      const matchesSearch = title.includes(searchTerm.toLowerCase())
      const matchesFilter = filter === "all" || category === filter.toLowerCase()
      return matchesSearch && matchesFilter
    })
  }, [resources, searchTerm, filter])

  return (
    <div className="w-full min-h-screen p-6 flex flex-col items-center justify-center">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.25, delay: 0.1 }}
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-7xl mt-24"
      >
        <div className="text-center mb-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
              Resource Hub
            </span>
          </h1>
          <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
            Find your Stack and Learn It.
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="flex flex-col items-center gap-6 mt-4 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Search titles..."
          className="px-4 py-3 rounded-xl w-full text-sm bg-purple-900/50 text-fuchsia-100
            border border-fuchsia-700/40 focus:ring-2 focus:ring-fuchsia-400
            transition-all shadow-[0_0_10px_rgba(255,0,255,0.25)]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="flex flex-wrap gap-3 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
                ${filter === cat.value
                  ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(255,0,255,0.5)] border border-fuchsia-400"
                  : "bg-purple-900/40 text-fuchsia-200 hover:bg-fuchsia-700/40 border border-fuchsia-600/40"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col justify-center items-center w-full"
      >
        {filteredData.length === 0 ? (
          <div className="w-full flex justify-center items-center mt-12">
            <h1 className="text-fuchsia-200 text-lg">Resource Hub Is Currently Empty...</h1>
          </div>
        ) : (
          <div className="w-[90%] mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredData.map((item) => (
              <ResourcePublicCard key={item.id} item={item} theme={item._theme} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}