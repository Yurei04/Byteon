"use client"

import { useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function PendingResourceForm({ onSuccess, currentOrg, authUserId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert]         = useState(null)
  const [formData, setFormData]   = useState({ title: "", des: "", link: "", category: "" })

  // ── Org theme ──────────────────────────────────────────────────────────────
  const t = useMemo(
    () => buildTheme(currentOrg?.primary_color, currentOrg?.secondary_color),
    [currentOrg?.primary_color, currentOrg?.secondary_color],
  )

  const inputStyle = {
    background:   "rgba(255,255,255,0.06)",
    borderColor:  t.primary30,
    color:        "#fff",
  }

  const handleSubmit = async () => {
    if (!currentOrg) {
      setAlert({ type: "error", message: "Organization not found. Please refresh." }); return
    }
    if (!formData.title || !formData.link) {
      setAlert({ type: "error", message: "Title and Link are required." }); return
    }

    setIsLoading(true)
    setAlert(null)

    try {
      const payload = {
        title:           formData.title.trim(),
        des:             formData.des.trim()      || null,
        link:            formData.link.trim(),
        category:        formData.category.trim() || null,
        organization_id: currentOrg.id,
        organization:    currentOrg.name,
        status:          "pending",
        submitted_by:    authUserId,
      }

      const { error } = await supabase.from("pending_resources").insert([payload])
      if (error) throw error

      setAlert({ type: "success", message: "Resource submitted for approval! ✅ The super admin will review it." })
      setFormData({ title: "", des: "", link: "", category: "" })
      setTimeout(() => { if (onSuccess) onSuccess() }, 1000)
    } catch (error) {
      setAlert({ type: "error", message: `Submission failed: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!currentOrg) {
    return (
      <div
        className="rounded-xl backdrop-blur-lg p-12 text-center"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: t.primaryText }} />
        <p style={{ color: t.mutedText }}>Loading organization information...</p>
      </div>
    )
  }

  return (
    <div style={t.cssVars}>
      {/* Pending notice */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-amber-200 text-sm">
          This resource will be <strong>reviewed by the super admin</strong> before going live.
        </p>
      </div>

      {alert && (
        <Alert className={`mb-6 ${alert.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}>
          {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* Submitting as */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: t.badgeBgPrimary, border: t.borderColorLight }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.primaryFull }} />
          <span className="text-white/50 text-sm">Submitting as</span>
          <span className="font-semibold text-sm" style={{ color: t.primaryText }}>{currentOrg.name}</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label className="text-white">Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-white placeholder:text-white/30"
            style={inputStyle}
            placeholder="React Documentation"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-white">Description</Label>
          <Textarea
            value={formData.des}
            onChange={(e) => setFormData({ ...formData, des: e.target.value })}
            className="text-white placeholder:text-white/30"
            style={inputStyle}
            rows={3}
            placeholder="Helpful resource for learning React"
          />
        </div>

        {/* Link */}
        <div className="space-y-2">
          <Label className="text-white">Link *</Label>
          <Input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="text-white placeholder:text-white/30"
            style={inputStyle}
            placeholder="https://react.dev"
          />
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label className="text-white">Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="text-white placeholder:text-white/30"
            style={inputStyle}
            placeholder="Development, Design, Learning"
          />
        </div>

        {/* Submit button — org branded */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full text-white border-0 transition-all duration-300"
          style={{
            background: isLoading ? t.badgeBgPrimary : t.buttonGradient,
            boxShadow:  t.buttonShadow,
            opacity:    isLoading ? 0.7 : 1,
          }}
        >
          {isLoading
            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            : <><Clock className="mr-2 h-4 w-4" />Submit for Approval</>
          }
        </Button>
      </div>
    </div>
  )
}