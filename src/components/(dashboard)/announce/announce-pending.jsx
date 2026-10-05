"use client"

import DatePicker from "@/components/DatePickerClient"
import { forwardRef, useState, useEffect, useRef } from "react"
import {
  Calendar, Clock, Trophy, Plus, X, Sparkles,
  Loader2, Link2, ChevronDown,
  Globe, Code2, FileSpreadsheet, ClipboardList,
  Search, Check, ChevronUp, ShieldCheck,
  MessageCircle, Megaphone, Gift, Banknote, Lock, Copy, RefreshCw,
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import {
  APPROVAL_BUFFER_DAYS, MIN_PROMO_DAYS, MIN_EVENT_DAYS,
  startOfDay, addDays, toDateTime, validateTimeline, formatDuration,
  CURRENCIES, getCurrency, parseAmount, formatMoney,
  CASH_TEMPLATES, ITEM_TEMPLATES,
  generateInviteCode, normalizeInviteCode, isValidInviteCode,
} from "@/lib/announcement-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PostingTermsDialog } from "@/components/terms-and-condition/posting-condition"

// ─── Constants ────────────────────────────────────────────────────────────────
const FALLBACK_THEME = buildTheme("#c026d3", "#db2777")
const t = FALLBACK_THEME

const STORAGE_KEY   = "pending_announce_form_draft"
const PRIZES_KEY    = "pending_announce_form_prizes"
const LINKS_KEY     = "pending_announce_form_links"
const COUNTRIES_KEY = "pending_announce_form_countries"

const MAX_RETRIES    = 5
const RETRY_DELAY_MS = 800

const LIMITS = {
  title:      80,
  des:        1000,
  author:     60,
  open_to:    80,
  prize_name: 40,
  prize_item: 60,
  prize_desc: 120,
}

const EMPTY_FORM = {
  title: "", des: "", author: "",
  open_to: "",
  color_scheme: "purple",
  prize_currency: "USD",
  is_invite_only: false,
  invite_code: "",
}

const newPrize = (over = {}) => ({ id: Date.now() + Math.random(), type: "cash", name: "", value: "", description: "", ...over })
const EMPTY_COUNTRIES = { mode: "global", list: [] }
const DEFAULT_TIME = { h: "12", m: "00", p: "AM" }

// ─── Country list ─────────────────────────────────────────────────────────────
const ALL_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda",
  "Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain",
  "Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso",
  "Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic",
  "Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica","Croatia","Cuba",
  "Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini",
  "Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana",
  "Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras",
  "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy",
  "Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan",
  "Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
  "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia",
  "Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
  "North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama",
  "Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar",
  "Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
  "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
  "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland",
  "Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor-Leste","Togo","Tonga",
  "Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia",
  "Zimbabwe",
]

