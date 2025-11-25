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
        <div className="w-full min-h-screen p-6 flex flex-col items-center justify-center">
            <div className="pointer-events-none fixed inset-0 -z-20">
                <Threads amplitude={2} distance={0.7} enableMouseInteraction={false} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.8,
                    type: "spring",
                    bounce: 0.25,
                    delay: 0.1,
                }}
                viewport={{ once: true, amount: 0.1 }}
                className="w-full max-w-7xl mt-24"
            >
                <div className="text-center mb-4 ">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-300 to-purple-500">
                        Byteon Blog
                    </span>
                    </h1>
        
                    <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
                        Learn stories and new knowledge
                    </p>
                </div>

            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full mt-2 p-2"
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
                    <div className="w-[90%] mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
                        {blogs.map((item) => (
                            <BlogCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </motion.div>


        </div>
    )
}
