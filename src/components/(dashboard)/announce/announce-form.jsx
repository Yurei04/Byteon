"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2, Info, Trophy, Plus, X, Sparkles, RotateCcw } from "lucide-react"
import { supabase } from "@/lib/supabase"

const STORAGE_KEY = "announce_form_draft"
const PRIZES_KEY  = "announce_form_prizes"

const EMPTY_FORM = {
  title: "", des: "", author: "", date_begin: "", date_end: "",
  open_to: "", countries: "", website_link: "", dev_link: "",
  color_scheme: "purple", google_sheet_csv_url: ""
}
const EMPTY_PRIZES = [{ id: Date.now(), name: "", value: "", description: "" }]

const loadDraft = () => {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    return s ? { ...EMPTY_FORM, ...JSON.parse(s) } : { ...EMPTY_FORM }
  } catch { return { ...EMPTY_FORM } }
}
const loadPrizes = () => {
  try {
    const s = localStorage.getItem(PRIZES_KEY)
    return s ? JSON.parse(s) : [...EMPTY_PRIZES]
  } catch { return [...EMPTY_PRIZES] }
}
const saveDraft  = (data)   => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {} }
const savePrizes = (prizes) => { try { localStorage.setItem(PRIZES_KEY,  JSON.stringify(prizes)) } catch {} }
const clearDraft = ()       => { try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(PRIZES_KEY) } catch {} }

const PRIZE_TEMPLATES = [
  { name: "1st Place", value: "$5,000" },
  { name: "2nd Place", value: "$3,000" },
  { name: "3rd Place", value: "$2,000" },
  { name: "Best Design", value: "$1,000" },
  { name: "Most Innovative", value: "$1,500" },
  { name: "Best Technical", value: "$1,000" },
  { name: "People's Choice", value: "$500" },
  { name: "NordVPN Sub", value: "1 Year" },
  { name: "GitHub Pro", value: "1 Year" },
  { name: "Swag Pack", value: "T-shirt + Stickers" },
  { name: "Participation", value: "Certificate" },
]

