"use client"

import DatePicker from "@/components/DatePickerClient"
import { forwardRef, useMemo } from "react"
import { Calendar } from "lucide-react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  AlertCircle, CheckCircle, Loader2, Info,
  Trophy, Plus, X, Sparkles, RotateCcw, Clock,
} from "lucide-react"
const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")
const t = FALLBACK_THEME

const STORAGE_KEY = "pending_announce_form_draft"
const PRIZES_KEY  = "pending_announce_form_prizes"

const EMPTY_FORM = {
  title: "", des: "", author: "", date_begin: "", date_end: "",
  open_to: "", countries: "", website_link: "", dev_link: "",
  color_scheme: "purple", google_sheet_csv_url: "",
}
const EMPTY_PRIZES = [{ id: Date.now(), name: "", value: "", description: "" }]

const loadDraft  = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...EMPTY_FORM, ...JSON.parse(s) } : { ...EMPTY_FORM } } catch { return { ...EMPTY_FORM } } }
const loadPrizes = () => { try { const s = localStorage.getItem(PRIZES_KEY);  return s ? JSON.parse(s) : [...EMPTY_PRIZES] }                  catch { return [...EMPTY_PRIZES] } }
const saveDraft  = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }
const savePrizes = (p) => { try { localStorage.setItem(PRIZES_KEY,  JSON.stringify(p)) } catch {} }
const clearDraft = ()  => { try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(PRIZES_KEY) } catch {} }

const PRIZE_TEMPLATES = [
  { name: "1st Place",       value: "$5,000"     },
  { name: "2nd Place",       value: "$3,000"     },
  { name: "3rd Place",       value: "$2,000"     },
  { name: "Best Design",     value: "$1,000"     },
  { name: "Most Innovative", value: "$1,500"     },
  { name: "Best Technical",  value: "$1,000"     },
  { name: "People's Choice", value: "$500"       },
  { name: "Participation",   value: "Certificate"},
]

const PRIZE_RANK_COLORS = [
  { border: "border-yellow-400/40", bg: "bg-yellow-400/5",  badge: "bg-yellow-400/20 text-yellow-300 border-yellow-400/30", label: "🥇" },
  { border: "border-slate-400/40",  bg: "bg-slate-400/5",   badge: "bg-slate-400/20 text-slate-300 border-slate-400/30",   label: "🥈" },
  { border: "border-amber-700/40",  bg: "bg-amber-700/5",   badge: "bg-amber-700/20 text-amber-400 border-amber-700/30",   label: "🥉" },
]

const MAX_RETRIES    = 5
const RETRY_DELAY_MS = 800

function convertTo24Hour(hour, minute, period) {
  let h = parseInt(hour)
  if (period === "PM" && h !== 12) h += 12
  if (period === "AM" && h === 12) h = 0
  return `${String(h).padStart(2, "0")}:${minute}`
}

const CalendarInput = forwardRef(({ value, onClick, borderColor }, ref) => (
  <div
    onClick={onClick}
    ref={ref}
    className="w-full flex items-center justify-between text-white px-3 py-2 rounded cursor-pointer transition"
    style={{ background: "rgba(255,255,255,0.08)", border: borderColor || "1px solid rgba(255,255,255,0.2)" }}
  >
    <span>{value || "Select date"}</span>
    <Calendar className="w-4 h-4 text-white/60" />
  </div>
))
CalendarInput.displayName = "CalendarInput"

