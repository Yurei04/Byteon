"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import BlogPublicCard from "@/components/blog/blog-public-card"
import BlogEmpty from "@/components/blog/blog-empty"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

export default function BlogPage() {
    const [blogs, setBlogs] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")

    const categories = [
        "all",
        "Technology",
        "Personal Development",
        "Innovation",
        "Education",
        "Health",
        "AI",
        "Science",
    ]

    useEffect(() => {
        async function fetchBlogs() {
            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) console.error("Error:", error)
            else setBlogs(data)
        }

        fetchBlogs()
    }, [])

    const filteredData = blogs.filter((item) => {
        const search = searchTerm.toLowerCase()

        const title = (item.title || "").toLowerCase()
        const desc = (item.des || "").toLowerCase()
        const content = (item.content || "").toLowerCase()
        const organization = (item.organization || "").toLowerCase()
        const hackathon = (item.hackathon || []).join(" ").toLowerCase()

        // --- MULTIPLE THEME SUPPORT ---
        let themeArray = []

        if (Array.isArray(item.theme)) {
            themeArray = item.theme.map((t) => t.toLowerCase())
        } else if (typeof item.theme === "string") {
            themeArray = item.theme
                .split(/[,|]/)          // split by comma OR | bar
                .map((t) => t.trim().toLowerCase())
        }

        const matchesSearch =
            title.includes(search) ||
            desc.includes(search) ||
            content.includes(search) ||
            organization.includes(search) ||
            hackathon.includes(search) ||
            themeArray.some((t) => t.includes(search))

        const matchesFilter =
            filter === "all" || themeArray.includes(filter.toLowerCase())

        return matchesSearch && matchesFilter
    })

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

            {/* SEARCH BAR */}
            <div className="w-full max-w-2xl mt-10 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-300/60" />
                <input
                    type="text"
                    placeholder="Search blog posts..."
                    className="w-full pl-12 p-3 bg-fuchsia-950/20 border border-fuchsia-800/40 
                        text-fuchsia-100 placeholder-fuchsia-300/40 rounded-xl backdrop-blur-md
                        focus:ring-2 focus:ring-fuchsia-500/40 outline-none transition"
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* FILTER CHIPS */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3 mt-6"
            >
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border backdrop-blur-md transition 
                            ${filter === cat
                                ? "bg-fuchsia-600 text-white border-fuchsia-400"
                                : "bg-fuchsia-950/20 text-fuchsia-200 border-fuchsia-800/40 hover:bg-fuchsia-700/40"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </motion.div>

            {/* CONTENT GRID */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center items-center w-full"
            >
                {filteredData.length === 0 ? (
                    <div className="w-full flex justify-center mt-16">
                        <BlogEmpty />
                    </div>
                ) : (
                    <div className="w-[90%] mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredData.map((item) => (
                            <BlogPublicCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}
