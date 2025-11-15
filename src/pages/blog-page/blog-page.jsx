"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import BlogCard from "../../components/blog/blogCard"
import BlogSearchBar from "../../components/blog/blog-search"
import Threads from "@/components/Threads"
import { motion } from "framer-motion"
import BlogEmpty from "@/components/blog/blog-empty"

export default function BlogPage() {
    const [blogs, setBlogs] = useState([])
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState("all")

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
        const title = (item.title || "").toLowerCase()
        const theme = (item.theme || "").toLowerCase()
        const matchesSearch = title.includes(searchTerm.toLowerCase())
        const matchesFilter = filter === "all" || theme === filter.toLowerCase()
        return matchesSearch && matchesFilter
    })

    return (
        <div className="w-full min-h-screen p-6">
            <div className="pointer-events-none fixed inset-0 -z-20">
                <Threads amplitude={2} distance={0.7} enableMouseInteraction={false} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="mt-18"
            >
                <BlogSearchBar onSearch={setSearchTerm} onFilterChange={setFilter} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex flex-col justify-center items-center w-full"
            >
                {filteredData.length === 0 ? (
                    <div className="w-full flex justify-center items-center mt-12">
                    <BlogEmpty />
                    </div>
                ) : (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                    {filteredData.map((data) => (
                        <div key={data.id} className="flex justify-center">
                        <BlogCard {...data} />
                        </div>
                    ))}
                    </div>
                )}
            </motion.div>


        </div>
    )
}
