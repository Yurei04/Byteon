"use client"

import { useState } from "react"
import BlogCard from "../../components/blog/blogCard"
import BlogSearchBar from "../../components/blog/blog-search"


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
            <BlogSearchBar onSearch={setSearchTerm} onFilterChange={setFilter} />
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-items-center gap-8">
                {filteredData.map((data, idx) => (
                    <BlogCard key={idx} {...data} />
                ))}
            </div>
        </div>
    )
}
