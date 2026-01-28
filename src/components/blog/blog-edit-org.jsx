"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { Loader2, AlertCircle, CheckCircle, Save, X } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area"
import Image from "next/image"

const THEME_OPTIONS = [
  "Technology",
  "Education",
  "Lifestyle",
  "Business",
  "Health & Wellness",
  "Science",
  "Arts & Culture",
  "Travel",
  "Food & Cooking",
  "Sports",
  "Gaming",
  "Finance",
  "Environment",
  "Personal Development",
  "Other"
]

export default function BlogEditOrg({ blog, onUpdate, children }) {
  const [form, setForm] = useState({
    title: blog.title || "",
    des: blog.des || "",
    content: blog.content || "",
    author: blog.author || "",
    theme: blog.theme || "",
    place: blog.place || "",
    hackathon: blog.hackathon || "",
    image: blog.image || "",
  })

  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const [imageError, setImageError] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    if (name === "image") {
      setImageError(false)
    }
  }

  const handleThemeChange = (value) => {
    setForm({ ...form, theme: value })
  }

  const handleSave = async () => {
  // Validation
  if (!form.title.trim() || !form.content.trim()) {
    setAlert({ type: "error", message: "Title and Content are required fields" })
    return
  }

  // Check if blog.id exists
  if (!blog?.id) {
    setAlert({ type: "error", message: "Blog ID is missing. Cannot update." })
    console.error("Blog object:", blog)
    return
  }

  setSaving(true)
  setAlert(null)

  try {
    console.log("Updating blog with ID:", blog.id)
    
    const updateData = {
      title: form.title.trim(),
      des: form.des.trim() || null,
      content: form.content.trim(),
      author: form.author.trim() || null,
      theme: form.theme || null,
      place: form.place.trim() || null,
      hackathon: form.hackathon.trim() || null,
      image: form.image.trim() || null,
    }
    
    console.log("Update data:", updateData)

    const { data, error } = await supabase
      .from("blogs")
      .update(updateData)
      .eq("id", blog.id)
      .select()

    console.log("Supabase response:", { data, error })

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(error.message || error.details || "Failed to update blog")
    }

    if (!data || data.length === 0) {
      throw new Error("No blog was updated. Please check your permissions.")
    }

    setAlert({ type: "success", message: "Blog updated successfully! 🎉" })
    
    // Close dialog after a short delay
    setTimeout(() => {
      setIsOpen(false)
      if (onUpdate) onUpdate()
    }, 1500)

  } catch (error) {
    console.error("Error updating blog:", error)
    setAlert({ 
      type: "error", 
      message: error.message || "Failed to update blog. Check console for details."
    })
  } finally {
    setSaving(false)
  }
}

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="bg-gradient-to-br from-fuchsia-900/30 via-purple-900/30 to-slate-950/30 backdrop-blur-xl border border-fuchsia-500/30 max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-300 mb-2">
          Edit Blog Post
        </DialogTitle>
        <p className="text-fuchsia-200/60 text-sm mb-4">Update your blog information below</p>

        <ScrollArea className="h-[calc(90vh-180px)] pr-4">
          <div className="space-y-5">
            {alert && (
              <Alert className={`${alert.type === 'error' ? 'border-red-500 bg-red-500/10 text-red-100' : 'border-green-500 bg-green-500/10 text-green-100'}`}>
                {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <AlertDescription className="text-sm">{alert.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label className="text-fuchsia-200 font-semibold">Title *</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400 focus:ring-fuchsia-400/20"
                placeholder="Enter blog title..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-fuchsia-200 font-semibold">Short Description</Label>
              <Textarea
                name="des"
                value={form.des}
                onChange={handleChange}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400 focus:ring-fuchsia-400/20 resize-none"
                placeholder="Brief summary of your post..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-fuchsia-200 font-semibold">Content *</Label>
              <Textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400 focus:ring-fuchsia-400/20 resize-none"
                placeholder="Your blog content..."
                rows={10}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-fuchsia-200 font-semibold">Author Name</Label>
                <Input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                  placeholder="Author name..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-fuchsia-200 font-semibold">Location/Place</Label>
                <Input
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                  placeholder="e.g., Online, New York..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-fuchsia-200 font-semibold">Related Hackathon/Event</Label>
              <Input
                name="hackathon"
                value={form.hackathon}
                onChange={handleChange}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                placeholder="Associated event or hackathon..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-fuchsia-200 font-semibold">Theme/Category</Label>
              <Select value={form.theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="bg-white/5 border-fuchsia-500/30 text-white focus:border-fuchsia-400 focus:ring-fuchsia-400/20">
                  <SelectValue placeholder="Select a theme..." />
                </SelectTrigger>
                <SelectContent className="bg-slate-950 border-fuchsia-500/30">
                  {THEME_OPTIONS.map((theme) => (
                    <SelectItem key={theme} value={theme} className="text-white hover:bg-fuchsia-500/20">
                      {theme}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-fuchsia-200 font-semibold">Featured Image URL</Label>
              <Input
                type="url"
                name="image"
                value={form.image}
                onChange={handleChange}
                className="bg-white/5 border-fuchsia-500/30 text-white placeholder:text-fuchsia-200/40 focus:border-fuchsia-400"
                placeholder="https://example.com/image.jpg"
              />
              {form.image && !imageError && (
                <div className="mt-3 rounded-lg overflow-hidden border border-fuchsia-500/30 relative w-full h-48">
                  <Image
                    src={form.image}
                    alt="Blog preview"
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
              {imageError && form.image && (
                <div className="mt-3 p-3 rounded-lg border border-red-500/30 bg-red-500/10">
                  <p className="text-red-200 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Unable to load image. Please check the URL.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-fuchsia-500/20">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-500/20"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              disabled={saving}
              className="border-fuchsia-500/30 text-fuchsia-200 hover:bg-fuchsia-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </ScrollArea>

        
      </DialogContent>
    </Dialog>
  )
}