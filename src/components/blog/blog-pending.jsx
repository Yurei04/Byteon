"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color" 
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2, FileText, Building2, Tag, Camera, Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

const THEME_OPTIONS = [
  "Technology","Education","Lifestyle","Business","Health & Wellness",
  "Science","Arts & Culture","Travel","Food & Cooking","Sports",
  "Gaming","Finance","Environment","Personal Development","Other"
]

export default function PendingBlogOrgForm({ onSuccess, currentOrg, authUserId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert]         = useState(null)
  const [imageError, setImageError] = useState(false)
  const [formData, setFormData]   = useState({
    title: "", des: "", content: "", author: "",
    image: "", hackathon: "", place: "", theme: ""
  })

  // ── Derive theme from org colors ─────────────────────────────────────────
  const theme = buildTheme(currentOrg?.primary_color, currentOrg?.secondary_color)

  const handleSubmit = async () => {
    if (!currentOrg || !authUserId) {
      setAlert({ type: "error", message: "Organization not found. Please refresh." }); return
    }
    if (!formData.title.trim() || !formData.content.trim()) {
      setAlert({ type: "error", message: "Title and Content are required." }); return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const payload = {
        title:           formData.title.trim(),
        des:             formData.des.trim() || null,
        content:         formData.content.trim(),
        author:          formData.author.trim() || currentOrg.name,
        image:           formData.image.trim() || null,
        hackathon:       formData.hackathon.trim() ? [formData.hackathon.trim()] : null,
        place:           formData.place.trim() || null,
        theme:           formData.theme || null,
        organization_id: currentOrg.id,
        organization:    currentOrg.name,
        user_id:         null,
        status:          "pending",
        submitted_by:    authUserId,
      }

      const { error } = await supabase.from("pending_blogs").insert([payload])
      if (error) throw error

      setAlert({ type: "success", message: "Blog submitted for approval! ✅ The super admin will review it." })
      setFormData({ title: "", des: "", content: "", author: "", image: "", hackathon: "", place: "", theme: "" })
      setImageError(false)
      setTimeout(() => { if (onSuccess) onSuccess() }, 1500)
    } catch (error) {
      setAlert({ type: "error", message: `Submission failed: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  if (!currentOrg) {
    return (
      <Card style={{ background: "rgba(2,6,23,0.6)", border: "1px solid rgba(217,70,239,0.3)" }}
        className="backdrop-blur-xl">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.primaryText }} />
          <p style={{ color: theme.mutedText }}>Loading organization information…</p>
        </CardContent>
      </Card>
    )
  }

  // ── Shared input style ───────────────────────────────────────────────────
  const inputStyle = {
    background: theme.inputBg,
    border: theme.borderColor,
    color: "#fff",
  }
  const labelStyle = { color: theme.labelText }

  return (
    <div className="w-full max-w-4xl mx-auto" style={theme.cssVars}>
      <Card
        className="backdrop-blur-xl"
        style={{
          background: theme.cardBg,
          border: theme.borderColor,
          boxShadow: theme.cardShadow,
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <CardHeader
          className="pb-6"
          style={{ borderBottom: theme.borderColorLight }}
        >
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                className="text-3xl font-bold"
                style={{
                  backgroundImage: theme.textGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Create New Blog Post
              </CardTitle>
              <CardDescription className="text-base mt-2" style={{ color: theme.mutedText }}>
                Your post will be reviewed before going live
              </CardDescription>
            </div>

            {/* Org badge */}
            <div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: theme.badgeBgPrimary, border: theme.borderColor }}
            >
              <Building2 className="w-4 h-4" style={{ color: theme.primaryText }} />
              <span className="text-sm font-medium" style={{ color: theme.labelText }}>
                {currentOrg.name}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* ── Pending notice ─────────────────────────────────────────── */}
          <div
            className="flex items-center gap-2 mb-5 p-3 rounded-xl"
            style={{ background: theme.noticeBg, border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-200 text-sm">
              This blog will be <strong>reviewed by the super admin</strong> before going live.
            </p>
          </div>

          {/* ── Alert ──────────────────────────────────────────────────── */}
          {alert && (
            <Alert
              className="mb-6"
              style={
                alert.type === "error"
                  ? { border: "1px solid #ef4444", background: "rgba(239,68,68,0.10)", color: "#fecaca" }
                  : { border: "1px solid #22c55e", background: "rgba(34,197,94,0.10)",  color: "#bbf7d0" }
              }
            >
              {alert.type === "error"
                ? <AlertCircle className="h-5 w-5" />
                : <CheckCircle className="h-5 w-5" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* ── Org banner ───────────────────────────────────────────── */}
            <div
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{ background: theme.sectionBg, border: theme.borderColorLight }}
            >
              <Building2 className="w-5 h-5" style={{ color: theme.secondaryText }} />
              <div>
                <p className="text-sm" style={{ color: theme.mutedText }}>Submitting as</p>
                <p className="font-semibold text-white">{currentOrg.name}</p>
              </div>
            </div>

            {/* ── Title ────────────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2" style={labelStyle}>
                <FileText className="w-5 h-5" />Blog Title *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-12 text-lg placeholder:opacity-40"
                style={inputStyle}
                placeholder="Enter an engaging title…"
              />
            </div>

            {/* ── Description ──────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold" style={labelStyle}>Short Description</Label>
              <Textarea
                value={formData.des}
                onChange={(e) => setFormData({ ...formData, des: e.target.value })}
                className="resize-none placeholder:opacity-40"
                style={inputStyle}
                rows={3}
                placeholder="Brief summary…"
              />
            </div>

            {/* ── Content ──────────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2" style={labelStyle}>
                <FileText className="w-5 h-5" />Blog Content *
              </Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="resize-none placeholder:opacity-40"
                style={inputStyle}
                rows={10}
                placeholder="Write your blog content here…"
              />
            </div>

            {/* ── Author + Place ────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-semibold" style={labelStyle}>Author Name</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="placeholder:opacity-40"
                  style={inputStyle}
                  placeholder={`Defaults to ${currentOrg.name}`}
                />
              </div>
              <div className="space-y-3">
                <Label className="font-semibold" style={labelStyle}>Location / Place</Label>
                <Input
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="placeholder:opacity-40"
                  style={inputStyle}
                  placeholder="e.g., Online, New York…"
                />
              </div>
            </div>

            {/* ── Hackathon ─────────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="font-semibold" style={labelStyle}>Related Hackathon / Event</Label>
              <Input
                value={formData.hackathon}
                onChange={(e) => setFormData({ ...formData, hackathon: e.target.value })}
                className="placeholder:opacity-40"
                style={inputStyle}
                placeholder="Associated event name…"
              />
            </div>

            {/* ── Theme select ──────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2" style={labelStyle}>
                <Tag className="w-4 h-4" />Theme / Category
              </Label>
              <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
                <SelectTrigger style={inputStyle}>
                  <SelectValue placeholder="Select a theme…" />
                </SelectTrigger>
                <SelectContent className="bg-slate-950" style={{ border: theme.borderColor }}>
                  {THEME_OPTIONS.map((t) => (
                    <SelectItem
                      key={t}
                      value={t}
                      className="text-white"
                      style={{ "--hover-bg": theme.badgeBgPrimary }}
                    >
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Image URL ─────────────────────────────────────────────── */}
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2" style={labelStyle}>
                <Camera className="w-4 h-4" />Featured Image URL
              </Label>
              <Input
                type="url"
                value={formData.image}
                onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setImageError(false) }}
                className="placeholder:opacity-40"
                style={inputStyle}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && !imageError && (
                <div
                  className="mt-4 rounded-lg overflow-hidden relative w-full h-48"
                  style={{ border: theme.borderColor }}
                >
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
            </div>

            {/* ── Submit button ─────────────────────────────────────────── */}
            <div className="pt-6" style={{ borderTop: theme.borderColorLight }}>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                style={{
                  background: theme.buttonGradient,
                  boxShadow: theme.buttonShadow,
                  border: "none",
                }}
              >
                {isLoading ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting…</>
                ) : (
                  <><Clock className="mr-2 h-5 w-5" />Submit for Approval</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}