const PRIZE_RANK_COLORS = [
  { border: "border-yellow-400/40", bg: "bg-yellow-400/5", badge: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30", label: "🥇" },
  { border: "border-slate-400/40", bg: "bg-slate-400/5", badge: "bg-slate-400/20 text-slate-300 border-slate-400/30", label: "🥈" },
  { border: "border-amber-700/40", bg: "bg-amber-700/5", badge: "bg-amber-700/20 text-amber-400 border-amber-700/30", label: "🥉" },
]

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 800

export default function AnnounceForm({ onSuccess, currentOrg, authUserId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [alert, setAlert] = useState(null)
  const [hasDraft, setHasDraft] = useState(false)

  // Load from localStorage on first render (survives refresh + tab switches)
  const [formData, setFormData] = useState(() => loadDraft())
  const [prizes, setPrizes] = useState(() => loadPrizes())

  // Persist every change to localStorage automatically
  useEffect(() => {
    saveDraft(formData)
    const isDirty = Object.entries(formData).some(([k, v]) => v && v !== EMPTY_FORM[k])
    setHasDraft(isDirty)
  }, [formData])

  useEffect(() => {
    savePrizes(prizes)
  }, [prizes])

  const resetForm = () => {
    clearDraft()
    setFormData({ ...EMPTY_FORM })
    setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])
    setHasDraft(false)
    setAlert(null)
  }

  const addPrize = () => setPrizes(prev => [...prev, { id: Date.now(), name: "", value: "", description: "" }])
  const removePrize = (id) => prizes.length > 1 && setPrizes(prev => prev.filter(p => p.id !== id))
  const updatePrize = (id, field, value) => setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))

  const applyTemplate = (template) => {
    const emptyIdx = prizes.findIndex(p => !p.name && !p.value)
    if (emptyIdx !== -1) {
      setPrizes(prev => prev.map((p, i) => i === emptyIdx ? { ...p, name: template.name, value: template.value } : p))
    } else {
      setPrizes(prev => [...prev, { id: Date.now(), name: template.name, value: template.value, description: "" }])
    }
  }

  const handleSubmit = async () => {
    if (!currentOrg || !authUserId) {
      setAlert({ type: "error", message: "Organization not found. Please refresh the page." })
      return
    }

    if (!formData.title || !formData.des || !formData.author || !formData.date_begin || !formData.date_end) {
      setAlert({ type: "error", message: "Please fill in all required fields (Title, Description, Author, Start Date, End Date)" })
      return
    }
    
    const validPrizes = prizes.filter(p => p.name.trim() && p.value.trim())
    if (validPrizes.length === 0) {
      setAlert({ type: "error", message: "Please add at least one prize with a name and value" })
      return
    }

    setIsLoading(true)
    setAlert(null)

    const announcementData = {
      title: formData.title.trim(),
      des: formData.des.trim(),
      author: formData.author.trim(),
      date_begin: formData.date_begin,
      date_end: formData.date_end,
      open_to: formData.open_to.trim() || null,
      countries: formData.countries.trim() || null,
      prizes: validPrizes.map(({ id, ...p }) => ({
        name: p.name.trim(),
        value: p.value.trim(),
        description: (p.description || "").trim()
      })),
      website_link: formData.website_link.trim() || null,
      dev_link: formData.dev_link.trim() || null,
      color_scheme: formData.color_scheme,
      organization: currentOrg.name,
      organization_id: currentOrg.id,
      registrants_count: 0,
      tracking_method: "automatic",
      google_sheet_csv_url: formData.google_sheet_csv_url.trim() || null,
    }

    let lastError = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      setRetryCount(attempt)
      try {
        // Force a fresh session before every attempt — tab switches cause token staleness
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session) {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) throw new Error("Session expired. Please log in again.")
        }

        const { error } = await supabase.from("announcements").insert([announcementData])
        if (error) throw error

        // DB confirmed — clear draft and reset
        clearDraft()
        setAlert({ type: "success", message: "Announcement published!" })
        setFormData({ ...EMPTY_FORM })
        setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])
        setHasDraft(false)
        setIsLoading(false)
        setRetryCount(0)
        if (onSuccess) onSuccess()
        return

      } catch (err) {
        lastError = err
        if (attempt < MAX_RETRIES) {
          await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
        }
      }
    }

    // All retries exhausted
    setAlert({ type: "error", message: `Failed after ${MAX_RETRIES} attempts: ${lastError?.message}` })
    setIsLoading(false)
    setRetryCount(0)
  }

  if (!currentOrg) {
    return (
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
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
        {alert && (
          <Alert className={`mb-6 ${alert.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}>
            {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Draft restored indicator */}
          {hasDraft && (
            <div className="flex items-center justify-between gap-3 p-3 border border-amber-400/30 rounded-xl bg-amber-950/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-200/80 text-xs">Draft auto-saved — your progress is safe</span>
              </div>
              <button onClick={resetForm} className="flex items-center gap-1 text-xs text-amber-400/60 hover:text-amber-300 transition-colors">
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 border border-blue-400/30 rounded-xl bg-blue-950/20">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-white/50 text-sm">Publishing as</span>
            <span className="text-white font-semibold text-sm">{currentOrg.name}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white/10 border-white/20 text-white" placeholder="AI Hackathon 2025" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Description *</Label>
              <Textarea value={formData.des} onChange={(e) => setFormData({ ...formData, des: e.target.value })}
                className="bg-white/10 border-white/20 text-white" rows={4} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white">Author *</Label>
              <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="bg-white/10 border-white/20 text-white" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <Label className="text-white font-semibold">Prize Pool *</Label>
                <span className="text-xs text-white/30 font-normal">({prizes.filter(p => p.name && p.value).length} added)</span>
              </div>
              <Button type="button" size="sm" onClick={addPrize}
                className="h-8 px-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg">
                <Plus className="w-3 h-3 mr-1" /> Add Prize
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="text-xs text-white/30 w-full mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Quick-fill templates
              </span>
              {PRIZE_TEMPLATES.map((template) => (
                <button key={template.name} type="button" onClick={() => applyTemplate(template)}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-amber-500/20 text-white/60 hover:text-amber-200 border border-white/10 hover:border-amber-500/30 transition-all duration-150">
                  {template.name}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {prizes.map((prize, index) => {
                const rank = PRIZE_RANK_COLORS[index] || { border: "border-white/10", bg: "bg-white/5", badge: "bg-white/10 text-white/50 border-white/10", label: `#${index + 1}` }
                return (
                  <div key={prize.id} className={`rounded-xl border ${rank.border} ${rank.bg} overflow-hidden`}>
                    <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rank.badge} shrink-0`}>{rank.label}</span>
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <Input value={prize.name} onChange={(e) => updatePrize(prize.id, "name", e.target.value)}
                          className="h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25" placeholder="Prize name" />
                        <Input value={prize.value} onChange={(e) => updatePrize(prize.id, "value", e.target.value)}
                          className="h-8 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25" placeholder="Value (e.g. $1,000)" />
                      </div>
                      {prizes.length > 1 && (
                        <button type="button" onClick={() => removePrize(prize.id)}
                          className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="px-4 pb-3">
                      <Input value={prize.description} onChange={(e) => updatePrize(prize.id, "description", e.target.value)}
                        className="h-7 text-xs bg-transparent border-transparent hover:border-white/10 focus:border-white/20 text-white/50 placeholder:text-white/20 transition-all"
                        placeholder="+ Add a short description (optional)" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Start Date *</Label>
              <Input type="datetime-local" value={formData.date_begin} onChange={(e) => setFormData({ ...formData, date_begin: e.target.value })}
                className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">End Date *</Label>
              <Input type="datetime-local" value={formData.date_end} onChange={(e) => setFormData({ ...formData, date_end: e.target.value })}
                className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Open To</Label>
              <Input value={formData.open_to} onChange={(e) => setFormData({ ...formData, open_to: e.target.value })}
                className="bg-white/10 border-white/20 text-white" placeholder="Students, Professionals, Everyone" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Countries</Label>
              <Input value={formData.countries} onChange={(e) => setFormData({ ...formData, countries: e.target.value })}
                className="bg-white/10 border-white/20 text-white" placeholder="Global, USA, Canada" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Website Link</Label>
              <Input type="url" value={formData.website_link} onChange={(e) => setFormData({ ...formData, website_link: e.target.value })}
                className="bg-white/10 border-white/20 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white">DevPost Link</Label>
              <Input type="url" value={formData.dev_link} onChange={(e) => setFormData({ ...formData, dev_link: e.target.value })}
                className="bg-white/10 border-white/20 text-white" />
            </div>
          </div>

          <div className="space-y-3 p-4 border border-blue-400/20 rounded-xl bg-blue-950/10">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <Label className="text-white font-semibold">Google Forms Registration Tracking</Label>
            </div>
            <Input value={formData.google_sheet_csv_url} onChange={(e) => setFormData({ ...formData, google_sheet_csv_url: e.target.value })}
              className="bg-white/10 border-white/20 text-white font-mono text-xs"
              placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv" />
            <p className="text-xs text-white/30">File → Share → Publish to web → Comma-separated values (.csv) → copy URL</p>
          </div>

          <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {retryCount > 1 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : "Publishing..."}
              </span>
            ) : "Publish Announcement"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}