"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function BlogForm({ initial = {}, onSuccess = () => {} }) {
  const [title, setTitle] = useState(initial.title || "")
  const [des, setDes] = useState(initial.des || "")
  const [content, setContent] = useState(initial.content || "")
  const [imageFile, setImageFile] = useState(null)
  const [author, setAuthor] = useState(initial.author || "")
  const [hackathon, setHackathon] = useState(initial.hackathon || "")
  const [place, setPlace] = useState(initial.place || "")
  const [theme, setTheme] = useState(initial.theme || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function uploadImage(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const path = `public/blog-images/${fileName}`

    const { data, error: upErr } = await supabase.storage
      .from('blog-images')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (upErr) throw upErr

    const { data: urlData } = supabase.storage.from('blog-images').getPublicUrl(path)
    return urlData.publicUrl
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let imageUrl = initial.image || null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const payload = {
        title,
        des,
        content,
        image: imageUrl,
        author,
        hackathon,
        place,
        theme,
      }

      const { data, error: insertError } = await supabase.from('blogs').insert([payload]).select().single()
      if (insertError) throw insertError

      setTitle('')
      setDes('')
      setContent('')
      setImageFile(null)
      setAuthor('')
      setHackathon('')
      setPlace('')
      setTheme('')

      onSuccess(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to create blog')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-linear-to-b from-purple-950/30 to-fuchsia-950/25 border border-fuchsia-700/20 p-6 rounded-2xl shadow-xl">
      {error && <div className="text-sm text-fuchsia-200 mb-2">{error}</div>}

      <label className="block mb-2 text-fuchsia-300">Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" className="w-full p-2 rounded bg-transparent border border-fuchsia-700/30 text-fuchsia-100 mb-3" />

      <label className="block mb-2 text-fuchsia-300">Short description</label>
      <textarea value={des} onChange={(e) => setDes(e.target.value)} placeholder="A short preview..." className="w-full p-2 rounded bg-transparent border border-fuchsia-700/30 text-fuchsia-100 mb-3" />

      <label className="block mb-2 text-fuchsia-300">Content (Markdown)</label>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Full content..." className="w-full p-2 rounded bg-transparent border border-fuchsia-700/30 text-fuchsia-100 mb-3 h-32" />

      <label className="block mb-2 text-fuchsia-300">Image</label>
      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} className="mb-3 text-fuchsia-200" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block mb-2 text-fuchsia-300">Author</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" className="w-full p-2 rounded bg-transparent border border-fuchsia-700/30 text-fuchsia-100" />
        </div>
        <div>
          <label className="block mb-2 text-fuchsia-300">Theme / Tags</label>
          <input value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="ai, health" className="w-full p-2 rounded bg-transparent border border-fuchsia-700/30 text-fuchsia-100" />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <Button type="submit" className="bg-fuchsia-600 hover:bg-fuchsia-500" disabled={loading}>{loading ? 'Saving...' : 'Save Post'}</Button>
        <Button type="button" variant="outline" onClick={() => {
          setTitle(''); setDes(''); setContent(''); setImageFile(null); setAuthor(''); setHackathon(''); setPlace(''); setTheme('')
        }}>Reset</Button>
      </div>
    </form>
  )
}