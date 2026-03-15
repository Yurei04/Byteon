"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function PendingResourceForm({ onSuccess, currentOrg, authUserId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [alert, setAlert]         = useState(null)
  const [formData, setFormData]   = useState({
    title: "", des: "", link: "", category: ""
  })

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
        des:             formData.des.trim() || null,
        link:            formData.link.trim(),
        category:        formData.category.trim() || null,
        organization_id: currentOrg.id,
        organization:    currentOrg.name,
        // ── Pending metadata ──
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

  if (!currentOrg) {
    return (
      <Card className="bg-gradient-to-br from-fuchsia-900/20 via-purple-900/20 to-slate-950/20 backdrop-blur-xl border border-fuchsia-500/30">
        <CardContent className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-fuchsia-300" />
          <p className="text-fuchsia-200/70">Loading organization information...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardContent className="p-6">
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
          <div className="space-y-2 p-4 border border-blue-400/30 rounded-xl bg-blue-950/20">
            <Label className="text-white font-semibold">Submitting as:</Label>
            <p className="text-white/90">{currentOrg.name}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Title *</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-white/10 border-white/20 text-white" placeholder="React Documentation" />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Description</Label>
            <Textarea value={formData.des} onChange={(e) => setFormData({ ...formData, des: e.target.value })}
              className="bg-white/10 border-white/20 text-white" rows={3}
              placeholder="Helpful resource for learning React" />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Link *</Label>
            <Input type="url" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="bg-white/10 border-white/20 text-white" placeholder="https://react.dev" />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Category</Label>
            <Input value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-white/10 border-white/20 text-white" placeholder="Development, Design, Learning" />
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
              : <><Clock className="mr-2 h-4 w-4" />Submit for Approval</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}