"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import BlogCard from "../blog/blogCard"
import BlogForm from "../blog/blog-form"
import BlogEmpty from "../blog/blog-empty"
import { Button } from "@/components/ui/button"

export default function UserDashboard({ user }) {
  const [blogs, setBlogs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)

  async function fetchBlogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("author", user.email)
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    else setBlogs(data)
    setLoading(false)
  }

  useEffect(() => {
  async function loadBlogs() {
    await fetchBlogs()
  }
  loadBlogs()
}, [])


  return (
    <div className="w-full p-6 min-h-screen bg-purple-950/20 text-fuchsia-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Blogs</h1>
        <Button className="bg-fuchsia-600 hover:bg-fuchsia-500" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close Form" : "New Blog"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <BlogForm onSuccess={() => { setShowForm(false); fetchBlogs() }} />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : blogs.length === 0 ? (
        <BlogEmpty onCreate={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} {...blog} />
          ))}
        </div>
      )}
    </div>
  )
}
