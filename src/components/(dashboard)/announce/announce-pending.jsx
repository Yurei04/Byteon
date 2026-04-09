"use client"

import DatePicker from "@/components/DatePickerClient"
import { forwardRef, useState, useEffect, useCallback, useRef } from "react"
import {
  Calendar, Clock, Trophy, Plus, X, Sparkles,
  AlertCircle, CheckCircle, Loader2, Link2, ChevronDown,
  Globe, Code2, FileSpreadsheet, ClipboardList,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// ─── Constants ───────────────────────────────────────────────────────────────
const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")
const t = FALLBACK_THEME

const STORAGE_KEY = "pending_announce_form_draft"
const PRIZES_KEY  = "pending_announce_form_prizes"
const LINKS_KEY   = "pending_announce_form_links"

const MAX_RETRIES    = 5
const RETRY_DELAY_MS = 800

// ─── Character limits ─────────────────────────────────────────────────────────
const LIMITS = {
  title:       80,
  des:         1000,
  author:      60,
  open_to:     80,
  countries:   120,
  prize_name:  40,
}

const EMPTY_FORM = {
  title: "", des: "", author: "",
  date_begin: "", date_end: "",
  open_to: "", countries: "",
  color_scheme: "purple",
}
const EMPTY_PRIZES = [{ id: Date.now(), name: "", value: "", description: "" }]

// ─── Link type config ─────────────────────────────────────────────────────────
const LINK_TYPES = [
  { key: "website_link",         label: "Website",          placeholder: "https://yoursite.com",                                              icon: Globe,          color: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/25"     },
  { key: "dev_link",             label: "DevPost",          placeholder: "https://devpost.com/...",                                           icon: Code2,          color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/25"  },
  { key: "google_sheet_csv_url", label: "Google Sheet CSV", placeholder: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv",        icon: FileSpreadsheet,color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25" },
  { key: "google_forms_url",     label: "Google Forms",     placeholder: "https://forms.google.com/...",                                      icon: ClipboardList,  color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/25"  },
]

// ─── Prize templates ──────────────────────────────────────────────────────────
const PRIZE_TEMPLATES = [
  { name: "1st Place",       value: "$5,000"      },
  { name: "2nd Place",       value: "$3,000"      },
  { name: "3rd Place",       value: "$2,000"      },
  { name: "Best Design",     value: "$1,000"      },
  { name: "Most Innovative", value: "$1,500"      },
  { name: "Best Technical",  value: "$1,000"      },
  { name: "People's Choice", value: "$500"        },
  { name: "Participation",   value: "Certificate" },
]

const RANK_STYLES = [
  { ring: "ring-1 ring-yellow-400/40", bg: "bg-gradient-to-br from-yellow-400/8 to-amber-500/4",  badge: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/30", glow: "shadow-[0_0_12px_rgba(251,191,36,0.12)]",  medal: "🥇" },
  { ring: "ring-1 ring-slate-400/40",  bg: "bg-gradient-to-br from-slate-400/8 to-slate-500/4",   badge: "bg-slate-400/15 text-slate-200 border border-slate-400/30",   glow: "shadow-[0_0_12px_rgba(148,163,184,0.10)]", medal: "🥈" },
  { ring: "ring-1 ring-amber-700/40",  bg: "bg-gradient-to-br from-amber-700/8 to-amber-800/4",   badge: "bg-amber-700/15 text-amber-400 border border-amber-700/30",   glow: "shadow-[0_0_12px_rgba(180,83,9,0.12)]",    medal: "🥉" },
]
const DEFAULT_RANK = { ring: "ring-1 ring-white/10", bg: "bg-white/[0.03]", badge: "bg-white/10 text-white/50 border border-white/15", glow: "", medal: null }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const loadDraft  = () => { try { const s = localStorage.getItem(STORAGE_KEY); return s ? { ...EMPTY_FORM, ...JSON.parse(s) } : { ...EMPTY_FORM } } catch { return { ...EMPTY_FORM } } }
const loadPrizes = () => { try { const s = localStorage.getItem(PRIZES_KEY);  return s ? JSON.parse(s) : [{ id: Date.now(), name: "", value: "", description: "" }] } catch { return [{ id: Date.now(), name: "", value: "", description: "" }] } }
const loadLinks  = () => { try { const s = localStorage.getItem(LINKS_KEY);   return s ? JSON.parse(s) : [] } catch { return [] } }
const saveDraft  = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)) } catch {} }
const savePrizes = (p) => { try { localStorage.setItem(PRIZES_KEY,  JSON.stringify(p)) } catch {} }
const saveLinks  = (l) => { try { localStorage.setItem(LINKS_KEY,   JSON.stringify(l)) } catch {} }
const clearDraft = ()  => { try { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(PRIZES_KEY); localStorage.removeItem(LINKS_KEY) } catch {} }

function convertTo24Hour(hour, minute, period) {
  let h = parseInt(hour)
  if (period === "PM" && h !== 12) h += 12
  if (period === "AM" && h === 12) h = 0
  return `${String(h).padStart(2, "0")}:${minute}`
}
const createUTCISOString = (dateObj, time24) => {
  const [hour, minute] = time24.split(":").map(Number)
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hour, minute, 0).toISOString()
}