export default function PendingAnnounceForm({ onSuccess, currentOrg, authUserId }) {
  const [isLoading, setIsLoading]   = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [alert, setAlert]           = useState(null)
  const [hasDraft, setHasDraft]     = useState(false)
  const [formData, setFormData]     = useState(() => loadDraft())
  const [prizes, setPrizes]         = useState(() => loadPrizes())

// ===== DATE =====
const [startDate, setStartDate] = useState(null)
const [endDate, setEndDate] = useState(null)

// ===== START TIME  =====
const [startHour12, setStartHour12] = useState("12")
const [startMinute, setStartMinute] = useState("00")
const [startPeriod, setStartPeriod] = useState("AM")

// ===== END TIME  =====
const [endHour12, setEndHour12] = useState("12")
const [endMinute, setEndMinute] = useState("00")
const [endPeriod, setEndPeriod] = useState("AM")

// dropdown options
const hourOptions = ["01","02","03","04","05","06","07","08","09","10","11","12"]
const minuteOptions = ["00","05","10","15","20","25","30","35","40","45","50","55"]

const periodOptions = ["AM", "PM"]

  // ── Draft persistence ────────────────────────────────────────────────────
  useEffect(() => {
    saveDraft(formData)
    setHasDraft(Object.entries(formData).some(([k, v]) => v && v !== EMPTY_FORM[k]))
  }, [formData])
  useEffect(() => { savePrizes(prizes) }, [prizes])

  const resetForm = () => {
    clearDraft()
    setFormData({ ...EMPTY_FORM })
    setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])
    setHasDraft(false)
    setAlert(null)
  }

  // ── Prize helpers ────────────────────────────────────────────────────────
  const addPrize    = () => setPrizes(prev => [...prev, { id: Date.now(), name: "", value: "", description: "" }])
  const removePrize = (id) => prizes.length > 1 && setPrizes(prev => prev.filter(p => p.id !== id))
  const updatePrize = (id, field, value) => setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  const applyTemplate = (template) => {
    const emptyIdx = prizes.findIndex(p => !p.name && !p.value)
    if (emptyIdx !== -1) setPrizes(prev => prev.map((p, i) => i === emptyIdx ? { ...p, ...template } : p))
    else setPrizes(prev => [...prev, { id: Date.now(), ...template, description: "" }])
  }
  // 
