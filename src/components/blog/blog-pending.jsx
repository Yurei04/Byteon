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

const LIMITS = {
  title:   80,
  des:     1000,
  author:  60,
  content: 2000,
  theme:   200,
}

// uiT is the UI theme token object passed down from the parent dashboard.
// It is optional — the component falls back to the org's buildTheme styles when absent.
export default function PendingBlogOrgForm({ onSuccess, currentOrg, authUserId, addToast, uiT }) {
  const [isLoading, setIsLoading]   = useState(false)
  const [alert, setAlert]           = useState(null)
  const [imageError, setImageError] = useState(false)
  const [formData, setFormData]     = useState({
    title: "", des: "", content: "", author: "",
    image: "", hackathon: "", place: "", theme: ""
  })

  // Derive org brand theme (for gradients, primary color accents, button styles)
  const theme = buildTheme(currentOrg?.primary_color, currentOrg?.secondary_color)

  const handleSubmit = async () => {
    if (!currentOrg || !authUserId) {
      setAlert({ type: "error", message: "Organization not found. Please refresh." }); return
    }
    if (!formData.title || !formData.content) {
      addToast("error", "Please add a Title and Content"); return
    }
    if (!formData.author) {
      addToast("error", "Please add an author"); return
    }
    if (!formData.theme) {
      addToast("error", "Please add a theme"); return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const payload = {
        title:           formData.title.trim(),
        des:             formData.des.trim()       || null,
        content:         formData.content.trim(),
        author:          formData.author.trim()    || currentOrg.name,
        image:           formData.image.trim()     || null,
        hackathon:       formData.hackathon.trim() ? [formData.hackathon.trim()] : null,
        place:           formData.place.trim()     || null,
        theme:           formData.theme            || null,
        organization_id: currentOrg.id,
        organization:    currentOrg.name,
        user_id:         null,
        status:          "pending",
        submitted_by:    authUserId,
      }

      const { error } = await supabase.from("pending_blogs").insert([payload])
      if (error) throw error

      addToast("success", "Submitted for approval! The super admin will review your blog.")
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
      <div
        className="rounded-xl p-12 text-center"
        style={{
          background: uiT?.surfaceBg2 ?? "rgba(2,6,23,0.6)",
          border: `1px solid ${uiT?.borderSubtle ?? "rgba(217,70,239,0.3)"}`,
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: theme.primaryText }} />
        <p style={{ color: uiT?.mutedText ?? theme.mutedText }}>Loading organization information…</p>
      </div>
    )
  }

  // ── Shared input style — uses uiT when available, else org theme ─────────
  const inputStyle = {
    background:  uiT?.inputBg     ?? theme.inputBg,
    borderColor: uiT?.borderSubtle ?? theme.borderColor,
    color:       uiT?.headingText  ?? "#fff",
  }
  const labelColor  = uiT?.mutedText  ?? theme.labelText
  const headingColor = uiT?.headingText ?? "#ffffff"

  return (
    <div className="w-full max-w-4xl mx-auto" style={theme.cssVars}>
      <Card
        style={{
          background: uiT?.cardBg   ?? theme.cardBg,
          border:     `1px solid ${uiT?.borderSubtle ?? theme.borderColor}`,
          boxShadow:  theme.cardShadow,
        }}
      >
        {/* ── Header ── */}
        <CardHeader
          className="pb-6"
          style={{ borderBottom: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.08)"}` }}
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
              <CardDescription className="text-base mt-2" style={{ color: uiT?.mutedText ?? theme.mutedText }}>
                Your post will be reviewed before going live
              </CardDescription>
            </div>

            {/* Org badge */}
            <div
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background:  uiT?.surfaceBg2 ?? theme.badgeBgPrimary,
                border:      `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.1)"}`,
              }}
            >
              <Building2 className="w-4 h-4" style={{ color: theme.primaryText }} />
              <span className="text-sm font-medium" style={{ color: labelColor }}>
                {currentOrg.name}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* ── Pending notice ── */}
          <div
            className="flex items-center gap-2 mb-5 p-3 rounded-xl"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)" }}
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-amber-200 text-sm">
              This blog will be <strong>reviewed by the super admin</strong> before going live.
            </p>
          </div>

          {/* ── Alert ── */}
          {alert && (
            <Alert
              className="mb-6"
              style={
                alert.type === "error"
                  ? { border: "1px solid #ef4444", background: "rgba(239,68,68,0.10)", color: "#fecaca" }
                  : { border: "1px solid #22c55e", background: "rgba(34,197,94,0.10)",  color: "#bbf7d0" }
              }
            >
              {alert.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* ── Org banner ── */}
            <div
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{
                background: uiT?.surfaceBg ?? theme.sectionBg,
                border:     `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.08)"}`,
              }}
            >
              <Building2 className="w-5 h-5" style={{ color: theme.secondaryText }} />
              <div>
                <p className="text-sm" style={{ color: uiT?.mutedText ?? theme.mutedText }}>Submitting as</p>
                <p className="font-semibold" style={{ color: headingColor }}>{currentOrg.name}</p>
              </div>
            </div>

            {/* ── Title ── */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2" style={{ color: labelColor }}>
                <FileText className="w-5 h-5" />Blog Title *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, LIMITS.title) })}
                className="h-12 text-lg placeholder:opacity-40"
                style={inputStyle}
                maxLength={LIMITS.title}
                placeholder="Enter an engaging title…"
              />
            </div>

            {/* ── Description ── */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold" style={{ color: labelColor }}>Short Description</Label>
              <Textarea
                value={formData.des}
                onChange={(e) => setFormData({ ...formData, des: e.target.value.slice(0, LIMITS.des) })}
                className="resize-none placeholder:opacity-40"
                style={inputStyle}
                rows={3}
                maxLength={LIMITS.des}
                placeholder="Brief summary…"
              />
            </div>

            {/* ── Content ── */}
            <div className="space-y-3">
              <Label className="text-lg font-semibold flex items-center gap-2" style={{ color: labelColor }}>
                <FileText className="w-5 h-5" />Blog Content *
              </Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value.slice(0, LIMITS.content) })}
                className="resize-none placeholder:opacity-40"
                style={inputStyle}
                rows={10}
                maxLength={LIMITS.content}
                placeholder="Write your blog content here…"
              />
            </div>

            {/* ── Author + Place ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="font-semibold" style={{ color: labelColor }}>Author Name</Label>
                <Input
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value.slice(0, LIMITS.author) })}
                  className="placeholder:opacity-40"
                  style={inputStyle}
                  maxLength={LIMITS.author}
                  placeholder={`Defaults to ${currentOrg.name}`}
                />
              </div>
              <div className="space-y-3">
                <Label className="font-semibold" style={{ color: labelColor }}>Location / Place</Label>
                <Input
                  value={formData.place}
                  onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                  className="placeholder:opacity-40"
                  style={inputStyle}
                  placeholder="e.g., Online, New York…"
                />
              </div>
            </div>

            {/* ── Hackathon ── */}
            <div className="space-y-3">
              <Label className="font-semibold" style={{ color: labelColor }}>Related Hackathon / Event</Label>
              <Input
                value={formData.hackathon}
                onChange={(e) => setFormData({ ...formData, hackathon: e.target.value })}
                className="placeholder:opacity-40"
                style={inputStyle}
                placeholder="Associated event name…"
              />
            </div>

            {/* ── Theme select ── */}
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2" style={{ color: labelColor }}>
                <Tag className="w-4 h-4" />Theme / Category *
              </Label>
              <Select value={formData.theme} onValueChange={(v) => setFormData({ ...formData, theme: v })}>
                <SelectTrigger style={inputStyle}>
                  <SelectValue placeholder="Select a theme…" />
                </SelectTrigger>
                <SelectContent
                  style={{
                    background: uiT?.cardBg ?? "rgb(2,6,23)",
                    border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {THEME_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt} value={opt}
                      style={{ color: uiT?.headingText ?? "#ffffff" }}
                    >
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Image URL ── */}
            <div className="space-y-3">
              <Label className="font-semibold flex items-center gap-2" style={{ color: labelColor }}>
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
                  style={{ border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.1)"}` }}
                >
                  <Image
                    src={formData.image} alt="Preview" fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                </div>
              )}
            </div>

            {/* ── Submit ── */}
            <div className="pt-6" style={{ borderTop: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.08)"}` }}>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-14 text-lg font-semibold text-white transition-opacity duration-200 hover:opacity-90"
                style={{
                  background:  theme.buttonGradient,
                  boxShadow:   theme.buttonShadow,
                  border:      "none",
                  opacity:     isLoading ? 0.7 : 1,
                }}
              >
                {isLoading
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Submitting…</>
                  : <><Clock  className="mr-2 h-5 w-5" />Submit for Approval</>
                }
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}