// ─── CharCount ────────────────────────────────────────────────────────────────
function CharCount({ current, max }) {
  const pct  = current / max
  const near = pct >= 0.85
  const over = current > max
  return (
    <div className="flex items-center justify-end gap-1.5 mt-1">
      <div className="h-0.5 w-12 rounded-full overflow-hidden bg-white/8">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${Math.min(pct * 100, 100)}%`, background: over ? "#f87171" : near ? "#fbbf24" : "rgba(255,255,255,0.25)" }}
        />
      </div>
      <span
        className="text-[10px] tabular-nums transition-colors"
        style={{ color: over ? "#f87171" : near ? "#fbbf24" : "rgba(255,255,255,0.22)" }}
      >
        {current}/{max}
      </span>
    </div>
  )
}

// ─── CalendarInput ────────────────────────────────────────────────────────────
const CalendarInput = forwardRef(({ value, onClick }, ref) => (
  <div
    onClick={onClick} ref={ref}
    className="w-full flex items-center justify-between text-white px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/[0.07]"
    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}
  >
    <span className={value ? "text-white text-sm" : "text-white/30 text-sm"}>{value || "Select date"}</span>
    <Calendar className="w-4 h-4 text-white/40" />
  </div>
))
CalendarInput.displayName = "CalendarInput"

// ─── TimeSelect ───────────────────────────────────────────────────────────────
function TimeSelect({ hour, minute, period, onHour, onMinute, onPeriod }) {
  const hourOpts   = ["01","02","03","04","05","06","07","08","09","10","11","12"]
  const minuteOpts = ["00","05","10","15","20","25","30","35","40","45","50","55"]
  const sel = {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", borderRadius: "0.6rem", padding: "0.4rem 0.5rem",
    fontSize: "0.8rem", outline: "none", cursor: "pointer", backdropFilter: "blur(6px)",
  }
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <select value={hour}   onChange={(e) => onHour(e.target.value)}   style={sel}>{hourOpts.map(h   => <option key={h} style={{ background: "#1a1a2e" }}>{h}</option>)}</select>
      <span className="text-white/30 text-sm font-light">:</span>
      <select value={minute} onChange={(e) => onMinute(e.target.value)} style={sel}>{minuteOpts.map(m => <option key={m} style={{ background: "#1a1a2e" }}>{m}</option>)}</select>
      <select value={period} onChange={(e) => onPeriod(e.target.value)} style={sel}>
        <option style={{ background: "#1a1a2e" }}>AM</option>
        <option style={{ background: "#1a1a2e" }}>PM</option>
      </select>
    </div>
  )
}

// ─── LinksSection ─────────────────────────────────────────────────────────────
function LinksSection({ links, setLinks, inputStyle, onFocus, onBlur, hasError, onLinkAdded }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const addLink    = (e, typeKey) => { e.preventDefault(); setLinks(prev => [...prev, { id: Date.now(), typeKey, value: "" }]); setShowDropdown(false); if (onLinkAdded) onLinkAdded() }
  const removeLink = (e, id)      => { e.preventDefault(); setLinks(prev => prev.filter(l => l.id !== id)) }
  const updateLink = (id, value)  => setLinks(prev => prev.map(l => l.id === id ? { ...l, value } : l))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-white/50" />
          <Label className="text-white font-semibold">Links <span className="text-red-400">*</span></Label>
          {links.length > 0 && (
            <span className="text-xs text-white/30 bg-white/8 border border-white/10 px-1.5 py-0.5 rounded-full">{links.length}</span>
          )}
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowDropdown(p => !p) }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all"
            style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
            <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden min-w-[180px]"
              style={{ background: "rgba(15,15,25,0.95)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(16px)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}
            >
              {LINK_TYPES.map((lt) => {
                const Icon = lt.icon
                return (
                  <button key={lt.key} type="button" onClick={(e) => addLink(e, lt.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-all hover:bg-white/5 ${lt.color}`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center ${lt.bg}`}><Icon className="w-3.5 h-3.5" /></span>
                    <span className="text-white/80">{lt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {links.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-6 rounded-xl border border-dashed text-center transition-all"
          style={{ background: hasError ? "rgba(239,68,68,0.04)" : "rgba(255,255,255,0.02)", borderColor: hasError ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.10)" }}
        >
          <Link2 className={`w-5 h-5 mb-2 ${hasError ? "text-red-400/40" : "text-white/20"}`} />
          <p className={`text-xs ${hasError ? "text-red-400/70" : "text-white/25"}`}>
            {hasError ? "At least one link is required." : 'No links added yet. Click "Add Link" to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const cfg = LINK_TYPES.find(lt => lt.key === link.typeKey) || LINK_TYPES[0]
            const Icon = cfg.icon
            return (
              <div key={link.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.border} transition-all`} style={{ background: "rgba(255,255,255,0.03)" }}>
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}><Icon className={`w-3.5 h-3.5 ${cfg.color}`} /></span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-medium mb-0.5 ${cfg.color}`}>{cfg.label}</p>
                  <Input
                    onFocus={onFocus} onBlur={onBlur} type="url"
                    value={link.value} onChange={(e) => updateLink(link.id, e.target.value)}
                    placeholder={cfg.placeholder}
                    className="h-7 text-xs text-white placeholder:text-white/25 border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    style={{ boxShadow: "none" }}
                  />
                </div>
                <button type="button" onClick={(e) => removeLink(e, link.id)} className="shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── PrizePool ────────────────────────────────────────────────────────────────
function PrizePool({ prizes, setPrizes, onFocus, onBlur }) {
  const addPrize      = (e)          => { e.preventDefault(); setPrizes(prev => [...prev, { id: Date.now(), name: "", value: "" }]) }
  const removePrize   = (e, id)      => { e.preventDefault(); prizes.length > 1 && setPrizes(prev => prev.filter(p => p.id !== id)) }
  const updatePrize   = (id, field, val) => setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))
  const applyTemplate = (e, tmpl)    => {
    e.preventDefault()
    const emptyIdx = prizes.findIndex(p => !p.name && !p.value)
    if (emptyIdx !== -1) setPrizes(prev => prev.map((p, i) => i === emptyIdx ? { ...p, ...tmpl } : p))
    else setPrizes(prev => [...prev, { id: Date.now(), ...tmpl }])
  }
  const total = prizes.reduce((acc, p) => {
    const num = parseFloat((p.value || "").replace(/[^0-9.]/g, ""))
    return isNaN(num) ? acc : acc + num
  }, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-amber-400/15 border border-amber-400/25 flex items-center justify-center">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <Label className="text-white font-semibold leading-none">Prize Pool <span className="text-red-400">*</span></Label>
          {total > 0 && <p className="text-xs text-amber-400/70 mt-0.5">≈ ${total.toLocaleString()} total</p>}
        </div>
      </div>

      <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-amber-400/60" />
          <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">Quick templates</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRIZE_TEMPLATES.map((tmpl) => (
            <button key={tmpl.name} type="button" onClick={(e) => applyTemplate(e, tmpl)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-white/50 border border-white/8 bg-white/[0.03] hover:bg-amber-400/10 hover:text-amber-300 hover:border-amber-400/25 transition-all"
            >
              {tmpl.name}
              <span className="text-white/25 text-[10px]">{tmpl.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {prizes.map((prize, index) => {
          const rank = RANK_STYLES[index] || DEFAULT_RANK
          return (
            <div key={prize.id} className={`rounded-xl overflow-hidden ${rank.ring} ${rank.glow} transition-all`}>
              <div className={`px-4 py-3 ${rank.bg}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1 ${rank.badge}`}>
                    {rank.medal ?? `#${index + 1}`}
                  </span>
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] text-white/25 font-medium uppercase tracking-widest mb-1">Prize Name</p>
                      <Input
                        onFocus={onFocus} onBlur={onBlur}
                        value={prize.name}
                        onChange={(e) => updatePrize(prize.id, "name", e.target.value.slice(0, LIMITS.prize_name))}
                        placeholder="e.g. 1st Place"
                        maxLength={LIMITS.prize_name}
                        className="h-8 text-sm text-white placeholder:text-white/20 border-white/10 bg-white/5 focus-visible:border-white/30"
                        style={{ borderRadius: "0.5rem" }}
                      />
                      <CharCount current={prize.name.length} max={LIMITS.prize_name} />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/25 font-medium uppercase tracking-widest mb-1">Value</p>
                      <Input
                        onFocus={onFocus} onBlur={onBlur}
                        value={prize.value}
                        onChange={(e) => updatePrize(prize.id, "value", e.target.value.slice(0, LIMITS.prize_value))}
                        placeholder="$5,000"
                        maxLength={LIMITS.prize_value}
                        className="h-8 text-sm text-white placeholder:text-white/20 border-white/10 bg-white/5 focus-visible:border-white/30"
                        style={{ borderRadius: "0.5rem" }}
                      />
                      <CharCount current={prize.value.length} max={LIMITS.prize_value} />
                    </div>
                  </div>
                  {prizes.length > 1 && (
                    <button type="button" onClick={(e) => removePrize(e, prize.id)}
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all mt-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button type="button" onClick={addPrize}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-amber-500/25 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/8 hover:border-amber-500/40 text-sm transition-all"
      >
        <Plus className="w-4 h-4" /> Add Prize
      </button>
    </div>
  )
}

