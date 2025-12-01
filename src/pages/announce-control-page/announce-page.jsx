"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import AnnouncementCard from "@/components/(dashboard)/announce/announce-card"
import AnnounceEmpty from "@/components/(dashboard)/announce/announce-empty"
import { motion } from "framer-motion"
import { Search } from "lucide-react"
import AnnouncementPublicCard from "@/components/(dashboard)/announce/announce-public-card"

export default function AnnouncePage() {
    const [announcements, setAnnouncements] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")
    const [loading, setLoading] = useState(true)

    const categories = [
        "all",
        "active",
        "upcoming",
        "finished",
    ]

    useEffect(() => {
        async function fetchAnnouncements() {
            setLoading(true)
            const { data, error } = await supabase
                .from("announcements")
                .select("*")
                .order("created_at", { ascending: false })

            if (error) {
                console.error("Error fetching announcements:", error)
            } else {
                setAnnouncements(data || [])
            }
            setLoading(false)
        }

        fetchAnnouncements()
    }, [])

    const getHackathonStatus = (item) => {
        const now = new Date()
        const beginDate = item.date_begin ? new Date(item.date_begin) : null
        const endDate = item.date_end ? new Date(item.date_end) : null

        if (!beginDate || !endDate) return "unknown"

        if (now < beginDate) return "upcoming"
        if (now >= beginDate && now <= endDate) return "active"
        if (now > endDate) return "finished"

        return "unknown"
    }

    const filteredData = announcements.filter((item) => {
        const search = searchTerm.toLowerCase()

        const title = (item.title || "").toLowerCase()
        const des = (item.des || "").toLowerCase()
        const organization = (item.organization || "").toLowerCase()
        const author = (item.author || "").toLowerCase()
        const openTo = (item.open_to || "").toLowerCase()
        const countries = (item.countries || "").toLowerCase()

        const matchesSearch =
            title.includes(search) ||
            des.includes(search) ||
            organization.includes(search) ||
            author.includes(search) ||
            openTo.includes(search) ||
            countries.includes(search)

        const status = getHackathonStatus(item)
        const matchesFilter = filter === "all" || status === filter

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
                        Hackathon Announcements
                    </span>
                </h1>
                <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
                    Discover hackathons and coding competitions from organizations worldwide.
                </p>
            </motion.div>

            {/* SEARCH BAR */}
            <div className="w-full max-w-2xl mt-10 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-300/60" />
                <input
                    type="text"
                    placeholder="Search hackathons..."
                    className="w-full pl-12 p-3 bg-fuchsia-950/20 border border-fuchsia-800/40 
                        text-fuchsia-100 placeholder-fuchsia-300/40 rounded-xl backdrop-blur-md
                        focus:ring-2 focus:ring-fuchsia-500/40 outline-none transition"
                    value={searchTerm}
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
                        className={`px-5 py-2.5 rounded-full text-sm font-medium border backdrop-blur-md transition capitalize
                            ${filter === cat
                                ? "bg-fuchsia-600 text-white border-fuchsia-400 shadow-lg shadow-fuchsia-500/30"
                                : "bg-fuchsia-950/20 text-fuchsia-200 border-fuchsia-800/40 hover:bg-fuchsia-700/40"
                            }`}
                    >
                        {cat === "all" ? "All Hackathons" : cat}
                    </button>
                ))}
            </motion.div>

            {/* STATUS INDICATORS */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2 text-fuchsia-300/60">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span>Active</span>
                </div>
                <div className="flex items-center gap-2 text-fuchsia-300/60">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <span>Upcoming</span>
                </div>
                <div className="flex items-center gap-2 text-fuchsia-300/60">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    <span>Finished</span>
                </div>
            </div>

            {/* CONTENT GRID */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center items-center w-full"
            >
                {loading ? (
                    <div className="w-full flex justify-center mt-16">
                        <div className="text-fuchsia-300 text-lg">Loading hackathons...</div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="w-full flex justify-center mt-16">
                        <AnnounceEmpty />
                    </div>
                ) : (
                    <div className="w-[90%] mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredData.map((item) => (
                            <AnnouncementPublicCard 
                                key={item.id} 
                                item={item}
                            />
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    )
}