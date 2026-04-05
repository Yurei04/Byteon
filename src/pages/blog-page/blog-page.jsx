"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import BlogPublicCard from "@/components/blog/blog-public-card"
import BlogEmpty from "@/components/blog/blog-empty"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

const CATEGORIES = [
  "all",
  "Technology",
  "Personal Development",
  "Innovation",
  "Education",
  "Health",
  "AI",
  "Science",
]

const USER_PRIMARY   = "#c026d3"
const USER_SECONDARY = "#db2777"

// ── Module-level cache: survives re-renders, built once per page load ─────────
const COLOR_CACHE = new Map()

export default function BlogPage() {
  const [blogs, setBlogs]           = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter]         = useState("all")

  useEffect(() => {
    async function fetchBlogs() {
      // ── 1. Fetch all blogs ──────────────────────────────────────────────
      const { data: blogData, error: blogError } = await supabase
        .from("blogs")
        .select("*")
        .order("created_at", { ascending: false })

      if (blogError) { console.error("Error fetching blogs:", blogError); return }
      if (!blogData?.length) { setBlogs([]); return }

      // ── 2. Collect unique org names ─────────────────────────────────────
      const orgNames = [...new Set(blogData.map((b) => b.organization).filter(Boolean))]

      // ── 3. Only fetch orgs not already in cache ─────────────────────────
      const uncached = orgNames.filter((n) => !COLOR_CACHE.has(n))

      if (uncached.length) {
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("name, primary_color, secondary_color")
          .in("name", uncached)

        if (orgError) {
          console.error("Error fetching org colors:", orgError)
        } else {
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
      }

      // ── 4. Enrich blogs ─────────────────────────────────────────────────
      const enriched = blogData.map((blog) => {
        // Org blog with a cached theme
        if (blog.organization && COLOR_CACHE.has(blog.organization)) {
          return { ...blog, _authorType: "org", _theme: COLOR_CACHE.get(blog.organization) }
        }

        // User blog or org with no color data — use default, cache it once
        if (!COLOR_CACHE.has("user-default")) {
          COLOR_CACHE.set("user-default", buildTheme(USER_PRIMARY, USER_SECONDARY))
        }
        return { ...blog, _authorType: "user", _theme: COLOR_CACHE.get("user-default") }
      })

      setBlogs(enriched)
    }

    fetchBlogs()
  }, [])

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return blogs.filter((item) => {
      const search = searchTerm.toLowerCase()

      const title        = (item.title        || "").toLowerCase()
      const desc         = (item.des          || "").toLowerCase()
      const content      = (item.content      || "").toLowerCase()
      const organization = (item.organization || "").toLowerCase()
      const hackathon    = (item.hackathon    || []).join(" ").toLowerCase()

      let themeArray = []
      if (Array.isArray(item.theme)) {
        themeArray = item.theme.map((t) => t.toLowerCase())
      } else if (typeof item.theme === "string") {
        themeArray = item.theme.split(/[,|]/).map((t) => t.trim().toLowerCase())
      }

      const matchesSearch =
        title.includes(search)        ||
        desc.includes(search)         ||
        content.includes(search)      ||
        organization.includes(search) ||
        hackathon.includes(search)    ||
        themeArray.some((t) => t.includes(search))

      const matchesFilter =
        filter === "all" || themeArray.includes(filter.toLowerCase())

      return matchesSearch && matchesFilter
    })
  }, [blogs, searchTerm, filter])

  return (
    <div className="w-full min-h-screen p-6 flex flex-col items-center">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-7xl mt-20 text-center"
      >
        <h1 className="text-5xl sm:text-6xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
            Byteon Blog
          </span>
        </h1>
        <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
          Learn stories and discover new knowledge.
        </p>
      </motion.div>

      {/* SEARCH */}
      <div className="w-full max-w-2xl mt-10 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-300/60" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Search blog posts…"
          className="w-full pl-12 p-3 bg-fuchsia-950/20 border border-fuchsia-800/40
            text-fuchsia-100 placeholder-fuchsia-300/40 rounded-xl backdrop-blur-md
            focus:ring-2 focus:ring-fuchsia-500/40 outline-none transition"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* FILTERS */}
      <motion.div className="flex flex-wrap justify-center gap-3 mt-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm border transition
              ${filter === cat
                ? "bg-fuchsia-600 text-white border-fuchsia-400"
                : "bg-fuchsia-950/20 text-fuchsia-200 border-fuchsia-800/40 hover:bg-fuchsia-700/40"
              }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* GRID */}
      <div className="w-[90%] mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredData.length === 0 ? (
          <BlogEmpty />
        ) : (
          filteredData.map((item) => (
            <BlogPublicCard key={item.id} item={item} theme={item._theme} />
          ))
        )}
      </div>
    </div>
  )
}