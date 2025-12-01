"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

export default function BlogEditUser({ blog, onUpdate, children }) {
  const [form, setForm] = useState({
    title: blog.title || "",
    des: blog.des || "",
    content: blog.content || "",
    theme: blog.theme || "",
    place: blog.place || "",
  })

  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("blogs")
      .update({
        title: form.title,
        des: form.des,
        content: form.content,
        theme: form.theme,
        place: form.place,
      })
      .eq("id", blog.id)

    setSaving(false)

    if (error) {
      console.error(error)
      return
    }

    if (onUpdate) onUpdate()
    document.querySelector("button[aria-label='Close']").click() // closes dialog
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-fuchsia-900 border-fuchsia-500/30">
        <DialogTitle className="text-fuchsia-200 mb-4">
          Edit Blog – {blog.title}
        </DialogTitle>

        <div className="space-y-3">

          <div>
            <label className="text-fuchsia-300 text-sm">Title</label>
            <Input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30"
            />
          </div>

          <div>
            <label className="text-fuchsia-300 text-sm">Short Description</label>
            <Input
              name="des"
              value={form.des}
              onChange={handleChange}
              className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30"
            />
          </div>

          <div>
            <label className="text-fuchsia-300 text-sm">Content</label>
            <Textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={5}
              className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30"
            />
          </div>

          <div>
            <label className="text-fuchsia-300 text-sm">Theme</label>
            <Input
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30"
            />
          </div>

          <div>
            <label className="text-fuchsia-300 text-sm">Place</label>
            <Input
              name="place"
              value={form.place}
              onChange={handleChange}
              className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30"
            />
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2 cursor-pointer" /> Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  )
}