// ─── Section — OUTSIDE main component to prevent input remount bug ────────────
function Section({ children, className = "" }) {
  return (
    <div className={`rounded-2xl p-5 ${className}`} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PendingAnnounceForm({ onSuccess, currentOrg, authUserId, addToast }) {
  const [isLoading, setIsLoading]           = useState(false)
  const [retryCount, setRetryCount]         = useState(0)
  const [hasDraft, setHasDraft]             = useState(false)
  const [draftDismissed, setDraftDismissed] = useState(false)
  const [formData, setFormData]             = useState(() => loadDraft())
  const [prizes, setPrizes]                 = useState(() => loadPrizes())
  const [links, setLinks]                   = useState(() => loadLinks())
  const [linkError, setLinkError]           = useState(false)

  const [startDate,   setStartDate]   = useState(null)
  const [endDate,     setEndDate]     = useState(null)
  const [startHour12, setStartHour12] = useState("12")
  const [startMinute, setStartMinute] = useState("00")
  const [startPeriod, setStartPeriod] = useState("AM")
  const [endHour12,   setEndHour12]   = useState("12")
  const [endMinute,   setEndMinute]   = useState("00")
  const [endPeriod,   setEndPeriod]   = useState("AM")

  // ── Draft persistence ────────────────────────────────────────────────────
  useEffect(() => {
    saveDraft(formData)
    setHasDraft(Object.entries(formData).some(([k, v]) => v && v !== EMPTY_FORM[k]))
  }, [formData])
  useEffect(() => { savePrizes(prizes) }, [prizes])
  useEffect(() => { saveLinks(links)   }, [links])

  const resetForm = () => {
    clearDraft()
    setFormData({ ...EMPTY_FORM })
    setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])
    setLinks([])
    setStartDate(null); setEndDate(null)
    setHasDraft(false); setDraftDismissed(false)
  }

  // ── Clamped field setter ─────────────────────────────────────────────────
  const setField = (field, raw) => {
    const limit = LIMITS[field]
    setFormData(prev => ({ ...prev, [field]: limit ? raw.slice(0, limit) : raw }))
  }

  // ── Shared input styles ──────────────────────────────────────────────────
  const inputStyle = {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
    color: "#fff", backdropFilter: "blur(6px)", transition: "all 0.2s ease",
  }
  const handleFocus = (e) => {
    e.target.style.borderColor = t.primaryFull
    e.target.style.boxShadow   = `0 0 0 2px ${t.primaryFull}35, 0 4px 18px ${t.primaryFull}20`
  }
  const handleBlur = (e) => {
    e.target.style.borderColor = "rgba(255,255,255,0.10)"
    e.target.style.boxShadow   = "none"
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!startDate || !endDate)                     { addToast("error", "Please select start and end dates."); return }
    if (!formData.title || !formData.des || !formData.author) { addToast("error", "Please fill in all required fields."); return }
    if (!currentOrg || !authUserId)                 { addToast("error", "Organization not found. Please refresh."); return }

    const startTime24 = convertTo24Hour(startHour12, startMinute, startPeriod)
    const endTime24   = convertTo24Hour(endHour12, endMinute, endPeriod)
    const startISO    = createUTCISOString(startDate, startTime24)
    const endISO      = createUTCISOString(endDate, endTime24)

    const validPrizes = prizes.filter(p => p.name.trim() && p.value.trim())
    if (validPrizes.length === 0) { addToast("error", "Please add at least one prize with a name and value."); return }

    const filledLinks = links.filter(l => l.value.trim())
    if (filledLinks.length === 0) { setLinkError(true); addToast("error", "Please add at least one link."); return }
    setLinkError(false)

    const linkFields = {}
    filledLinks.forEach(l => { linkFields[l.typeKey] = l.value.trim() })

    const payload = {
      title:                formData.title.trim(),
      des:                  formData.des.trim(),
      author:               formData.author.trim(),
      date_begin:           startISO,
      date_end:             endISO,
      open_to:              formData.open_to?.trim()   || null,
      countries:            formData.countries?.trim() || null,
      prizes:               validPrizes.map(({ id, ...p }) => ({ name: p.name.trim(), value: p.value.trim(), description: (p.description || "").trim() })),
      website_link:         linkFields.website_link         || null,
      dev_link:             linkFields.dev_link             || null,
      color_scheme:         formData.color_scheme,
      organization:         currentOrg.name,
      organization_id:      currentOrg.id,
      tracking_method:      "automatic",
      google_sheet_csv_url: linkFields.google_sheet_csv_url || null,
      google_forms_url:     linkFields.google_forms_url     || null,
      status:               "pending",
      submitted_by:         authUserId,
    }

    setIsLoading(true)
    let lastError = null
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      setRetryCount(attempt)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) throw refreshError
        }
        const { error } = await supabase.from("pending_announcements").insert([payload]).select()
        if (error) throw error
        clearDraft()
        addToast("success", "Submitted for approval! The super admin will review your announcement.")
        setFormData({ ...EMPTY_FORM })
        setPrizes([{ id: Date.now(), name: "", value: "", description: "" }])
        setLinks([])
        setHasDraft(false); setLinkError(false); setIsLoading(false); setRetryCount(0)
        if (onSuccess) onSuccess()
        return
      } catch (err) {
        lastError = err
        if (attempt < MAX_RETRIES) await new Promise(res => setTimeout(res, RETRY_DELAY_MS))
      }
    }
    addToast("error", `Failed after ${MAX_RETRIES} attempts: ${lastError?.message}`)
    setIsLoading(false); setRetryCount(0)
  }

  // ── Loading org ──────────────────────────────────────────────────────────
  if (!currentOrg) {
    return (
      <div className="rounded-xl p-12 text-center" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}>
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: t.primaryText }} />
        <p style={{ color: t.mutedText }}>Loading organization…</p>
      </div>
    )
  }

  return (
    <div style={t.cssVars} className="space-y-4">
      {/* ── Pending notice ── */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
        <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-amber-200/80 text-sm leading-relaxed">
          This submission will be <span className="text-amber-300 font-medium">reviewed by the super admin</span> before going live.
        </p>
      </div>

      {/* ── Auto-save draft indicator ── */}
      {hasDraft && !draftDismissed && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.22)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-amber-200/70 text-xs">Draft auto-saved</span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => resetForm()} className="text-xs text-amber-400/60 hover:text-amber-300 hover:bg-amber-400/10 px-2.5 py-1 rounded-lg transition-all">Clear</button>
            <button type="button" onClick={() => setDraftDismissed(true)} className="w-6 h-6 flex items-center justify-center rounded-lg text-amber-400/40 hover:text-amber-300 hover:bg-amber-400/10 transition-all" title="Dismiss"><X className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      )}

      {/* ── Submitting as ── */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl" style={{ background: t.badgeBgPrimary, border: t.borderColorLight }}>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.primaryFull }} />
        <span className="text-white/40 text-sm">Submitting as</span>
        <span className="font-semibold text-sm" style={{ color: t.primaryText }}>{currentOrg.name}</span>
      </div>

      {/* ── Basic Info ── */}
      <Section>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Basic Info</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-white/80 text-sm">Title <span className="text-red-400">*</span></Label>
            <Input
              onFocus={handleFocus} onBlur={handleBlur}
              value={formData.title}
              onChange={(e) => setField("title", e.target.value)}
              maxLength={LIMITS.title}
              style={inputStyle} className="text-white placeholder:text-white/20 rounded-xl"
              placeholder="AI Hackathon 2025"
            />
            <CharCount current={formData.title.length} max={LIMITS.title} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/80 text-sm">Description <span className="text-red-400">*</span></Label>
            <Textarea
              onFocus={handleFocus} onBlur={handleBlur}
              value={formData.des}
              onChange={(e) => setField("des", e.target.value)}
              maxLength={LIMITS.des}
              style={inputStyle} className="text-white placeholder:text-white/20 rounded-xl resize-none"
              rows={4} placeholder="Describe your competition..."
            />
            <CharCount current={formData.des.length} max={LIMITS.des} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-white/80 text-sm">Author <span className="text-red-400">*</span></Label>
              <Input
                onFocus={handleFocus} onBlur={handleBlur}
                value={formData.author}
                onChange={(e) => setField("author", e.target.value)}
                maxLength={LIMITS.author}
                style={inputStyle} className="text-white placeholder:text-white/20 rounded-xl"
              />
              <CharCount current={formData.author.length} max={LIMITS.author} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-white/80 text-sm">Open To</Label>
              <Input
                onFocus={handleFocus} onBlur={handleBlur}
                value={formData.open_to}
                onChange={(e) => setField("open_to", e.target.value)}
                maxLength={LIMITS.open_to}
                style={inputStyle} className="text-white placeholder:text-white/20 rounded-xl"
                placeholder="Students, Everyone"
              />
              <CharCount current={formData.open_to.length} max={LIMITS.open_to} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-white/80 text-sm">Countries</Label>
            <Input
              onFocus={handleFocus} onBlur={handleBlur}
              value={formData.countries}
              onChange={(e) => setField("countries", e.target.value)}
              maxLength={LIMITS.countries}
              style={inputStyle} className="text-white placeholder:text-white/20 rounded-xl"
              placeholder="Global, USA, Philippines"
            />
            <CharCount current={formData.countries.length} max={LIMITS.countries} />
          </div>
        </div>
      </Section>

      {/* ── Date & Time ── */}
      <Section>
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Date & Time</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <Label className="text-white/80 text-sm block mb-1.5">Start Date <span className="text-red-400">*</span></Label>
            <DatePicker selected={startDate} onChange={setStartDate} dateFormat="yyyy/MM/dd" customInput={<CalendarInput />} />
            <TimeSelect hour={startHour12} minute={startMinute} period={startPeriod} onHour={setStartHour12} onMinute={setStartMinute} onPeriod={setStartPeriod} />
          </div>
          <div>
            <Label className="text-white/80 text-sm block mb-1.5">End Date <span className="text-red-400">*</span></Label>
            <DatePicker selected={endDate} onChange={setEndDate} dateFormat="yyyy/MM/dd" customInput={<CalendarInput />} />
            <TimeSelect hour={endHour12} minute={endMinute} period={endPeriod} onHour={setEndHour12} onMinute={setEndMinute} onPeriod={setEndPeriod} />
          </div>
        </div>
      </Section>

      {/* ── Prize Pool ── */}
      <Section>
        <PrizePool prizes={prizes} setPrizes={setPrizes} onFocus={handleFocus} onBlur={handleBlur} />
      </Section>

      {/* ── Links ── */}
      <Section>
        <LinksSection links={links} setLinks={setLinks} inputStyle={inputStyle} onFocus={handleFocus} onBlur={handleBlur} hasError={linkError} onLinkAdded={() => setLinkError(false)} />
      </Section>

      {/* ── Submit ── */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full text-white border-0 rounded-xl h-11 text-sm font-semibold transition-all duration-300"
        style={{ background: isLoading ? t.badgeBgPrimary : t.buttonGradient, boxShadow: t.buttonShadow, opacity: isLoading ? 0.7 : 1 }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {retryCount > 1 ? `Retrying… (${retryCount}/${MAX_RETRIES})` : "Submitting…"}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Submit for Approval
          </span>
        )}
      </Button>
    </div>
  )
}