// ─── Link type config ─────────────────────────────────────────────────────────
const LINK_TYPES = [
  { key: "website_link",         label: "Website",          placeholder: "https://yoursite.com",                                         icon: Globe,          color: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/25"     },
  { key: "dev_link",             label: "DevPost",          placeholder: "https://devpost.com/...",                                      icon: Code2,          color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/25"  },
  { key: "community_link",       label: "Community",        placeholder: "Discord, Telegram or WhatsApp invite link",                    icon: MessageCircle,  color: "text-indigo-400",  bg: "bg-indigo-400/10",  border: "border-indigo-400/25"  },
  { key: "google_sheet_csv_url", label: "Google Sheet CSV", placeholder: "https://docs.google.com/spreadsheets/d/e/.../pub?output=csv", icon: FileSpreadsheet,color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25" },
  { key: "google_forms_url",     label: "Google Forms",     placeholder: "https://forms.google.com/...",                                icon: ClipboardList,  color: "text-orange-400",  bg: "bg-orange-400/10",  border: "border-orange-400/25"  },
]

const RANK_STYLES = [
  { ring: "ring-1 ring-yellow-400/40", bg: "bg-gradient-to-br from-yellow-400/8 to-amber-500/4",  badge: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/30", glow: "shadow-[0_0_12px_rgba(251,191,36,0.12)]",  medal: "🥇" },
  { ring: "ring-1 ring-slate-400/40",  bg: "bg-gradient-to-br from-slate-400/8 to-slate-500/4",   badge: "bg-slate-400/15 text-slate-200 border border-slate-400/30",   glow: "shadow-[0_0_12px_rgba(148,163,184,0.10)]", medal: "🥈" },
  { ring: "ring-1 ring-amber-700/40",  bg: "bg-gradient-to-br from-amber-700/8 to-amber-800/4",   badge: "bg-amber-700/15 text-amber-400 border border-amber-700/30",   glow: "shadow-[0_0_12px_rgba(180,83,9,0.12)]",    medal: "🥉" },
]
const DEFAULT_RANK = { ring: "ring-1 ring-white/10", bg: "bg-white/[0.03]", badge: "bg-white/10 text-white/50 border border-white/15", glow: "", medal: null }

// ─── Helpers ──────────────────────────────────────────────────────────────────
const normalizePrize = (p) => {
  const type = p.type === "non_cash" ? "non_cash" : "cash"
  return { description: "", ...p, type, value: type === "cash" ? String(parseAmount(p.value) ?? "") : (p.value ?? "") }
}
const loadDraft     = () => { try { const s = localStorage.getItem(STORAGE_KEY);   return s ? { ...EMPTY_FORM, ...JSON.parse(s) } : { ...EMPTY_FORM } } catch { return { ...EMPTY_FORM } } }
const loadPrizes    = () => { try { const s = localStorage.getItem(PRIZES_KEY);    return s ? JSON.parse(s).map(normalizePrize) : [newPrize()] } catch { return [newPrize()] } }
const loadLinks     = () => { try { const s = localStorage.getItem(LINKS_KEY);     return s ? JSON.parse(s) : [] } catch { return [] } }
const loadCountries = () => { try { const s = localStorage.getItem(COUNTRIES_KEY); return s ? JSON.parse(s) : { ...EMPTY_COUNTRIES } } catch { return { ...EMPTY_COUNTRIES } } }
const saveDraft     = (d) => { try { localStorage.setItem(STORAGE_KEY,   JSON.stringify(d)) } catch {} }
const savePrizes    = (p) => { try { localStorage.setItem(PRIZES_KEY,    JSON.stringify(p)) } catch {} }
const saveLinks     = (l) => { try { localStorage.setItem(LINKS_KEY,     JSON.stringify(l)) } catch {} }
const saveCountries = (c) => { try { localStorage.setItem(COUNTRIES_KEY, JSON.stringify(c)) } catch {} }
const clearDraft    = ()  => { try {
  [STORAGE_KEY, PRIZES_KEY, LINKS_KEY, COUNTRIES_KEY].forEach(k => localStorage.removeItem(k))
} catch {} }

const COMMUNITY_DOMAINS = ["discord.gg", "discord.com", "t.me", "telegram.me", "chat.whatsapp.com", "wa.me"]
const isValidCommunityLink = (url) => {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    return COMMUNITY_DOMAINS.some(d => host === d || host.endsWith(`.${d}`))
  } catch { return false }
}

const PRIZE_INPUT_CLS = `
  h-8 text-sm bg-white border-slate-400 text-slate-900 placeholder:text-slate-500
  focus-visible:border-amber-500
  dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder:text-white/20
  dark:focus-visible:border-white/30
`

// ─── CharCount ────────────────────────────────────────────────────────────────
function CharCount({ current, max, uiT }) {
  const pct  = current / max
  const near = pct >= 0.85
  const over = current > max
  return (
    <div className="flex items-center justify-end gap-1.5 mt-1">
      <div className="h-0.5 w-12 rounded-full overflow-hidden" style={{ background: uiT?.borderBase ?? "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{ width: `${Math.min(pct * 100, 100)}%`, background: over ? "#f87171" : near ? "#fbbf24" : (uiT?.mutedText ?? "rgba(255,255,255,0.25)") }}
        />
      </div>
      <span className="text-[10px] tabular-nums transition-colors" style={{ color: over ? "#f87171" : near ? "#fbbf24" : (uiT?.mutedText ?? "rgba(255,255,255,0.22)") }}>
        {current}/{max}
      </span>
    </div>
  )
}

// ─── CalendarInput ────────────────────────────────────────────────────────────
const CalendarInput = forwardRef(
  ({ value, onClick, onInputClick, uiT }, ref) => (
    <div
      onClick={(e) => {
        if (onInputClick) {
          const shouldOpen = onInputClick(e)
          if (shouldOpen === false) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
        }
        if (onClick) onClick(e)
      }}
      ref={ref}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all"
      style={{
        background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
        border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`,
        color: uiT?.headingText ?? "#ffffff",
      }}
    >
      <span className="text-sm" style={{ color: value ? (uiT?.headingText ?? "#ffffff") : (uiT?.mutedText ?? "rgba(255,255,255,0.3)") }}>
        {value || "Select date"}
      </span>
      <Calendar className="w-4 h-4" style={{ color: uiT?.mutedText ?? "rgba(255,255,255,0.4)" }} />
    </div>
  )
)
CalendarInput.displayName = "CalendarInput"

// ─── TimeSelect ───────────────────────────────────────────────────────────────
// value = { h, m, p }, onChange receives a partial patch e.g. { h: "03" }
function TimeSelect({ value, onChange, uiT }) {
  const hourOpts   = ["01","02","03","04","05","06","07","08","09","10","11","12"]
  const minuteOpts = ["00","05","10","15","20","25","30","35","40","45","50","55"]
  const sel = {
    background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
    border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`,
    color: uiT?.headingText ?? "#fff",
    borderRadius: "0.6rem", padding: "0.4rem 0.5rem",
    fontSize: "0.8rem", outline: "none", cursor: "pointer",
  }
  const optBg = uiT?.inputBg ?? "#1a1a2e"
  return (
    <div className="flex items-center gap-1.5 mt-2">
      <select value={value.h} onChange={(e) => onChange({ h: e.target.value })} style={sel}>{hourOpts.map(h => <option key={h} style={{ background: optBg }}>{h}</option>)}</select>
      <span className="text-sm font-light" style={{ color: uiT?.mutedText ?? "rgba(255,255,255,0.3)" }}>:</span>
      <select value={value.m} onChange={(e) => onChange({ m: e.target.value })} style={sel}>{minuteOpts.map(m => <option key={m} style={{ background: optBg }}>{m}</option>)}</select>
      <select value={value.p} onChange={(e) => onChange({ p: e.target.value })} style={sel}>
        <option style={{ background: optBg }}>AM</option>
        <option style={{ background: optBg }}>PM</option>
      </select>
    </div>
  )
}

// ─── StageField (one date + time column of the schedule) ─────────────────────
function StageField({ icon: Icon, title, hint, accent, selected, onChange, minDate, time, onTime, gate, addToast, uiT }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${accent}22`, color: accent }}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        <Label className="text-sm font-semibold" style={{ color: uiT?.headingText }}>
          {title} <span className="text-red-400">*</span>
        </Label>
      </div>
      <p className="text-[11px] mb-2 leading-snug" style={{ color: uiT?.mutedText }}>{hint}</p>
      <DatePicker
        selected={selected}
        onChange={(d) => { if (gate) { addToast("error", gate); return } onChange(d) }}
        minDate={minDate}
        dateFormat="yyyy/MM/dd"
        customInput={
          <CalendarInput
            uiT={uiT}
            onInputClick={() => { if (gate) { addToast("error", gate); return false } return true }}
          />
        }
      />
      <TimeSelect value={time} onChange={onTime} uiT={uiT} />
    </div>
  )
}

// ─── TimelineSummary ──────────────────────────────────────────────────────────
function TimelineSummary({ promoAt, startAt, endAt, uiT }) {
  const reviewMs = APPROVAL_BUFFER_DAYS * 86400000
  const promoMs  = Math.max(startAt - promoAt, 0)
  const eventMs  = Math.max(endAt - startAt, 0)
  const segs = [
    { label: "Review",    ms: reviewMs, text: `≤ ${APPROVAL_BUFFER_DAYS} days`, color: "#f59e0b" },
    { label: "Promotion", ms: promoMs,  text: formatDuration(promoMs),         color: t.primaryFull },
    { label: "Hackathon", ms: eventMs,  text: formatDuration(eventMs),         color: "#10b981" },
  ]
  return (
    <div className="mt-5 p-3 rounded-xl" style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
      <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5">
        {segs.map(s => <div key={s.label} style={{ flex: Math.max(s.ms, 1), background: s.color }} />)}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2.5">
        {segs.map(s => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-[11px]" style={{ color: uiT?.mutedText }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
            {s.label}: <span style={{ color: uiT?.headingText }} className="font-semibold">{s.text}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── CountrySelector ─────────────────────────────────────────────────────────
const COUNTRY_MODE_CONFIG = {
  global:   { label: "Global",           sub: "Open to all countries",           icon: Globe,    accent: "text-sky-400",    ring: "ring-sky-400/50",    activeBg: "bg-sky-400/10"    },
  included: { label: "Select countries", sub: "Only listed countries can join",   icon: Check,    accent: "text-emerald-400",ring: "ring-emerald-400/50",activeBg: "bg-emerald-400/10"},
  excluded: { label: "Exclude countries",sub: "All except listed countries",      icon: X,        accent: "text-rose-400",   ring: "ring-rose-400/50",   activeBg: "bg-rose-400/10"   },
}

const COUNTRIES_PER_PAGE = 120

function CountrySelector({ value, onChange, hasError, uiT }) {
  const { mode, list } = value
  const [search, setSearch] = useState("")
  const [open, setOpen]     = useState(false)
  const dropRef = useRef(null)

  const filtered = ALL_COUNTRIES.filter(c =>
    c.toLowerCase().includes(search.toLowerCase()) && !list.includes(c)
  )
  const visible = search.trim() ? filtered : filtered.slice(0, COUNTRIES_PER_PAGE)

  const setMode      = (m) => onChange({ mode: m, list: m === "global" ? [] : list })
  const addCountry   = (c) => { onChange({ mode, list: [...list, c] }); setSearch("") }
  const removeCountry= (c) => onChange({ mode, list: list.filter(x => x !== c) })

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const needsCountries = mode !== "global"
  const isError = hasError && needsCountries && list.length === 0

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(COUNTRY_MODE_CONFIG).map(([key, cfg]) => {
          const Icon = cfg.icon
          const active = mode === key
          return (
            <button
              key={key} type="button"
              onClick={() => setMode(key)}
              className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-center transition-all ${
                active ? `${cfg.activeBg} ring-1 ${cfg.ring} border-transparent` : "border-transparent"
              }`}
              style={!active ? { background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.08)" } : {}}
            >
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${active ? cfg.accent : ""}`}
                style={{ color: active ? undefined : uiT?.mutedText, background: active ? "rgba(255,255,255,0.08)" : uiT?.inlineBg ?? "rgba(255,255,255,0.04)" }}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className={`text-[11px] font-semibold leading-tight transition-colors ${active ? "text-white" : ""}`}
                style={{ color: active ? undefined : uiT?.mutedText }}>{cfg.label}</span>
              <span className={`text-[9px] leading-tight transition-colors ${active ? "text-white/50" : ""}`}
                style={{ color: active ? undefined : uiT?.mutedText, opacity: active ? 0.5 : 0.6 }}>{cfg.sub}</span>
            </button>
          )
        })}
      </div>

      {needsCountries && (
        <div className="space-y-2">
          {list.length > 0 && (
            <div className="flex flex-wrap gap-1.5 p-2.5 rounded-xl"
              style={{ background: uiT?.surfaceBg ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
              {list.map(c => (
                <span key={c} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                  mode === "included"
                    ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/25"
                    : "bg-rose-400/10 text-rose-300 border-rose-400/25"
                }`}>
                  {c}
                  <button type="button" onClick={() => removeCountry(c)} className="ml-0.5 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div ref={dropRef} className="relative">
            <div
              onClick={() => setOpen(p => !p)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${isError ? "ring-1 ring-red-400/50" : ""}`}
              style={{
                background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
                border: `1px solid ${isError ? "rgba(239,68,68,0.4)" : (uiT?.borderSubtle ?? "rgba(255,255,255,0.12)")}`,
              }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: uiT?.mutedText ?? "rgba(255,255,255,0.3)" }} />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                placeholder={`Search and add ${mode === "included" ? "allowed" : "excluded"} countries…`}
                className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-40"
                style={{ color: uiT?.headingText ?? "#ffffff" }}
              />
              {open
                ? <ChevronUp  className="w-3.5 h-3.5 shrink-0" style={{ color: uiT?.mutedText }} />
                : <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: uiT?.mutedText }} />
              }
            </div>

            {open && visible.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                style={{
                  background: uiT?.cardBg ?? "rgba(15,15,25,0.97)",
                  border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`,
                  boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
                }}
              >
                {visible.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => { addCountry(c); setOpen(false) }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-all"
                    style={{ color: uiT?.bodyText ?? "rgba(255,255,255,0.7)" }}
                    onMouseEnter={e => e.currentTarget.style.background = uiT?.surfaceBg2 ?? "rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <Globe className="w-3 h-3 shrink-0" style={{ color: uiT?.mutedText }} />
                    {c}
                  </button>
                ))}
                {!search.trim() && filtered.length > COUNTRIES_PER_PAGE && (
                  <p className="px-3 py-2 text-[11px] text-center" style={{ color: uiT?.mutedText, borderTop: `1px solid ${uiT?.borderBase}` }}>
                    Type to search all {filtered.length} remaining countries
                  </p>
                )}
              </div>
            )}
          </div>

          {isError && (
            <p className="text-xs text-red-400/70 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
              Please select at least one country for this mode.
            </p>
          )}

          {list.length > 0 && (
            <p className="text-[11px]" style={{ color: uiT?.mutedText }}>
              {mode === "included"
                ? `${list.length} countr${list.length === 1 ? "y" : "ies"} allowed`
                : `${list.length} countr${list.length === 1 ? "y" : "ies"} excluded · all others can join`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── LinksSection ─────────────────────────────────────────────────────────────
function LinksSection({ links, setLinks, onFocus, onBlur, hasError, onLinkAdded, uiT }) {
  const [showDropdown, setShowDropdown] = useState(false)
  const addLink    = (e, typeKey) => { e.preventDefault(); setLinks(prev => [...prev, { id: Date.now(), typeKey, value: "" }]); setShowDropdown(false); if (onLinkAdded) onLinkAdded() }
  const removeLink = (e, id)      => { e.preventDefault(); setLinks(prev => prev.filter(l => l.id !== id)) }
  const updateLink = (id, value)  => setLinks(prev => prev.map(l => l.id === id ? { ...l, value } : l))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <Label style={{ color: uiT?.headingText }} className="font-semibold">
            Links <span className="text-red-400">*</span>
          </Label>
          {links.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-300 dark:bg-white/5 dark:text-white/70 dark:border-white/10">
              {links.length}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowDropdown((p) => !p) }}
            className="
              flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all
              bg-blue-50 border-blue-300 text-blue-700
              hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800
              dark:bg-white/5 dark:border-white/10 dark:text-white/70
              dark:hover:bg-white/10 dark:hover:text-white
            "
          >
            <Plus className="w-3.5 h-3.5" />
            Add Link
            <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden min-w-[180px] bg-white border border-slate-300 shadow-xl dark:bg-[rgba(15,15,25,0.95)] dark:border-white/10">
              {LINK_TYPES.map((lt) => {
                const Icon = lt.icon
                return (
                  <button
                    key={lt.key}
                    type="button"
                    onClick={(e) => addLink(e, lt.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left transition-all hover:bg-slate-100 dark:hover:bg-white/5 ${lt.color}`}
                  >
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center ${lt.bg}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-slate-700 dark:text-white/80">{lt.label}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {links.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-6 rounded-xl border-dashed border text-center transition-all"
          style={{
            background: hasError ? "rgba(239,68,68,0.06)" : undefined,
            borderColor: hasError ? "rgba(239,68,68,0.35)" : undefined,
          }}
        >
          <Link2 className={`w-5 h-5 mb-2 ${hasError ? "text-red-400" : "text-slate-500 dark:text-slate-400"}`} />
          <p className={`text-xs ${hasError ? "text-red-500" : "text-slate-600 dark:text-slate-400"}`}>
            {hasError ? "At least one link is required." : 'No links added yet. Click "Add Link" to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => {
            const cfg = LINK_TYPES.find((lt) => lt.key === link.typeKey) || LINK_TYPES[0]
            const Icon = cfg.icon
            return (
              <div
                key={link.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cfg.border} transition-all`}
                style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)" }}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-medium mb-0.5 ${cfg.color}`}>{cfg.label}</p>
                  <Input
                    onFocus={onFocus}
                    onBlur={onBlur}
                    type="url"
                    value={link.value}
                    onChange={(e) => updateLink(link.id, e.target.value)}
                    placeholder={cfg.placeholder}
                    className="
                      h-7 text-xs px-0 border-0 bg-transparent
                      text-slate-900 placeholder:text-slate-400
                      focus-visible:ring-0 focus-visible:ring-offset-0
                      dark:text-white dark:placeholder:text-white/25
                    "
                    style={{ color: uiT?.headingText, boxShadow: "none" }}
                  />
                </div>
                <button
                  type="button"
                  onClick={(e) => removeLink(e, link.id)}
                  className="
                    shrink-0 w-6 h-6 rounded-lg flex items-center justify-center
                    text-slate-500 hover:text-red-500 hover:bg-red-100
                    dark:text-white/60 dark:hover:text-red-400 dark:hover:bg-red-400/10
                    transition-all
                  "
                >
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
function PrizePool({ prizes, setPrizes, currency, setCurrency, onFocus, onBlur, uiT }) {
  const cur = getCurrency(currency)
  const addPrize      = (e)              => { e.preventDefault(); setPrizes(prev => [...prev, newPrize()]) }
  const removePrize   = (e, id)          => { e.preventDefault(); prizes.length > 1 && setPrizes(prev => prev.filter(p => p.id !== id)) }
  const updatePrize   = (id, patch)      => setPrizes(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  const setType       = (id, type)       => setPrizes(prev => prev.map(p => p.id === id && p.type !== type ? { ...p, type, value: "" } : p))
  const applyTemplate = (e, tmpl)        => {
    e.preventDefault()
    const filled = { type: tmpl.value ? "non_cash" : "cash", name: tmpl.name, value: tmpl.value ?? "" }
    const emptyIdx = prizes.findIndex(p => !p.name && !p.value)
    if (emptyIdx !== -1) setPrizes(prev => prev.map((p, i) => i === emptyIdx ? { ...p, ...filled } : p))
    else setPrizes(prev => [...prev, newPrize(filled)])
  }

  const cashTotal = prizes.reduce((acc, p) => p.type === "cash" ? acc + (parseAmount(p.value) ?? 0) : acc, 0)
  const itemCount = prizes.filter(p => p.type === "non_cash" && p.value.trim()).length

  const chipCls = `
    flex items-center gap-1 px-2 py-1 rounded-md text-[11px]
    border border-amber-300 bg-amber-50 text-amber-800 transition-all
    hover:bg-amber-200 hover:text-amber-900 hover:border-amber-500
    dark:border-white/10 dark:bg-white/5 dark:text-white
    dark:hover:bg-amber-400/10 dark:hover:text-amber-300 dark:hover:border-amber-400/25
  `

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-200 dark:bg-amber-400/15 border border-amber-500 dark:border-amber-400/25 flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <Label className="font-semibold leading-none" style={{ color: uiT?.headingText }}>
              Prize Pool <span className="text-red-400">*</span>
            </Label>
            {(cashTotal > 0 || itemCount > 0) && (
              <p className="text-xs text-amber-700 dark:text-amber-400/70 mt-0.5">
                {cashTotal > 0 && <>≈ {formatMoney(cashTotal, currency)} cash</>}
                {cashTotal > 0 && itemCount > 0 && " + "}
                {itemCount > 0 && <>{itemCount} non-cash prize{itemCount !== 1 ? "s" : ""}</>}
              </p>
            )}
          </div>
        </div>

        <div className="shrink-0">
          <p className="text-[9px] font-medium uppercase tracking-widest mb-1 text-right" style={{ color: uiT?.mutedText }}>Currency</p>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="text-xs rounded-lg px-2 py-1.5 outline-none cursor-pointer max-w-[170px]"
            style={{
              background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
              border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`,
              color: uiT?.headingText ?? "#fff",
            }}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code} style={{ background: uiT?.inputBg ?? "#1a1a2e" }}>
                {c.code} — {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="p-3 rounded-xl space-y-2.5"
        style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-700 dark:text-amber-400" />
          <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: uiT?.mutedText }}>Quick templates</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CASH_TEMPLATES.map(tmpl => (
            <button key={tmpl.name} type="button" onClick={(e) => applyTemplate(e, tmpl)} className={chipCls}>
              <Banknote className="w-3 h-3 opacity-60" />{tmpl.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ITEM_TEMPLATES.map(tmpl => (
            <button key={tmpl.name} type="button" onClick={(e) => applyTemplate(e, tmpl)} className={chipCls}>
              <Gift className="w-3 h-3 opacity-60" />{tmpl.name}
              <span className="text-[10px] opacity-70">{tmpl.value}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {prizes.map((prize, index) => {
          const rank   = RANK_STYLES[index] || DEFAULT_RANK
          const isCash = prize.type === "cash"
          return (
            <div key={prize.id} className={`rounded-xl overflow-hidden ${rank.ring} ${rank.glow} transition-all`}>
              <div className={`px-4 py-3 ${rank.bg}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-1 ${rank.badge}`}>
                    {rank.medal ?? `#${index + 1}`}
                  </span>

                  <div className="flex-1 space-y-2">
                    {/* type toggle */}
                    <div className="inline-flex rounded-lg p-0.5 gap-0.5" style={{ background: uiT?.inlineBg ?? "rgba(255,255,255,0.05)" }}>
                      {[["cash", Banknote, "Cash"], ["non_cash", Gift, "Item / voucher"]].map(([key, Icon, label]) => (
                        <button
                          key={key} type="button"
                          onClick={() => setType(prize.id, key)}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                            prize.type === key
                              ? "bg-amber-400/20 text-amber-700 dark:text-amber-300"
                              : "text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
                          }`}
                        >
                          <Icon className="w-3 h-3" />{label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[9px] font-medium uppercase tracking-widest mb-1" style={{ color: uiT?.mutedText }}>Prize Name</p>
                        <Input
                          onFocus={onFocus} onBlur={onBlur}
                          value={prize.name}
                          onChange={(e) => updatePrize(prize.id, { name: e.target.value.slice(0, LIMITS.prize_name) })}
                          placeholder="e.g. 1st Place"
                          maxLength={LIMITS.prize_name}
                          className={PRIZE_INPUT_CLS}
                          style={{ borderRadius: "0.5rem", color: uiT?.headingText }}
                        />
                        <CharCount current={prize.name.length} max={LIMITS.prize_name} uiT={uiT} />
                      </div>

                      <div>
                        <p className="text-[9px] font-medium uppercase tracking-widest mb-1" style={{ color: uiT?.mutedText }}>
                          {isCash ? `Amount (${cur.code})` : "Prize"}
                        </p>
                        <div className="relative">
                          {isCash && (
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: uiT?.mutedText }}>
                              {cur.symbol}
                            </span>
                          )}
                          <Input
                            onFocus={onFocus} onBlur={onBlur}
                            value={prize.value}
                            inputMode={isCash ? "decimal" : "text"}
                            onChange={(e) => updatePrize(prize.id, {
                              value: isCash
                                ? e.target.value.replace(/[^0-9.]/g, "").slice(0, 15)
                                : e.target.value.slice(0, LIMITS.prize_item),
                            })}
                            placeholder={isCash ? "5000" : "e.g. MacBook Air, $50 Steam voucher"}
                            className={PRIZE_INPUT_CLS}
                            style={{
                              borderRadius: "0.5rem", color: uiT?.headingText,
                              paddingLeft: isCash ? `${0.7 + cur.symbol.length * 0.6}rem` : undefined,
                            }}
                          />
                        </div>
                        {!isCash && <CharCount current={prize.value.length} max={LIMITS.prize_item} uiT={uiT} />}
                      </div>
                    </div>

                    <Input
                      onFocus={onFocus} onBlur={onBlur}
                      value={prize.description ?? ""}
                      onChange={(e) => updatePrize(prize.id, { description: e.target.value.slice(0, LIMITS.prize_desc) })}
                      placeholder="Optional note (e.g. “shipped worldwide”, “redeemable on any store”)"
                      className={PRIZE_INPUT_CLS}
                      style={{ borderRadius: "0.5rem", color: uiT?.headingText }}
                    />
                  </div>

                  {prizes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => removePrize(e, prize.id)}
                      className="
                        shrink-0 w-7 h-7 rounded-lg flex items-center justify-center mt-0.5
                        text-slate-500 hover:text-red-500 hover:bg-red-100 transition-all
                        dark:text-white/60 dark:hover:text-red-400 dark:hover:bg-red-400/10
                      "
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

      <button
        type="button"
        onClick={addPrize}
        className="
          w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
          border border-dashed border-amber-300 dark:border-amber-500/25
          text-amber-600 dark:text-amber-400/60
          hover:text-amber-700 dark:hover:text-amber-300
          hover:bg-amber-100 dark:hover:bg-amber-500/8
          hover:border-amber-400 dark:hover:border-amber-500/40
          text-sm transition-all
        "
      >
        <Plus className="w-4 h-4" />
        Add Prize
      </button>
    </div>
  )
}

// ─── InviteOnlySection ────────────────────────────────────────────────────────
function InviteOnlySection({ enabled, code, onToggle, onCode, hasError, uiT }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch {}
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-indigo-400/15 border border-indigo-400/25">
            <Lock className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-300" />
          </div>
          <div>
            <Label className="font-semibold leading-none" style={{ color: uiT?.headingText }}>Invite only</Label>
            <p className="text-[11px] mt-0.5" style={{ color: uiT?.mutedText }}>
              Participants must enter an invite code before they can see your registration links.
            </p>
          </div>
        </div>
        <button
          type="button" role="switch" aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${enabled ? "bg-indigo-500" : "bg-slate-300 dark:bg-white/15"}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-4" : ""}`} />
        </button>
      </div>

      {enabled && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={code}
              onChange={(e) => onCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 17))}
              placeholder="Invite code"
              spellCheck={false}
              autoComplete="off"
              className="rounded-xl font-mono tracking-widest text-sm"
              style={{
                background: uiT?.inputBg ?? "rgba(255,255,255,0.06)",
                borderColor: hasError ? "rgba(239,68,68,0.5)" : (uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"),
                color: uiT?.headingText ?? "#fff",
              }}
            />
            <button
              type="button" onClick={() => onCode(generateInviteCode())} title="Generate a random code"
              className="shrink-0 h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs border transition-all hover:opacity-80"
              style={{ borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)", color: uiT?.headingText, background: uiT?.surfaceBg2 }}
            >
              <RefreshCw className="w-3.5 h-3.5" /> Generate
            </button>
            <button
              type="button" onClick={copy} disabled={!code} title="Copy code"
              className="shrink-0 h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs border transition-all hover:opacity-80 disabled:opacity-40"
              style={{ borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)", color: uiT?.headingText, background: uiT?.surfaceBg2 }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          {hasError && (
            <p className="text-xs text-red-400/80 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-red-400 inline-block" />
              Use 6–16 letters or numbers (dashes are ignored).
            </p>
          )}
          <p className="text-[11px] leading-relaxed" style={{ color: uiT?.mutedText }}>
            Save this code now and share it only with the people you invite. Once your announcement is approved
            it is stored encrypted, so it can’t be shown to you again.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── TermsCheckbox ────────────────────────────────────────────────────────────
function TermsCheckbox({ checked, onChange, hasError, addToast, uiT }) {
  return (
    <div
      className="flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer select-none"
      style={{
        background: hasError
          ? "rgba(239,68,68,0.05)"
          : checked
            ? (uiT?.surfaceBg2 ?? "rgba(255,255,255,0.04)")
            : (uiT?.surfaceBg ?? "rgba(255,255,255,0.025)"),
        borderColor: hasError
          ? "rgba(239,68,68,0.30)"
          : checked
            ? (uiT?.borderMid ?? "rgba(255,255,255,0.15)")
            : (uiT?.borderBase ?? "rgba(255,255,255,0.08)"),
      }}
      onClick={() => onChange(!checked)}
    >
      <div className={`w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center border transition-all ${
        checked
          ? "bg-fuchsia-500 border-fuchsia-500"
          : hasError
            ? "bg-red-400/10 border-red-400/50"
            : ""
      }`}
        style={!checked && !hasError ? { background: uiT?.inlineBg, borderColor: uiT?.borderMid } : {}}>
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <p className="text-sm leading-relaxed transition-colors"
          style={{ color: checked ? (uiT?.bodyText ?? "rgba(255,255,255,0.8)") : (uiT?.mutedText ?? "rgba(255,255,255,0.5)") }}>
          I confirm that the information provided is accurate and I agree to the{" "}
          <PostingTermsDialog trigger={
            <button type="button" className="cursor-pointer underline underline-offset-2 text-purple-400/70 hover:text-purple-200 transition-colors">
              Submission Guidelines
            </button>
          } />.
        </p>
        {hasError && (
          <p className="text-xs text-red-400/80 mt-1.5 flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-red-400 inline-block shrink-0" />
            You must accept the terms to submit.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({ children, className = "", uiT }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: uiT?.surfaceBg ?? "rgba(255,255,255,0.03)",
        border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}`,
      }}
    >
      {children}
    </div>
  )
}

// ─── ReviewDialog (pre-submission checklist) ─────────────────────────────────
const fmtLocal = (iso) => new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
const fmtUTC   = (iso) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false, timeZone: "UTC" }).format(new Date(iso)) + " UTC"

function ReviewDialog({ open, onOpenChange, payload, checks, setChecks, onConfirm, uiT }) {
  if (!payload) return null
  const checklist = [
    { key: "info",   label: "The title, description, author and eligibility are accurate." },
    { key: "dates",  label: `The dates and times are correct. I understand promotion can’t go live until approved (up to ${APPROVAL_BUFFER_DAYS} days).` },
    { key: "prizes", label: "The prizes (amounts, currency and items) are real and will be honored." },
    { key: "links",  label: "My links work and point to the right pages." },
    ...(payload.is_invite_only ? [{ key: "invite", label: "I’ve saved the invite code and know who I’ll share it with." }] : []),
    { key: "review", label: "I understand the super admin may approve, reject or ask for changes." },
  ]
  const done = checklist.filter(c => checks[c.key]).length
  const allChecked = done === checklist.length
  const linkCount = ["website_link", "dev_link", "community_link", "google_sheet_csv_url", "google_forms_url"].filter(k => payload[k]).length

  const row = (label, value) => (
    <div className="flex gap-3 py-2 text-sm">
      <span className="w-28 shrink-0 text-xs pt-0.5" style={{ color: uiT?.mutedText ?? "rgba(255,255,255,0.5)" }}>{label}</span>
      <span className="min-w-0 break-words" style={{ color: uiT?.headingText ?? "#fff" }}>{value}</span>
    </div>
  )
  const when = (iso) => (<>{fmtLocal(iso)} <span className="text-xs opacity-60">· {fmtUTC(iso)}</span></>)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-xl max-h-[90vh] overflow-y-auto"
        style={{ background: uiT?.cardBg ?? "#12121c", border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.12)"}`, borderRadius: "20px" }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: uiT?.headingText ?? "#fff" }}>Review before sending</DialogTitle>
          <DialogDescription style={{ color: uiT?.mutedText }}>
            Confirm everything below. Once submitted, the super admin reviews it and you can’t edit it while pending.
          </DialogDescription>
        </DialogHeader>

        {/* Summary */}
        <div className="rounded-xl px-4 py-2 divide-y"
          style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.03)", border: `1px solid ${uiT?.borderBase ?? "rgba(255,255,255,0.07)"}` }}>
          {row("Title", <span className="font-semibold">{payload.title}</span>)}
          {row("Organization", payload.organization)}
          {row("Open to", `${payload.open_to} · ${payload.countries}`)}
          {row("Promotion", when(payload.promo_begin))}
          {row("Hackathon", <>{when(payload.date_begin)}<br />→ {when(payload.date_end)}</>)}
          {row("Prizes", (
            <ul className="space-y-0.5">
              {payload.prizes.map((p, i) => (
                <li key={i}>
                  {p.name}: <span className="font-semibold">{p.value}</span>
                  {p.type === "non_cash" && <span className="text-xs opacity-60"> (item)</span>}
                </li>
              ))}
            </ul>
          ))}
          {row("Access", payload.is_invite_only
            ? <>Invite only · code <span className="font-mono tracking-widest font-semibold">{payload.invite_code}</span></>
            : "Public")}
          {row("Links", `${linkCount} added`)}
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: uiT?.mutedText }}>Checklist</p>
            <span className="text-xs tabular-nums" style={{ color: allChecked ? "#10b981" : uiT?.mutedText }}>{done}/{checklist.length}</span>
          </div>
          {checklist.map(c => {
            const on = !!checks[c.key]
            return (
              <button
                key={c.key} type="button"
                onClick={() => setChecks(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                className="w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all"
                style={{
                  background: on ? (uiT?.surfaceBg2 ?? "rgba(255,255,255,0.04)") : "transparent",
                  borderColor: on ? "rgba(16,185,129,0.4)" : (uiT?.borderBase ?? "rgba(255,255,255,0.08)"),
                }}
              >
                <span className={`w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center border ${on ? "bg-emerald-500 border-emerald-500" : ""}`}
                  style={!on ? { borderColor: uiT?.borderMid ?? "rgba(255,255,255,0.25)" } : {}}>
                  {on && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </span>
                <span className="text-sm leading-relaxed" style={{ color: on ? (uiT?.bodyText ?? "rgba(255,255,255,0.85)") : (uiT?.mutedText ?? "rgba(255,255,255,0.55)") }}>
                  {c.label}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <Button type="button" variant="outline" className="flex-1 rounded-xl h-10" onClick={() => onOpenChange(false)}>
            Back to edit
          </Button>
          <Button
            type="button" disabled={!allChecked} onClick={onConfirm}
            className="flex-1 text-white border-0 rounded-xl h-10 font-semibold disabled:opacity-40"
            style={{ background: t.buttonGradient, boxShadow: allChecked ? t.buttonShadow : "none" }}
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            Confirm &amp; send to super admin
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
// uiT is the UI theme token object from the parent dashboard (buildUiTheme(isDark)).
// It is optional — when omitted the component falls back to original dark-mode styling.
export default function PendingAnnounceForm({ onSuccess, currentOrg, authUserId, addToast, uiT }) {
  const [isLoading, setIsLoading]           = useState(false)
  const [retryCount, setRetryCount]         = useState(0)
  const [hasDraft, setHasDraft]             = useState(false)
  const [draftDismissed, setDraftDismissed] = useState(false)
  const [formData, setFormData]             = useState(() => loadDraft())
  const [prizes, setPrizes]                 = useState(() => loadPrizes())
  const [links, setLinks]                   = useState(() => loadLinks())
  const [countries, setCountries]           = useState(() => loadCountries())
  const [linkError, setLinkError]           = useState(false)
  const [countriesError, setCountriesError] = useState(false)
  const [inviteError, setInviteError]       = useState(false)
  const [termsAccepted, setTermsAccepted]   = useState(false)
  const [termsError, setTermsError]         = useState(false)
  const [reviewOpen, setReviewOpen]         = useState(false)
  const [checks, setChecks]                 = useState({})
  const [pendingPayload, setPendingPayload] = useState(null)

  // Schedule: review (fixed buffer) → promotion → hackathon
  const [promoDate, setPromoDate] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate,   setEndDate]   = useState(null)
  const [times, setTimes] = useState({ promo: DEFAULT_TIME, start: DEFAULT_TIME, end: DEFAULT_TIME })
  const setTime = (key, patch) => setTimes(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))

  useEffect(() => {
    saveDraft(formData)
    setHasDraft(Object.entries(formData).some(([k, v]) => v && v !== EMPTY_FORM[k]))
  }, [formData])
  useEffect(() => { savePrizes(prizes)       }, [prizes])
  useEffect(() => { saveLinks(links)         }, [links])
  useEffect(() => { saveCountries(countries) }, [countries])

  const resetForm = () => {
    clearDraft()
    setFormData({ ...EMPTY_FORM })
    setPrizes([newPrize()])
    setLinks([])
    setCountries({ ...EMPTY_COUNTRIES })
    setPromoDate(null); setStartDate(null); setEndDate(null)
    setTimes({ promo: DEFAULT_TIME, start: DEFAULT_TIME, end: DEFAULT_TIME })
    setHasDraft(false); setDraftDismissed(false)
    setTermsAccepted(false)
    setLinkError(false); setCountriesError(false); setInviteError(false)
  }

  const setField = (field, raw) => {
    const limit = LIMITS[field]
    setFormData(prev => ({ ...prev, [field]: limit ? raw.slice(0, limit) : raw }))
  }

  const setInviteOnly = (on) => setFormData(prev => ({
    ...prev,
    is_invite_only: on,
    invite_code: on ? (prev.invite_code || generateInviteCode()) : "",
  }))
  const setInviteCode = (code) => { setFormData(prev => ({ ...prev, invite_code: code })); setInviteError(false) }

  // ── Schedule handlers (later dates are cleared if they stop being valid) ──
  const onPromoChange = (d) => {
    setPromoDate(d)
    if (d && startDate && startOfDay(startDate) < addDays(startOfDay(d), MIN_PROMO_DAYS)) {
      setStartDate(null); setEndDate(null)
      addToast("error", `Hackathon dates were cleared — the start must be at least ${MIN_PROMO_DAYS} days after promotion begins.`)
    }
  }
  const onStartChange = (d) => {
    setStartDate(d)
    if (d && endDate && startOfDay(endDate) < addDays(startOfDay(d), MIN_EVENT_DAYS)) {
      setEndDate(null)
      addToast("error", "End date was cleared — it must be after the new start date.")
    }
  }

  const promoAt = promoDate ? toDateTime(promoDate, times.promo) : null
  const startAt = startDate ? toDateTime(startDate, times.start) : null
  const endAt   = endDate   ? toDateTime(endDate,   times.end)   : null

  // Input style — adapts to uiT when provided
  const inputStyle = {
    background:  uiT?.inputBg    ?? "rgba(255,255,255,0.06)",
    borderColor: uiT?.borderSubtle ?? "rgba(255,255,255,0.12)",
    color:       uiT?.headingText  ?? "#ffffff",
  }

  const handleFocus = (e) => {
    e.target.style.borderColor = t.primaryFull
    e.target.style.boxShadow   = `0 0 0 2px ${t.primaryFull}35, 0 4px 18px ${t.primaryFull}20`
  }
  const handleBlur = (e) => {
    e.target.style.borderColor = uiT?.borderSubtle ?? "rgba(255,255,255,0.10)"
    e.target.style.boxShadow   = "none"
  }

  const serializeCountries = () => {
    if (countries.mode === "global") return "Global"
    if (countries.list.length === 0)  return null
    const prefix = countries.mode === "included" ? "Only: " : "Excluded: "
    return prefix + countries.list.join(", ")
  }

  const handleSubmit = async () => {
    if (!currentOrg || !authUserId) { addToast("error", "Organization not found. Please refresh."); return }

    const errors = []
    const currency = formData.prize_currency

    // required text
    if (!formData.title || !formData.des || !formData.author || !formData.open_to)
      errors.push("Please fill in all required fields.")

    // schedule
    if (!promoAt || !startAt || !endAt) errors.push("Please set the promotion, start and end dates.")
    else {
      const timelineError = validateTimeline(promoAt, startAt, endAt)
      if (timelineError) errors.push(timelineError)
    }

    // prizes
    const validPrizes = prizes.filter(p => p.name.trim() && String(p.value).trim())
    if (validPrizes.length === 0) errors.push("Please add at least one prize with a name and value.")
    else if (validPrizes.some(p => p.type === "cash" && !(parseAmount(p.value) > 0)))
      errors.push("Cash prizes need an amount greater than zero.")

    // links
    const filledLinks = links.filter(l => l.value.trim())
    if (filledLinks.length === 0) { setLinkError(true); errors.push("Please add at least one link.") }
    else setLinkError(false)

    const badCommunityLink = filledLinks.find(l => l.typeKey === "community_link" && !isValidCommunityLink(l.value.trim()))
    if (badCommunityLink) errors.push("Community link must be a Discord, Telegram, or WhatsApp link.")

    // countries
    if (countries.mode !== "global" && countries.list.length === 0) { setCountriesError(true); errors.push("Please select at least one country.") }
    else setCountriesError(false)

    // invite code
    if (formData.is_invite_only && !isValidInviteCode(formData.invite_code)) { setInviteError(true); errors.push("Please set a valid invite code (6–16 letters or numbers).") }
    else setInviteError(false)

    // terms
    if (!termsAccepted) { setTermsError(true); errors.push("Please accept the terms and conditions.") }
    else setTermsError(false)

    if (errors.length) { errors.slice(0, 3).forEach(m => addToast("error", m)); return }

    const linkFields = {}
    filledLinks.forEach(l => { linkFields[l.typeKey] = l.value.trim() })

    const payloadPrizes = validPrizes.map(p => {
      const base = { name: p.name.trim(), description: (p.description || "").trim() }
      if (p.type === "cash") {
        const amount = parseAmount(p.value)
        return { ...base, type: "cash", amount, currency, value: formatMoney(amount, currency) }
      }
      return { ...base, type: "non_cash", value: p.value.trim() }
    })

    const payload = {
      title:                formData.title.trim(),
      des:                  formData.des.trim(),
      author:               formData.author.trim(),
      promo_begin:          promoAt.toISOString(),
      date_begin:           startAt.toISOString(),
      date_end:             endAt.toISOString(),
      open_to:              formData.open_to.trim(),
      countries:            serializeCountries(),
      prizes:               payloadPrizes,
      prize_currency:       currency,
      is_invite_only:       formData.is_invite_only,
      invite_code:          formData.is_invite_only ? normalizeInviteCode(formData.invite_code) : null,
      website_link:         linkFields.website_link         || null,
      dev_link:             linkFields.dev_link             || null,
      community_link:       linkFields.community_link       || null,
      color_scheme:         formData.color_scheme,
      organization:         currentOrg.name,
      organization_id:      currentOrg.id,
      tracking_method:      "automatic",
      google_sheet_csv_url: linkFields.google_sheet_csv_url || null,
      google_forms_url:     linkFields.google_forms_url     || null,
      status:               "pending",
      submitted_by:         authUserId,
    }

    // Validation passed — open the review dialog; the insert happens in confirmSubmit().
    setPendingPayload(payload)
    setChecks({})
    setReviewOpen(true)
  }

  const confirmSubmit = async () => {
    const payload = pendingPayload
    if (!payload) return
    setReviewOpen(false)
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
        resetForm()
        addToast("success", "Submitted for approval! The super admin will review your announcement.")
        setIsLoading(false); setRetryCount(0)
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

  if (!currentOrg) {
    return (
      <div className="rounded-xl p-12 text-center"
        style={{ background: uiT?.surfaceBg2 ?? "rgba(255,255,255,0.05)", border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.10)"}` }}>
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: t.primaryText }} />
        <p style={{ color: uiT?.mutedText ?? t.mutedText }}>Loading organization…</p>
      </div>
    )
  }

  const labelColor = uiT?.mutedText ?? "rgba(255,255,255,0.6)"

  return (
    <div style={t.cssVars} className="space-y-4">
      {/* ── Pending notice ── */}
      <div
        className="flex items-start gap-2.5 p-3.5 rounded-xl"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}
      >
        <Clock className="w-4 h-4 text-amber-800 dark:text-amber-300 shrink-0 mt-0.5" />
        <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
          This submission will be{" "}
          <span className="font-medium">reviewed by the super admin</span>{" "}
          before going live. Allow up to {APPROVAL_BUFFER_DAYS} days for approval — your promotion can’t start sooner.
        </p>
      </div>

      {/* ── Auto-save draft indicator ── */}
      {hasDraft && !draftDismissed && (
        <div
          className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl"
          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.22)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-amber-800 dark:text-amber-300 text-xs">Draft auto-saved</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button" onClick={() => resetForm()}
              className="text-xs text-amber-400/60 hover:text-amber-300 hover:bg-amber-400/10 px-2.5 py-1 rounded-lg transition-all"
            >
              Clear
            </button>
            <button
              type="button" onClick={() => setDraftDismissed(true)} title="Dismiss"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-amber-400/40 hover:text-amber-300 hover:bg-amber-400/10 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Submitting as ── */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
        style={{
          background: uiT?.surfaceBg2 ?? t.badgeBgPrimary,
          border: `1px solid ${uiT?.borderSubtle ?? "rgba(255,255,255,0.1)"}`,
        }}
      >
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: t.primaryFull }} />
        <span className="text-sm" style={{ color: uiT?.mutedText }}>Submitting as</span>
        <span className="font-semibold text-sm" style={{ color: t.primaryText }}>{currentOrg.name}</span>
      </div>

      {/* ── Basic Info ── */}
      <Section uiT={uiT}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: labelColor }}>Basic Info</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm" style={{ color: labelColor }}>Title <span className="text-red-400">*</span></Label>
            <Input
              onFocus={handleFocus} onBlur={handleBlur}
              value={formData.title}
              onChange={(e) => setField("title", e.target.value)}
              maxLength={LIMITS.title}
              style={inputStyle}
              className="rounded-xl placeholder:opacity-30"
              placeholder="AI Hackathon 2026"
            />
            <CharCount current={formData.title.length} max={LIMITS.title} uiT={uiT} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm" style={{ color: labelColor }}>Description <span className="text-red-400">*</span></Label>
            <Textarea
              onFocus={handleFocus} onBlur={handleBlur}
              value={formData.des}
              onChange={(e) => setField("des", e.target.value)}
              maxLength={LIMITS.des}
              style={inputStyle}
              className="rounded-xl resize-none placeholder:opacity-30"
              rows={4}
              placeholder="Describe your competition…"
            />
            <CharCount current={formData.des.length} max={LIMITS.des} uiT={uiT} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm" style={{ color: labelColor }}>Author <span className="text-red-400">*</span></Label>
              <Input
                onFocus={handleFocus} onBlur={handleBlur}
                value={formData.author}
                onChange={(e) => setField("author", e.target.value)}
                maxLength={LIMITS.author}
                style={inputStyle}
                className="rounded-xl placeholder:opacity-30"
                placeholder="First Name, Last Name"
              />
              <CharCount current={formData.author.length} max={LIMITS.author} uiT={uiT} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm" style={{ color: labelColor }}>Open To <span className="text-red-400">*</span></Label>
              <Input
                onFocus={handleFocus} onBlur={handleBlur}
                value={formData.open_to}
                onChange={(e) => setField("open_to", e.target.value)}
                maxLength={LIMITS.open_to}
                style={inputStyle}
                className="rounded-xl placeholder:opacity-30"
                placeholder="Students, Everyone, 18+"
              />
              <CharCount current={formData.open_to.length} max={LIMITS.open_to} uiT={uiT} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm" style={{ color: labelColor }}>Countries <span className="text-red-400">*</span></Label>
            <CountrySelector value={countries} onChange={setCountries} hasError={countriesError} uiT={uiT} />
          </div>
        </div>
      </Section>

      {/* ── Schedule ── */}
      <Section uiT={uiT}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: labelColor }}>Schedule</p>
        <p className="text-xs mb-4 leading-relaxed" style={{ color: labelColor }}>
          Your announcement is reviewed first, then promoted to gather participants, then the hackathon runs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StageField
            icon={Megaphone} title="Promotion starts" accent="#f59e0b"
            hint={`When your announcement goes public and you start gathering participants. At least ${APPROVAL_BUFFER_DAYS} days from today (approval time).`}
            selected={promoDate}
            onChange={onPromoChange}
            minDate={addDays(startOfDay(new Date()), APPROVAL_BUFFER_DAYS)}
            time={times.promo} onTime={(p) => setTime("promo", p)}
            addToast={addToast} uiT={uiT}
          />
          <StageField
            icon={Calendar} title="Hackathon starts" accent={t.primaryFull}
            hint={`At least ${MIN_PROMO_DAYS} days after promotion starts, so people have time to sign up.`}
            selected={startDate}
            onChange={onStartChange}
            minDate={promoDate ? addDays(startOfDay(promoDate), MIN_PROMO_DAYS) : undefined}
            time={times.start} onTime={(p) => setTime("start", p)}
            gate={!promoDate ? "Please select the promotion start date first." : null}
            addToast={addToast} uiT={uiT}
          />
          <StageField
            icon={Trophy} title="Hackathon ends" accent="#10b981"
            hint="When submissions close and the event wraps up."
            selected={endDate}
            onChange={setEndDate}
            minDate={startDate ? addDays(startOfDay(startDate), MIN_EVENT_DAYS) : undefined}
            time={times.end} onTime={(p) => setTime("end", p)}
            gate={!startDate ? "Please select the hackathon start date first." : null}
            addToast={addToast} uiT={uiT}
          />
        </div>

        {promoAt && startAt && endAt && (
          <TimelineSummary promoAt={promoAt} startAt={startAt} endAt={endAt} uiT={uiT} />
        )}
      </Section>

      {/* ── Prize Pool ── */}
      <Section uiT={uiT}>
        <PrizePool
          prizes={prizes}
          setPrizes={setPrizes}
          currency={formData.prize_currency}
          setCurrency={(c) => setFormData(prev => ({ ...prev, prize_currency: c }))}
          onFocus={handleFocus}
          onBlur={handleBlur}
          uiT={uiT}
        />
      </Section>

      {/* ── Access ── */}
      <Section uiT={uiT}>
        <InviteOnlySection
          enabled={formData.is_invite_only}
          code={formData.invite_code}
          onToggle={setInviteOnly}
          onCode={setInviteCode}
          hasError={inviteError}
          uiT={uiT}
        />
      </Section>

      {/* ── Links ── */}
      <Section uiT={uiT}>
        <LinksSection
          links={links}
          setLinks={setLinks}
          onFocus={handleFocus}
          onBlur={handleBlur}
          hasError={linkError}
          onLinkAdded={() => setLinkError(false)}
          uiT={uiT}
        />
      </Section>

      {/* ── Terms ── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <ShieldCheck className="w-4 h-4" style={{ color: labelColor }} />
          <Label className="text-xs uppercase tracking-widest font-semibold" style={{ color: labelColor }}>Agreement</Label>
        </div>
        <TermsCheckbox
          addToast={addToast}
          checked={termsAccepted}
          onChange={(v) => { setTermsAccepted(v); if (v) setTermsError(false) }}
          hasError={termsError}
          uiT={uiT}
        />
      </div>

      {/* ── Submit ── */}
      <Button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full text-white border-0 rounded-xl h-11 text-sm font-semibold transition-all duration-300"
        style={{
          background: isLoading ? t.badgeBgPrimary : t.buttonGradient,
          boxShadow: t.buttonShadow,
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {retryCount > 1 ? `Retrying… (${retryCount}/${MAX_RETRIES})` : "Submitting…"}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Review &amp; Submit
          </span>
        )}
      </Button>

      <ReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        payload={pendingPayload}
        checks={checks}
        setChecks={setChecks}
        onConfirm={confirmSubmit}
        uiT={uiT}
      />
    </div>
  )
}