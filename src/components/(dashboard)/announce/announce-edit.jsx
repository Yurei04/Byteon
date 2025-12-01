"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { Loader2 } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function AnnouncementEdit({ announcement, onUpdate, children }) {
  const [form, setForm] = useState({
    title: announcement.title || "",
    des: announcement.des || "",
    author: announcement.author || "",
    date_begin: announcement.date_begin || "",
    date_end: announcement.date_end || "",
    open_to: announcement.open_to || "",
    countries: announcement.countries || "",
    prizes: announcement.prizes || "",
    website_link: announcement.website_link || "",
    dev_link: announcement.dev_link || "",
  })

  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    setSaving(true)

    const { error } = await supabase
      .from("announcements")
      .update({
        title: form.title,
        des: form.des,
        author: form.author,
        date_begin: form.date_begin,
        date_end: form.date_end,
        open_to: form.open_to,
        countries: form.countries,
        prizes: form.prizes ? parseInt(form.prizes) : null,
        website_link: form.website_link,
        dev_link: form.dev_link,
      })
      .eq("id", announcement.id)

    setSaving(false)

    if (error) {
      console.error(error)
      return
    }

    if (onUpdate) onUpdate()
    document.querySelector("button[aria-label='Close']")?.click()
  }

  return (
    <Dialog className="overflow-hidden">
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="bg-gradient-to-br from-slate-900 via-purple-900 to-fuchsia-900 border-fuchsia-500/30 max-w-2xl max-h-[90vh]">
        <DialogTitle className="text-fuchsia-200 mb-4">
          Edit Announcement – {announcement.title}
        </DialogTitle>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <div className="space-y-4">
            <div>
              <Label className="text-fuchsia-300 text-sm">Title *</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                placeholder="AI Hackathon 2025"
              />
            </div>

            <div>
              <Label className="text-fuchsia-300 text-sm">Description *</Label>
              <Textarea
                name="des"
                value={form.des}
                onChange={handleChange}
                className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1 resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Author *</Label>
                <Input
                  name="author"
                  value={form.author}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">Prizes (USD)</Label>
                <Input
                  name="prizes"
                  type="number"
                  value={form.prizes}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Start Date *</Label>
                <Input
                  name="date_begin"
                  type="datetime-local"
                  value={form.date_begin}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">End Date *</Label>
                <Input
                  name="date_end"
                  type="datetime-local"
                  value={form.date_end}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Open To</Label>
                <Input
                  name="open_to"
                  value={form.open_to}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                  placeholder="Students, Professionals, Everyone"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">Countries</Label>
                <Input
                  name="countries"
                  value={form.countries}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                  placeholder="Global, USA, Canada"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-fuchsia-300 text-sm">Website Link</Label>
                <Input
                  name="website_link"
                  type="url"
                  value={form.website_link}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>

              <div>
                <Label className="text-fuchsia-300 text-sm">DevPost Link</Label>
                <Input
                  name="dev_link"
                  type="url"
                  value={form.dev_link}
                  onChange={handleChange}
                  className="bg-black/30 text-fuchsia-200 border-fuchsia-500/30 mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}