const createUTCISOString = (dateObj, time24) => {
  const [hour, minute] = time24.split(":").map(Number)

  //create local date
  const localDate = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    hour,
    minute,
    0
  )
  return localDate.toISOString()
}
const handleSubmit = async () => {

  // check
  if (!startDate || !endDate) {
    setAlert({ type: "error", message: "Please select start and end date." })
     setIsLoading(true)
    return
  }

    if (!formData.title || !formData.des || !formData.author) {
    setAlert({ type: "error", message: "Please fill in all required fields." })
    setIsLoading(false)
    return
  }

  // ISO
  const startTime24 = convertTo24Hour(startHour12, startMinute, startPeriod)
  const endTime24   = convertTo24Hour(endHour12, endMinute, endPeriod)

  const startISO = createUTCISOString(startDate, startTime24)
  const endISO   = createUTCISOString(endDate, endTime24)

  const updatedFormData = {
    ...formData,
    date_begin: startISO,
    date_end: endISO
  }

if (!currentOrg || !authUserId) {
  setAlert({ type: "error", message: "Organization not found. Please refresh." })
  return
}

if (
  !updatedFormData.title ||
  !updatedFormData.des ||
  !updatedFormData.author ||
  !updatedFormData.date_begin ||
  !updatedFormData.date_end
) {
  setAlert({ type: "error", message: "Please fill in all required fields." })
  return
}
const validPrizes = prizes.filter(
  p => p.name.trim() && p.value.trim()
)

if (validPrizes.length === 0) {
  setAlert({ type: "error", message: "Please add at least one prize." })
  return
}

const payload = {
  title: updatedFormData.title.trim(),
  des: updatedFormData.des.trim(),
  author: updatedFormData.author.trim(),
  date_begin: updatedFormData.date_begin,
  date_end: updatedFormData.date_end,
  open_to: updatedFormData.open_to?.trim() || null,
  countries: updatedFormData.countries?.trim() || null,
  prizes: validPrizes.map(({ id, ...p }) => ({
    name: p.name.trim(),
    value: p.value.trim(),
    description: (p.description || "").trim()
  })),
  website_link: updatedFormData.website_link?.trim() || null,
  dev_link: updatedFormData.dev_link?.trim() || null,
  color_scheme: updatedFormData.color_scheme,
  organization: currentOrg.name,
  organization_id: currentOrg.id,
  tracking_method: "automatic",
  google_sheet_csv_url: updatedFormData.google_sheet_csv_url?.trim() || null,
  status: "pending",
  submitted_by: authUserId,
}
    let lastError = null
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      setRetryCount(attempt)
      try {
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  const { error: refreshError } = await supabase.auth.refreshSession()
  if (refreshError) throw refreshError
}
const { data, error } = await supabase
          .from("pending_announcements")
          .insert([payload])
          .select()
        if (error) throw error
        clearDraft()
        setAlert({ type: "success", message: "Submitted for approval! ✅ The super admin will review your announcement." })
        setFormData({ ...EMPTY_FORM })
        setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])
        setHasDraft(false); setIsLoading(false); setRetryCount(0)
        if (onSuccess) onSuccess()
        return
      } catch (err) {
        lastError = err
        if (attempt < MAX_RETRIES) await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
      }
    }
    setAlert({ type: "error", message: `Failed after ${MAX_RETRIES} attempts: ${lastError?.message}` })
    setIsLoading(false); setRetryCount(0)
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (!currentOrg) {
    return (
      <div className="rounded-xl backdrop-blur-lg p-12 text-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: t.primaryText }} />
        <p style={{ color: t.mutedText }}>Loading organization information...</p>
      </div>
    )
  }

  // ── Shared input style ───────────────────────────────────────────────────
  const inputStyle = { background: "rgba(255,255,255,0.06)", borderColor: t.primary30, color: "#fff" }
  const selectStyle = { background: "rgba(255,255,255,0.9)", color: "#111", border: `1px solid ${t.primary30}`, borderRadius: "0.375rem", padding: "0.25rem 0.5rem", fontWeight: 500 }

  return (
    // Spread CSS vars so --p / --s are available to child components
    <div style={t.cssVars}>
      {/* Pending notice */}
      <div className="flex items-center gap-2 mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        <p className="text-amber-200 text-sm">
          This submission will be <strong>reviewed by the super admin</strong> before going live.
        </p>
      </div>

      {alert && (
        <Alert className={`mb-6 ${alert.type === "error" ? "border-red-500 bg-red-500/10" : "border-green-500 bg-green-500/10"}`}>
          {alert.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">

        {/* Draft indicator */}
        {hasDraft && (
          <div
            className="flex items-center justify-between gap-3 p-3 rounded-xl"
            style={{ background: `rgba(245,158,11,0.08)`, border: "1px solid rgba(245,158,11,0.3)" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-200/80 text-xs">Draft auto-saved</span>
            </div>
            <button onClick={resetForm} className="flex items-center gap-1 text-xs text-amber-400/60 hover:text-amber-300 transition-colors">
              <RotateCcw className="w-3 h-3" /> Clear
            </button>
          </div>
        )}

        {/* Submitting as */}
        <div
          className="flex items-center gap-3 p-3 rounded-xl"
          style={{ background: t.badgeBgPrimary, border: t.borderColorLight }}
        >
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.primaryFull }} />
          <span className="text-white/50 text-sm">Submitting as</span>
          <span className="font-semibold text-sm" style={{ color: t.primaryText }}>{currentOrg.name}</span>
        </div>

        {/* Basic fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Title *</Label>
            <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="text-white placeholder:text-white/30" style={inputStyle} placeholder="AI Hackathon 2025" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Description *</Label>
            <Textarea value={formData.des} onChange={(e) => setFormData({ ...formData, des: e.target.value })}
              className="text-white placeholder:text-white/30" style={inputStyle} rows={4} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-white">Author *</Label>
            <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="text-white placeholder:text-white/30" style={inputStyle} />
          </div>
        </div>

        {/* Prize Pool */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <Label className="text-white font-semibold">Prize Pool *</Label>
            </div>
            <Button type="button" size="sm" onClick={addPrize}
              className="h-8 px-3 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg">
              <Plus className="w-3 h-3 mr-1" /> Add Prize
            </Button>
          </div>

          {/* Quick-fill templates */}
          <div className="flex flex-wrap gap-1.5 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-xs text-white/30 w-full mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" style={{ color: t.primaryText }} /> Quick-fill
            </span>
            {PRIZE_TEMPLATES.map((tmpl) => (
              <button key={tmpl.name} type="button" onClick={() => applyTemplate(tmpl)}
                className="px-2.5 py-1 text-xs rounded-md text-white/60 border border-white/10 transition-all"
                onMouseEnter={(e) => { e.currentTarget.style.background = t.badgeBgPrimary; e.currentTarget.style.color = t.primaryText; e.currentTarget.style.borderColor = t.primary30 }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ""; e.currentTarget.style.color = ""; e.currentTarget.style.borderColor = "" }}
              >
                {tmpl.name}
              </button>
            ))}
          </div>

          {/* Prize rows */}
          <div className="space-y-2">
            {prizes.map((prize, index) => {
              const rank = PRIZE_RANK_COLORS[index] || { border: "border-white/10", bg: "bg-white/5", badge: "bg-white/10 text-white/50 border-white/10", label: `#${index + 1}` }
              return (
                <div key={prize.id} className={`rounded-xl border ${rank.border} ${rank.bg} overflow-hidden`}>
                  <div className="flex items-center gap-3 px-4 pt-3 pb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${rank.badge} shrink-0`}>{rank.label}</span>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <Input value={prize.name} onChange={(e) => updatePrize(prize.id, "name", e.target.value)}
                        className="h-8 text-sm text-white placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                        placeholder="Prize name" />
                      <Input value={prize.value} onChange={(e) => updatePrize(prize.id, "value", e.target.value)}
                        className="h-8 text-sm text-white placeholder:text-white/25"
                        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
                        placeholder="Value" />
                    </div>
                    {prizes.length > 1 && (
                      <button type="button" onClick={() => removePrize(prize.id)}
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Date / Time pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* START */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              dateFormat="yyyy/MM/dd"
              customInput={<CalendarInput borderColor={t.borderColor} />}
            />
            <div className="flex gap-2 mt-2">
              <select value={startHour12}  onChange={(e) => setStartHour12(e.target.value)}  style={selectStyle}>{hourOptions.map(h   => <option key={h}>{h}</option>)}</select>
              <span className="text-white self-center">:</span>
              <select value={startMinute}  onChange={(e) => setStartMinute(e.target.value)}  style={selectStyle}>{minuteOptions.map(m => <option key={m}>{m}</option>)}</select>
              <select value={startPeriod}  onChange={(e) => setStartPeriod(e.target.value)}  style={selectStyle}><option>AM</option><option>PM</option></select>
            </div>
          </div>

          {/* END */}
          <div>
            <label className="block text-sm font-semibold mb-1 text-white">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              dateFormat="yyyy/MM/dd"
              customInput={<CalendarInput borderColor={t.borderColor} />}
            />
            <div className="flex gap-2 mt-2">
              <select value={endHour12}   onChange={(e) => setEndHour12(e.target.value)}   style={selectStyle}>{hourOptions.map(h   => <option key={h}>{h}</option>)}</select>
              <span className="text-white self-center">:</span>
              <select value={endMinute}   onChange={(e) => setEndMinute(e.target.value)}   style={selectStyle}>{minuteOptions.map(m => <option key={m}>{m}</option>)}</select>
              <select value={endPeriod}   onChange={(e) => setEndPeriod(e.target.value)}   style={selectStyle}><option>AM</option><option>PM</option></select>
            </div>
          </div>

          {/* Other fields */}
          {[
            { key: "open_to",      label: "Open To",       placeholder: "Students, Everyone" },
            { key: "countries",    label: "Countries",     placeholder: "Global, USA"        },
            { key: "website_link", label: "Website Link",  type: "url", placeholder: ""      },
            { key: "dev_link",     label: "DevPost Link",  type: "url", placeholder: ""      },
          ].map(({ key, label, type = "text", placeholder }) => (
            <div key={key} className="space-y-2">
              <Label className="text-white">{label}</Label>
              <Input
                type={type}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                className="text-white placeholder:text-white/30"
                style={inputStyle}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>

        {/* Google Forms tracking */}
        <div
          className="space-y-3 p-4 rounded-xl"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(96,165,250,0.2)" }}
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
            <Label className="text-white font-semibold">Google Forms Tracking</Label>
          </div>
          <Input
            value={formData.google_sheet_csv_url}
            onChange={(e) => setFormData({ ...formData, google_sheet_csv_url: e.target.value })}
            className="text-white font-mono text-xs placeholder:text-white/30"
            style={inputStyle}
            placeholder="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
          />
        </div>

        {/* Submit button — fully org-branded */}
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full text-white border-0 transition-all duration-300"
          style={{
            background:  isLoading ? t.badgeBgPrimary : t.buttonGradient,
            boxShadow:   t.buttonShadow,
            opacity:     isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {retryCount > 1 ? `Retrying... (${retryCount}/${MAX_RETRIES})` : "Submitting..."}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Submit for Approval
            </span>
          )}
        </Button>
      </div>
    </div>
  )
}