"use client"

import { useState } from "react"
import BlogCard from "../../components/blog/blogCard"
import BlogSearchBar from "../../components/blog/blog-search"
import Threads from "@/components/Threads"
import { motion } from "framer-motion";

/* DELETE AFTER CONNECT TO THE BACKEND*/
const fakeData = [
    {
        title: "Example Blog 1",
        image: "/placeholder.jpg",
        des: "Lorem ipsum dolor sit amet",
        author: "John Doe",
        hackathon: "HackFest",
        place: "Baguio City",
        theme: "health",
    },
    {
        title: "Example Blog 2",
        image: "/placeholder.jpg",
        des: "AI for Good Project",
        author: "Jane Doe",
        hackathon: "Byteon",
        place: "Manila",
        theme: "ai",
    },
    {
        title: "Example Blog 2",
        image: "/placeholder.jpg",
        des: "AI for Good Project",
        author: "Jane Doe",
        hackathon: "Byteon",
        place: "Manila",
        theme: "ai",
    },
]

export default function BlogPage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")

    const filteredData = fakeData.filter((item) => {
        const title = String(item.title || "").toLowerCase()
        const theme = String(item.theme || "").toLowerCase()

        const matchesSearch = title.includes(searchTerm.toLowerCase())
        const matchesFilter = filter === "all" || theme === filter.toLowerCase()

        return matchesSearch && matchesFilter
    })

    return (
        <div className="w-full min-h-screen p-6">
            <div className="pointer-events-none fixed inset-0 -z-20">
                <Threads
                amplitude={2}
                distance={0.7}
                enableMouseInteraction={false}
                />
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <BlogSearchBar onSearch={setSearchTerm} onFilterChange={setFilter} />
            </motion.div>

            

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center">
                    {filteredData.map((data, idx) => (
                        <BlogCard key={idx} {...data} />
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
