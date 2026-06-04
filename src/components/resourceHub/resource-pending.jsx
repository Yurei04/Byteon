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

const LIMITS = {
  title:   80,
  des:     1000,
  author:  60,
  content: 2000,
  theme:   200,
}

// uiT is the UI theme token object passed down from the parent dashboard.
// It is optional — the component falls back to the org's buildTheme styles when absent.
export default function PendingResourceForm({ onSuccess, currentOrg, authUserId, addToast, uiT }) {
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert]         = useState(null)
  const [formData, setFormData]   = useState({ title: "", des: "", link: "", category: "" })

  // Derive org brand theme (for primary color, button gradients, etc.)
  const t = useMemo(
    () => buildTheme(currentOrg?.primary_color, currentOrg?.secondary_color),
    [currentOrg?.primary_color, currentOrg?.secondary_color],
  )

  // ── Shared input style — adapts to uiT when provided ─────────────────────
  const inputStyle = {
    background:  uiT?.inputBg     ?? "rgba(255,255,255,0.06)",
    borderColor: uiT?.borderSubtle ?? t.primary30,
    color:       uiT?.headingText  ?? "#fff",
  }

  const labelColor   = uiT?.mutedText  ?? "#ffffff"
  const headingColor = uiT?.headingText ?? "#ffffff"

  const handleSubmit = async () => {
    if (!currentOrg) {
      setAlert({ type: "error", message: "Organization not found. Please refresh." }); return
    }
    if (!formData.title || !formData.link) {
      addToast("error", "Please add a Title and link"); return
    }
    if (!formData.des) {
      addToast("error", "Please add a description"); return
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

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!currentOrg) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{
          background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.06)",
          border:     `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`,
        }}
      >
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: t.primaryText }} />
        <p style={{ color: uiT?.mutedText ?? t.mutedText }}>Loading organization information...</p>
      </div>
    )
  }

  return (
    <div style={t.cssVars}>

      {/* ── Pending notice ── */}
      <div
        className="flex items-center gap-2 mb-5 p-3 rounded-xl"
        style={{ background: "rgba(245,158,11,0.10)", border: "1px solid rgba(245,158,11,0.20)" }}
      >
        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-amber-200 text-sm">
          This resource will be <strong>reviewed by the super admin</strong> before going live.
        </p>
      </div>

      {/* ── Alert ── */}
      {alert && (
        <Alert
          className={`mb-6 ${alert.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}
        >
          {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription style={{ color: alert.type === "error" ? "#fecaca" : "#bbf7d0" }}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">

        {/* ── Submitting as ── */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{
            background: uiT?.surfaceBg2 ?? t.badgeBgPrimary,
            border:     `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.1)"}`,
          }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.primaryFull }} />
          <span className="text-sm" style={{ color: uiT?.mutedText ?? "rgba(255,255,255,0.5)" }}>Submitting as</span>
          <span className="font-semibold text-sm" style={{ color: t.primaryText }}>{currentOrg.name}</span>
        </div>

        {/* ── Title ── */}
        <div className="space-y-2">
          <Label style={{ color: labelColor }}>Title *</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value.slice(0, LIMITS.title) })}
            className="placeholder:opacity-30"
            style={inputStyle}
            maxLength={LIMITS.title}
            placeholder="React Documentation"
          />
        </div>

        {/* ── Description ── */}
        <div className="space-y-2">
          <Label style={{ color: labelColor }}>Description *</Label>
          <Textarea
            value={formData.des}
            onChange={(e) => setFormData({ ...formData, des: e.target.value.slice(0, LIMITS.des) })}
            className="placeholder:opacity-30"
            style={inputStyle}
            rows={3}
            maxLength={LIMITS.des}
            placeholder="Helpful resource for learning React"
          />
        </div>

        {/* ── Link ── */}
        <div className="space-y-2">
          <Label style={{ color: labelColor }}>Link *</Label>
          <Input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="placeholder:opacity-30"
            style={inputStyle}
            placeholder="https://react.dev"
          />
        </div>

        {/* ── Category ── */}
        <div className="space-y-2">
          <Label style={{ color: labelColor }}>Category</Label>
          <Input
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="placeholder:opacity-30"
            style={inputStyle}
            placeholder="Development, Design, Learning"
          />
        </div>

        {/* ── Submit button ── */}
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
            : <><Clock   className="mr-2 h-4 w-4" />Submit for Approval</>
          }
        </Button>

      </div>
    </div>
  )
}