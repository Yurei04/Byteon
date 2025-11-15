"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import BlogCard from "@/components/blog/BlogCard"
import BlogForm from "@/components/blog/BlogForm"
import BlogEmpty from "@/components/blog/BlogEmpty"
import { Button } from "@/components/ui/button"

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchBlogs() {
    setLoading(true)
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) console.error(error)
    else setBlogs(data)
    setLoading(false)
  }

  async function deleteBlog(id) {
    const confirmed = confirm("Are you sure you want to delete this blog?")
    if (!confirmed) return
    const { error } = await supabase.from("blogs").delete().eq("id", id)
    if (error) console.error(error)
    else fetchBlogs()
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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button className="bg-fuchsia-600 hover:bg-fuchsia-500" onClick={() => { setSelectedBlog(null); setShowForm(!showForm) }}>
          {showForm ? "Close Form" : "New Blog"}
        </Button>
      </div>

      {showForm && (
        <div className="mb-6">
          <BlogForm
            initial={selectedBlog || {}}
            onSuccess={() => { setShowForm(false); fetchBlogs() }}
          />
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : blogs.length === 0 ? (
        <BlogEmpty onCreate={() => setShowForm(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="relative">
              <BlogCard {...blog} />
              <div className="absolute top-2 right-2 flex gap-1">
                <Button size="xs" className="bg-purple-700 hover:bg-purple-600 text-fuchsia-100" onClick={() => { setSelectedBlog(blog); setShowForm(true) }}>Edit</Button>
                <Button size="xs" className="bg-red-700 hover:bg-red-600 text-fuchsia-100" onClick={() => deleteBlog(blog.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
