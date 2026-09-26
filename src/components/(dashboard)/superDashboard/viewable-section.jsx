"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Megaphone, FileText, BookOpen, Trash2, Loader2,
  AlertCircle, Search, Calendar, Tag,
  Link2, Trophy, Clock, Hash, ExternalLink,
  AlignLeft, Award, Users, Globe, User,
  ShieldAlert, XCircle, CheckCircle, Inbox,
  ChevronRight, ChevronLeft,
  PauseCircle, PlayCircle, Filter,
  DollarSign, MapPin, BarChart2, Sheet,
  Palette, UserCheck, UserX, Info,
  BookOpenCheck,
  ScrollText,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

const ITEMS_PER_PAGE = 10


// ── Guidelines content ─────────────────────────────────────────────────────────

const SUSPENSION_GUIDELINES = [
  {
    title: "General Suspension Principles",
    items: [
      "Suspension is applied when content requires correction, verification, or moderation review.",
      "Suspended content is temporarily hidden from public view.",
      "Submitting users or organizations are notified with a clear reason for suspension.",
      "Content may be reactivated once issues are resolved and verified.",
      "Applies specifically to online hackathons, digital blogs, and learning resources.",
    ],
  },
  {
    title: "Online Hackathon Announcements (Suspension Triggers)",
    items: [
      "Missing key details (event title, description, date, time, or registration link).",
      "No clear indication that the event is conducted online (e.g., platform, tools, or setup).",
      "Unverified organizer identity or unclear hosting organization.",
      "Missing or unclear participation instructions (e.g., how to join, submit, or attend).",
      "External links (Discord, Zoom, Devpost, Google Forms) require validation.",
      "Inconsistent event details (dates, mechanics, or prizes unclear).",
      "Possible duplicate submissions pending verification.",
      "Prize or reward details are vague or need confirmation.",
    ],
  },
  {
    title: "Blog Posts (Suspension Triggers)",
    items: [
      "Content requires formatting, clarity, or readability improvements.",
      "Claims about online hackathons, tools, or results need verification.",
      "Sources or references are missing or unclear.",
      "Content relevance to online hackathons, tech, or learning is uncertain.",
      "Misleading or exaggerated claims about events or achievements.",
    ],
  },
  {
    title: "Learning Resources (Suspension Triggers)",
    items: [
      "Information may be outdated or needs validation (especially tools/platforms).",
      "Resource quality requires further review (unclear tutorials or broken flow).",
      "Missing context on how the resource applies to online hackathons.",
      "Broken, inaccessible, or unverified external links.",
      "Incomplete materials or unclear instructional value.",
    ],
  },
]

const DELETION_GUIDELINES = [
  {
    title: "1 · General Deletion Policy",
    color: "text-red-300 dark:text-red-300",
    items: [
      "Deletion is applied to content that clearly violates platform standards and cannot be corrected.",
      "Removed content is permanently deleted from public visibility.",
      "A clear deletion reason is logged and sent to the submitting user or organization.",
      "Applies strictly to online hackathon-related content, blogs, and resources.",
    ],
  },
  {
    title: "2 · Online Hackathon Announcements (Deletion Reasons)",
    color: "text-orange-500 dark:text-orange-300",
    items: [
      "Fake, fraudulent, or scam events.",
      "No actual online event exists (misleading or bait content).",
      "Severely incomplete or misleading event information.",
      "Irrelevant content not related to hackathons, innovation, or technology.",
      "Duplicate submissions confirmed as redundant.",
      "Malicious or unsafe links (phishing, harmful downloads, suspicious redirects).",
      "Offensive, unethical, or harmful event themes or content.",
      "False promises regarding prizes, certifications, or partnerships.",
    ],
  },
  {
    title: "3 · Blog Posts (Deletion Reasons)",
    color: "text-pink-500 dark:text-pink-300",
    items: [
      "Plagiarized or copied content without proper attribution.",
      "Low-quality or spam-like content with no substantial value.",
      "False, misleading, or unverifiable information.",
      "Content unrelated to online hackathons, tech, or learning.",
      "Offensive, harmful, or inappropriate material.",
      "AI-generated spam or content flooding without meaningful insight.",
    ],
  },
  {
    title: "4 · Learning Resources (Deletion Reasons)",
    color: "text-violet-500 dark:text-violet-300",
    items: [
      "Inaccurate or misleading educational content.",
      "Outdated tools/resources no longer usable in modern online hackathons.",
      "Poor-quality, broken, or unusable materials.",
      "Resources that do not align with platform learning goals.",
      "Malicious or unsafe external resources.",
    ],
  },
  {
    title: "5 · Moderation Flow",
    color: "text-blue-500 dark:text-blue-300",
    items: [
      "User submits content → stored as 'Pending'.",
      "Admin reviews submission in moderation queue.",
      "Admin may approve, suspend (needs fixes), or delete (permanent removal).",
      "System logs all actions (approval, suspension, deletion) for transparency.",
      "Submitting user is notified with the action taken and the reason.",
      "Suspended content can be edited and resubmitted for approval.",
    ],
  },
]

const ACCENTS = {
  announcements: {
    color:        "#e879f9",
    colorShadow:  "#a21caf",
    tagColor:     "#e879f9",
    dotBg:        "#e879f9",
    badgeBg:      "rgba(232,121,249,0.12)",
    badgeBorder:  "rgba(232,121,249,0.35)",
    badgeText:    "#f0abfc",
    dot:          "bg-fuchsia-400",
    tag:          "text-fuchsia-400",
    badge:        "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30",
    heading:      "text-fuchsia-600 dark:text-fuchsia-300",
    border:       "border-fuchsia-500/30",
    tabActive:    "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600",
    pageActive:   "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-300",
    pageHover:    "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:text-fuchsia-600 dark:hover:text-fuchsia-300",
  },
  blogs: {
    color:        "#f472b6",
    colorShadow:  "#be185d",
    tagColor:     "#f472b6",
    dotBg:        "#f472b6",
    badgeBg:      "rgba(244,114,182,0.12)",
    badgeBorder:  "rgba(244,114,182,0.35)",
    badgeText:    "#f9a8d4",
    dot:          "bg-pink-400",
    tag:          "text-pink-400",
    badge:        "bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-500/30",
    heading:      "text-pink-600 dark:text-pink-300",
    border:       "border-pink-500/30",
    tabActive:    "data-[state=active]:from-pink-600 data-[state=active]:to-fuchsia-600",
    pageActive:   "bg-pink-500/20 border-pink-500/40 text-pink-600 dark:text-pink-300",
    pageHover:    "hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-600 dark:hover:text-pink-300",
  },
  resources: {
    color:        "#a78bfa",
    colorShadow:  "#6d28d9",
    tagColor:     "#a78bfa",
    dotBg:        "#a78bfa",
    badgeBg:      "rgba(167,139,250,0.12)",
    badgeBorder:  "rgba(167,139,250,0.35)",
    badgeText:    "#c4b5fd",
    dot:          "bg-violet-400",
    tag:          "text-violet-400",
    badge:        "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30",
    heading:      "text-violet-600 dark:text-violet-300",
    border:       "border-violet-500/30",
    tabActive:    "data-[state=active]:from-violet-600 data-[state=active]:to-purple-600",
    pageActive:   "bg-violet-500/20 border-violet-500/40 text-violet-600 dark:text-violet-300",
    pageHover:    "hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-600 dark:hover:text-violet-300",
  },
}

const TAB_CONFIG = [
  { value: "announcements", label: "Announcements", Icon: Megaphone },
  { value: "blogs",         label: "Blogs",         Icon: FileText  },
  { value: "resources",     label: "Resources",     Icon: BookOpen  },
]

const TABLE_MAP = {
  announcements: "announcements",
  blogs:         "blogs",
  resources:     "resource_hub",
}

const TYPE_LABEL = {
  announcements: "announcement",
  blogs:         "blog",
  resources:     "resource",
}

const STATUS_FILTERS = {
  announcements: [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "suspended", label: "Suspended" },
    { value: "expired",   label: "Expired"   },
  ],
  blogs: [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "suspended", label: "Suspended" },
  ],
  resources: [
    { value: "all",       label: "All"       },
    { value: "active",    label: "Active"    },
    { value: "suspended", label: "Suspended" },
  ],
}


// ── Guidelines Dialog ──────────────────────────────────────────────────────────
function GuidelinesDialog({ open, onClose, mode }) {
  const isSuspend = mode === "suspension"
  const sections  = isSuspend ? SUSPENSION_GUIDELINES : DELETION_GUIDELINES

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={`max-w-lg backdrop-blur-xl border shadow-2xl`}
        style={{
          background: isSuspend
            ? "rgb(var(--bg-base))"
            : "rgb(var(--bg-base))",
          borderColor: isSuspend ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)",
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: isSuspend ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${isSuspend ? "rgba(5,150,105,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              {isSuspend
                ? <BookOpenCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                : <ScrollText   className="w-4 h-4 text-red-500 dark:text-red-400" />}
            </div>
            <div>
              <DialogTitle
                className={`text-base font-semibold ${isSuspend ? "text-emerald-700 dark:text-emerald-200" : "text-red-700 dark:text-red-200"}`}
              >
                {isSuspend ? "Suspension Guidelines" : "Deletion Guidelines"}
              </DialogTitle>
              <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                Platform policy — read before acting on a submission
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh] pr-1 mt-2">
          <div className="space-y-5 pb-2">
            {sections.map((sec, i) => (
              <div key={i}>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${
                  sec.color ?? (isSuspend ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")
                }`}>
                  {sec.title}
                </p>
                <ul className="space-y-1.5">
                  {sec.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-relaxed"
                      style={{ color: "rgb(var(--text-muted))" }}>
                      <span
                        className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: isSuspend ? "rgba(5,150,105,0.6)" : "rgba(239,68,68,0.6)" }}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}


// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange, ac }) {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 1
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
      pages.push(i)
    }
  }
  const withEllipsis = []
  pages.forEach((page, idx) => {
    if (idx > 0 && page - pages[idx - 1] > 1) withEllipsis.push("…")
    withEllipsis.push(page)
  })

  return (
    <div
      className="flex items-center justify-between px-3 py-2 shrink-0"
      style={{
        borderTop: "1px solid rgb(var(--surface-border) / 0.2)",
        background: "rgb(var(--surface-raised) / 0.2)",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex cursor-pointer items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          border: "1px solid rgb(var(--surface-border) / 0.4)",
          color: "rgb(var(--text-faint))",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "rgb(var(--text-secondary))"
          e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.5)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "rgb(var(--text-faint))"
          e.currentTarget.style.background = "transparent"
        }}
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…" ? (
            <span key={`ellipsis-${idx}`} className="text-[11px] px-1" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-6 h-6 rounded-md text-[11px] font-medium transition-all
                ${currentPage === item ? ac.pageActive : `${ac.pageHover}`}`}
              style={currentPage !== item ? {
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                color: "rgb(var(--text-faint))",
              } : { border: "1px solid" }}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex cursor-pointer items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          border: "1px solid rgb(var(--surface-border) / 0.4)",
          color: "rgb(var(--text-faint))",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "rgb(var(--text-secondary))"
          e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.5)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "rgb(var(--text-faint))"
          e.currentTarget.style.background = "transparent"
        }}
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}


// ── Status filter chip bar ────────────────────────────────────────────────────
function StatusFilterBar({ tab, value, onChange, counts, ac }) {
  const options = STATUS_FILTERS[tab] || STATUS_FILTERS.blogs

  return (
    <div
      className="px-3 py-2 flex items-center gap-1.5 flex-wrap shrink-0"
      style={{
        borderBottom: "1px solid rgb(var(--surface-border) / 0.15)",
        background: "rgb(var(--surface-raised) / 0.15)",
      }}
    >
      <Filter className="w-3 h-3 shrink-0" style={{ color: "rgb(var(--text-faint) / 0.6)" }} />
      {options.map(opt => {
        const isActive = value === opt.value
        const count    = counts[opt.value] ?? 0

        const chipStyle = (() => {
          if (!isActive) return {
            bg: "transparent",
            border: "rgb(var(--surface-border) / 0.4)",
            text: "rgb(var(--text-faint))",
            shadow: "none",
          }
          if (opt.value === "suspended") return { bg: "rgba(217,119,6,0.1)", border: "rgba(217,119,6,0.4)", text: "#d97706", shadow: "0 0 10px rgba(217,119,6,0.2)" }
          if (opt.value === "expired")   return { bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.4)",  text: "#ef4444", shadow: "0 0 10px rgba(239,68,68,0.15)" }
          if (opt.value === "active")    return { bg: "rgba(5,150,105,0.1)",  border: "rgba(5,150,105,0.4)",  text: "#059669", shadow: "0 0 10px rgba(5,150,105,0.15)" }
          return {
            bg: `${ac.color}15`,
            border: `${ac.color}55`,
            text: ac.color,
            shadow: `0 0 10px ${ac.color}25`,
          }
        })()

        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="cursor-pointer flex items-center gap-1 px-2.5 py-[3px] rounded-full text-[11px] font-medium transition-all"
            style={{
              background: chipStyle.bg,
              border: `1px solid ${chipStyle.border}`,
              color: chipStyle.text,
              boxShadow: chipStyle.shadow,
            }}
          >
            {opt.value === "suspended" && <PauseCircle className="w-2.5 h-2.5" />}
            {opt.value === "active"    && <PlayCircle  className="w-2.5 h-2.5" />}
            {opt.label}
            <span className="ml-0.5 opacity-55 tabular-nums">{count}</span>
          </button>
        )
      })}
    </div>
  )
}


// ── Main component ────────────────────────────────────────────────────────────
export default function ViewableSection({ addToast }) {
  const [data, setData]                     = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]               = useState(true)
  const [activeTab, setActiveTab]           = useState("announcements")
  const [search, setSearch]                 = useState("")
  const [selectedItem, setSelectedItem]     = useState(null)
  const [deleteDialog, setDeleteDialog]     = useState(null)
  const [deleteReason, setDeleteReason]     = useState("")
  const [deleteConfirm, setDeleteConfirm]   = useState("")
  const [statusFilter, setStatusFilter]     = useState({ announcements: "all", blogs: "all", resources: "all" })
  const [suspendDialog, setSuspendDialog]   = useState(null)
  const [actionReason, setActionReason]     = useState("")
  const [actionLoading, setActionLoading]   = useState(false)
  const [pages, setPages]                   = useState({ announcements: 1, blogs: 1, resources: 1 })
  const [guidelinesMode, setGuidelinesMode] = useState(null)
  const [confirmSuspend, setConfirmSuspend] = useState(false)

  const setPage = (tab, p) => setPages(prev => ({ ...prev, [tab]: p }))

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [{ data: ann }, { data: blogs }, { data: res }] = await Promise.all([
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
        supabase.from("blogs").select("*").order("created_at", { ascending: false }),
        supabase.from("resource_hub").select("*").order("created_at", { ascending: false }),
      ])
      setData({ announcements: ann || [], blogs: blogs || [], resources: res || [] })
    } catch (err) {
      addToast("error", "Loading / Fetching Failed")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSelectedItem(null) }, [activeTab])
  useEffect(() => { setPages({ announcements: 1, blogs: 1, resources: 1 }) }, [search])

  const patchItem = (type, id, patch) => {
    setData(prev => ({ ...prev, [type]: prev[type].map(i => i.id === id ? { ...i, ...patch } : i) }))
    setSelectedItem(prev => prev?.id === id ? { ...prev, ...patch } : prev)
  }

  const isItemExpired   = (item) => item.date_end && new Date(item.date_end) < new Date()
  const isItemSuspended = (item) => item.status === "suspended"

  const applyFilters = (arr, tab, sf) => {
    const q = search.toLowerCase()
    return arr.filter(item => {
      const matchesSearch =
        (item.title  || "").toLowerCase().includes(q) ||
        (item.author || "").toLowerCase().includes(q)
      if (!matchesSearch) return false
      if (sf === "all")       return true
      if (sf === "suspended") return isItemSuspended(item)
      if (sf === "expired")   return tab === "announcements" && !isItemSuspended(item) && isItemExpired(item)
      if (sf === "active")    return !isItemSuspended(item) && !(tab === "announcements" && isItemExpired(item))
      return true
    })
  }

  const filtered = useMemo(() => ({
    announcements: applyFilters(data.announcements, "announcements", statusFilter.announcements),
    blogs:         applyFilters(data.blogs,         "blogs",         statusFilter.blogs),
    resources:     applyFilters(data.resources,     "resources",     statusFilter.resources),
  }), [data, search, statusFilter])

  const chipCounts = useMemo(() => {
    const counts = (tab, arr) => {
      const q    = search.toLowerCase()
      const base = arr.filter(i =>
        (i.title  || "").toLowerCase().includes(q) ||
        (i.author || "").toLowerCase().includes(q)
      )
      return {
        all:       base.length,
        suspended: base.filter(i => isItemSuspended(i)).length,
        expired:   tab === "announcements" ? base.filter(i => !isItemSuspended(i) && isItemExpired(i)).length : 0,
        active:    base.filter(i => !isItemSuspended(i) && !(tab === "announcements" && isItemExpired(i))).length,
      }
    }
    return {
      announcements: counts("announcements", data.announcements),
      blogs:         counts("blogs",         data.blogs),
      resources:     counts("resources",     data.resources),
    }
  }, [data, search])

  const paginated = useMemo(() => ({
    announcements: filtered.announcements.slice((pages.announcements - 1) * ITEMS_PER_PAGE, pages.announcements * ITEMS_PER_PAGE),
    blogs:         filtered.blogs.slice((pages.blogs - 1) * ITEMS_PER_PAGE, pages.blogs * ITEMS_PER_PAGE),
    resources:     filtered.resources.slice((pages.resources - 1) * ITEMS_PER_PAGE, pages.resources * ITEMS_PER_PAGE),
  }), [filtered, pages])

  const totalPages = {
    announcements: Math.ceil(filtered.announcements.length / ITEMS_PER_PAGE),
    blogs:         Math.ceil(filtered.blogs.length / ITEMS_PER_PAGE),
    resources:     Math.ceil(filtered.resources.length / ITEMS_PER_PAGE),
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteDialog) return
    const { id, type } = deleteDialog
    setActionLoading(id)
    try {
      const { error } = await supabase.from(TABLE_MAP[type]).delete().eq("id", id)
      if (error) throw error
      setData(prev => ({ ...prev, [type]: prev[type].filter(i => i.id !== id) }))
      if (selectedItem?.id === id) setSelectedItem(null)
      addToast("success", "Post Deleted Successfully")
    } catch (err) {
      addToast("error", "Post Deletion Error")
    } finally {
      setActionLoading(null)
      setDeleteDialog(null)
      setDeleteReason("")
    }
  }

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const handleToggleSuspend = async () => {
    if (!suspendDialog) return
    const { id, type, item } = suspendDialog
    const wasSuspended = isItemSuspended(item)
    const newStatus    = wasSuspended ? "active" : "suspended"
    setActionLoading(id)
    try {
      const { error } = await supabase.from(TABLE_MAP[type]).update({ status: newStatus }).eq("id", id)
      if (error) throw error
      patchItem(type, id, { status: newStatus })
      addToast(
        "success",
        wasSuspended ? "Post Reactivated Successfully" : "Post Suspended Successfully",
      )
    } catch (err) {
      addToast("error", "Error in suspension")
    } finally {
      setActionLoading(null)
      setSuspendDialog(null)
      setActionReason("")
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setSearch("") }} className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList
            className="p-1 rounded-xl h-auto"
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.3)",
              background: "rgb(var(--surface-raised) / 0.3)",
            }}
          >
            {TAB_CONFIG.map(({ value, label, Icon }) => {
              const ac = ACCENTS[value]
              return (
                <TabsTrigger key={value} value={value}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                    ${ac.tabActive}`}
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ac.badge}`}>
                    {filtered[value].length}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Search */}
          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors"
              style={{ color: "rgb(var(--text-faint) / 0.6)" }} />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or author…"
              className="pl-9 h-9 text-sm rounded-lg focus:ring-0 transition-colors"
              style={{
                background: "rgb(var(--surface-raised) / 0.5)",
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>

          {/* Refresh */}
          <Button size="sm" onClick={fetchAll} disabled={loading} variant="ghost"
            className="h-9 w-9 p-0 cursor-pointer rounded-lg transition-all duration-200"
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.4)",
              color: "rgb(var(--text-faint))",
              background: "rgb(var(--surface-raised) / 0.3)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = "rgb(var(--text-secondary))"
              e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.6)"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = "rgb(var(--text-faint))"
              e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.3)"
            }}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>

          {/* Guidelines buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setGuidelinesMode("suspension")}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                border: "1px solid rgba(217,119,6,0.25)",
                background: "rgba(217,119,6,0.06)",
                color: "rgb(var(--text-secondary))",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(217,119,6,0.12)"
                e.currentTarget.style.borderColor = "rgba(217,119,6,0.4)"
                e.currentTarget.style.color = "#d97706"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(217,119,6,0.06)"
                e.currentTarget.style.borderColor = "rgba(217,119,6,0.25)"
                e.currentTarget.style.color = "rgb(var(--text-secondary))"
              }}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />
              Suspension Guide
            </button>
            <button
              onClick={() => setGuidelinesMode("deletion")}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                border: "1px solid rgba(239,68,68,0.25)",
                background: "rgba(239,68,68,0.06)",
                color: "rgb(var(--text-secondary))",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.12)"
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"
                e.currentTarget.style.color = "#ef4444"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(239,68,68,0.06)"
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"
                e.currentTarget.style.color = "rgb(var(--text-secondary))"
              }}
            >
              <ScrollText className="w-3.5 h-3.5" />
              Deletion Rules
            </button>
          </div>
        </div>

        {TAB_CONFIG.map(({ value }) => {
          const ac       = ACCENTS[value]
          const list     = filtered[value]
          const pageList = paginated[value]
          const cp       = pages[value]
          const tp       = totalPages[value]
          const sf       = statusFilter[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">

                {/* LEFT — list */}
                <div
                  className="w-[320px] max-w-[320px] min-w-0 shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "rgb(var(--surface) / 0.5)",
                    border: selectedItem
                      ? `1px solid ${ac.color}50`
                      : "1px solid rgb(var(--surface-border) / 0.35)",
                    boxShadow: selectedItem
                      ? `0 0 20px ${ac.color}12`
                      : "none",
                  }}
                >
                  {/* List header */}
                  <div
                    className="px-4 py-3 flex items-center justify-between shrink-0"
                    style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
                  >
                    <span
                      className="text-xs font-bold uppercase tracking-widest"
                      style={{ color: "rgb(var(--brand-500))" }}
                    >
                      {value === "announcements" ? "Announcements" : value === "blogs" ? "Blogs" : "Resources"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && (
                        <span className="text-[10px]" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>
                          p.{cp}/{tp}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                        {list.length} item{list.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <StatusFilterBar
                    tab={value} value={sf}
                    onChange={v => setStatusFilter(prev => ({ ...prev, [value]: v }))}
                    counts={chipCounts[value]} ac={ac}
                  />

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: "rgb(var(--brand-400) / 0.6)" }} />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-30" style={{ color: "rgb(var(--text-faint))" }} />
                      <p className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                        {search ? `No results for "${search}"` : `No ${value} yet`}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 min-h-0 overflow-hidden">
                      <div className="divide-y" style={{ borderColor: "rgb(var(--surface-border) / 0.12)" }}>
                        {pageList.map(item => (
                          <ListRow
                            key={item.id} item={item} type={value} ac={ac}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <Pagination
                    currentPage={cp} totalPages={tp}
                    onPageChange={p => { setPage(value, p); setSelectedItem(null) }}
                    ac={ac}
                  />
                </div>

                {/* RIGHT — detail */}
                <div
                  className="flex-1 rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background: "rgb(var(--surface) / 0.4)",
                    border: selectedItem
                      ? `1px solid ${ac.color}50`
                      : "1px solid rgb(var(--surface-border) / 0.25)",
                  }}
                >
                  {selectedItem ? (
                    <DetailPane
                      key={selectedItem.id} item={selectedItem} type={value} ac={ac}
                      actionLoading={actionLoading}
                      onDelete={() => setDeleteDialog({ id: selectedItem.id, title: selectedItem.title, type: value, item: selectedItem })}
                      onToggleSuspend={() => setSuspendDialog({ id: selectedItem.id, title: selectedItem.title, type: value, item: selectedItem })}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{
                          border: "1px solid rgb(var(--surface-border) / 0.3)",
                          background: "rgb(var(--surface-raised) / 0.3)",
                          color: "rgb(var(--text-faint))",
                        }}
                      >
                        {value === "announcements" && <Megaphone className="w-6 h-6 opacity-50" />}
                        {value === "blogs"         && <FileText  className="w-6 h-6 opacity-50" />}
                        {value === "resources"     && <BookOpen  className="w-6 h-6 opacity-50" />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-faint))" }}>Nothing selected</p>
                        <p className="text-xs mt-1" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>
                          Pick an item from the left to view details
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* ── Guidelines Dialog ── */}
      <GuidelinesDialog
        open={!!guidelinesMode}
        onClose={() => setGuidelinesMode(null)}
        mode={guidelinesMode}
      />

      {/* ── Suspend / Reactivate dialog ── */}
      <AlertDialog
        open={!!suspendDialog}
        onOpenChange={open => {
          if (!open) {
            setSuspendDialog(null)
            setActionReason("")
            setConfirmSuspend(false)
          }
        }}
      >
        {(() => {
          const isSuspended = suspendDialog?.item?.status === "suspended"
          const quickReasons = [
            "Under review",
            "Policy violation",
            "Spam or misleading content",
            "Temporary hold",
            "User reported content",
          ]

          return (
            <AlertDialogContent
              className="backdrop-blur-xl border shadow-2xl max-w-md"
              style={{
                background: isSuspended
                  ? `rgb(var(--bg-base))`
                  : `rgb(var(--bg-base))`,
                borderColor: isSuspended ? "rgba(5,150,105,0.2)" : "rgba(217,119,6,0.2)",
                boxShadow: isSuspended ? "0 25px 50px rgba(5,150,105,0.1)" : "0 25px 50px rgba(217,119,6,0.1)",
              }}
            >
              <AlertDialogHeader className="gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      background: isSuspended ? "rgba(5,150,105,0.1)" : "rgba(217,119,6,0.1)",
                      border: `1px solid ${isSuspended ? "rgba(5,150,105,0.25)" : "rgba(217,119,6,0.25)"}`,
                    }}
                  >
                    {isSuspended
                      ? <PlayCircle  className="w-5 h-5 text-emerald-500" />
                      : <PauseCircle className="w-5 h-5 text-amber-500"   />}
                  </div>
                  <div>
                    <AlertDialogTitle
                      className="text-base font-semibold"
                      style={{ color: isSuspended ? "rgb(var(--text-primary))" : "rgb(var(--text-primary))" }}
                    >
                      {isSuspended ? "Reactivate Post" : "Suspend Post"}
                    </AlertDialogTitle>
                    <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                      {isSuspended
                        ? "The post will become visible again"
                        : "The post will be hidden until reactivated"}
                    </p>
                  </div>
                </div>

                <AlertDialogDescription asChild>
                  <div className="space-y-4 text-sm">
                    {/* Info box */}
                    <div
                      className="px-3 py-2.5 rounded-lg text-xs leading-relaxed"
                      style={{
                        background: "rgb(var(--surface-raised) / 0.5)",
                        border: "1px solid rgb(var(--surface-border) / 0.3)",
                        color: "rgb(var(--text-muted))",
                      }}
                    >
                      {isSuspended ? "Reactivating" : "Suspending"}{" "}
                      <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                        "{suspendDialog?.title}"
                      </span>.
                    </div>

                    {!isSuspended && (
                      <>
                        {/* Reason textarea */}
                        <div className="space-y-2">
                          <label
                            className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                            style={{ color: "rgb(var(--text-faint))" }}
                          >
                            <PauseCircle className="w-3 h-3 shrink-0" />
                            Reason <span className="text-amber-500">*</span>
                          </label>
                          <Textarea
                            value={actionReason}
                            onChange={e => setActionReason(e.target.value)}
                            placeholder="Provide reason for suspension..."
                            className="text-xs resize-none focus:ring-0 rounded-lg"
                            style={{
                              background: "rgb(var(--surface-raised) / 0.6)",
                              border: "1px solid rgba(217,119,6,0.2)",
                              color: "rgb(var(--text-secondary))",
                            }}
                            rows={3}
                          />
                          <p className="text-[11px]" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>
                            Required for moderation audit trail.
                          </p>
                        </div>

                        {/* Quick reasons */}
                        <div className="space-y-2">
                          <p className="text-[11px] uppercase" style={{ color: "rgb(var(--text-faint))" }}>
                            Quick reasons
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {quickReasons.map((reason, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setActionReason(reason)}
                                className="text-[11px] px-2.5 py-1 rounded-md transition-all"
                                style={{
                                  background: "rgb(var(--surface-raised) / 0.5)",
                                  border: "1px solid rgb(var(--surface-border) / 0.4)",
                                  color: "rgb(var(--text-muted))",
                                }}
                                onMouseEnter={e => {
                                  e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.8)"
                                  e.currentTarget.style.color = "rgb(var(--text-primary))"
                                }}
                                onMouseLeave={e => {
                                  e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.5)"
                                  e.currentTarget.style.color = "rgb(var(--text-muted))"
                                }}
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Confirm checkbox */}
                        <div className="flex items-start gap-2 pt-1">
                          <input
                            type="checkbox"
                            checked={confirmSuspend}
                            onChange={e => setConfirmSuspend(e.target.checked)}
                            className="mt-1 accent-amber-500 cursor-pointer"
                          />
                          <p className="text-[11px] leading-snug" style={{ color: "rgb(var(--text-faint))" }}>
                            I understand this will hide the post from the platform until manually reactivated.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="gap-2 mt-1">
                <AlertDialogCancel
                  onClick={() => { setActionReason(""); setConfirmSuspend(false) }}
                  className="cursor-pointer text-sm transition-all"
                  style={{
                    background: "rgb(var(--surface-raised) / 0.4)",
                    border: "1px solid rgb(var(--surface-border) / 0.4)",
                    color: "rgb(var(--text-muted))",
                  }}
                >
                  Cancel
                </AlertDialogCancel>

                <Button
                  onClick={handleToggleSuspend}
                  disabled={!!actionLoading || (!isSuspended && (!actionReason.trim() || !confirmSuspend))}
                  className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={
                    isSuspended
                      ? { background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 16px rgba(5,150,105,0.35)" }
                      : { background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 16px rgba(217,119,6,0.35)" }
                  }
                >
                  {actionLoading
                    ? <Loader2    className="w-4 h-4 animate-spin shrink-0" />
                    : isSuspended ? <PlayCircle className="w-4 h-4 shrink-0" /> : <PauseCircle className="w-4 h-4 shrink-0" />}
                  {isSuspended ? "Reactivate Post" : "Suspend Post"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          )
        })()}
      </AlertDialog>

      {/* ── Delete dialog ── */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={open => {
          if (!open) { setDeleteDialog(null); setDeleteReason(""); setDeleteConfirm("") }
        }}
      >
        <AlertDialogContent
          className="backdrop-blur-xl border shadow-2xl max-w-md"
          style={{
            background: " rgb(var(--bg-base))",
            borderColor: "rgba(239,68,68,0.2)",
            boxShadow: "0 25px 50px rgba(239,68,68,0.1)",
          }}
        >
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <ShieldAlert className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <AlertDialogTitle className="text-base font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                  Delete Content
                </AlertDialogTitle>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                  Platform admins will be notified
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                {/* Warning */}
                <div
                  className="px-3 py-2.5 rounded-lg text-xs leading-relaxed"
                  style={{
                    background: "rgb(var(--surface-raised) / 0.5)",
                    border: "1px solid rgb(var(--surface-border) / 0.3)",
                    color: "rgb(var(--text-muted))",
                  }}
                >
                  Permanently deleting{" "}
                  <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>
                    "{deleteDialog?.title}"
                  </span>.
                  This cannot be undone.
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <label
                    className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    <XCircle className="w-3 h-3 shrink-0" />
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    placeholder="Provide a reason for deletion..."
                    className="text-xs resize-none focus:ring-0 rounded-lg"
                    style={{
                      background: "rgb(var(--surface-raised) / 0.6)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "rgb(var(--text-secondary))",
                    }}
                    rows={3}
                  />
                  <p className="text-[11px] leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
                    Required for audit trail. Super admins will see this.
                  </p>
                </div>

                {/* Confirmation input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider py-2" style={{ color: "rgb(var(--text-secondary))" }}>
                    Type <span className="text-red-500 text-md font-bold">&quot;DELETE&quot;</span> to confirm
                  </label>
                  <Input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="text-xs focus:ring-0 rounded-lg"
                    style={{
                      background: "rgb(var(--surface-raised) / 0.6)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "rgb(var(--text-secondary))",
                    }}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => { setDeleteReason(""); setDeleteConfirm("") }}
              className="cursor-pointer text-sm transition-all"
              style={{
                background: "rgb(var(--surface-raised) / 0.4)",
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                color: "rgb(var(--text-muted))",
              }}
            >
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={handleDelete}
              disabled={!!actionLoading || !deleteReason.trim() || deleteConfirm !== "DELETE"}
              className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #ec4899, #c026d3)",
                boxShadow: "0 4px 16px rgba(192,38,211,0.4)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(192,38,211,0.6)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(192,38,211,0.4)"}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin shrink-0" /> : <Trash2 className="w-4 h-4 shrink-0" />}
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


// ── List row ──────────────────────────────────────────────────────────────────
function ListRow({ item, type, ac, isSelected, onClick }) {
  const isExpired   = item.date_end && new Date(item.date_end) < new Date()
  const isSuspended = item.status === "suspended"

  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2"
      style={{
        background: isSelected ? `${ac.color}08` : "transparent",
        borderLeftColor: isSelected ? (isSuspended ? "#d97706" : ac.color) : "transparent",
        borderBottom: "1px solid rgb(var(--surface-border) / 0.1)",
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `${ac.color}05` }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
    >
      <span
        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: isSuspended ? "#d97706" : ac.dotBg,
          opacity: isSelected ? 1 : 0.4,
        }}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <p
            className="text-xs font-semibold truncate flex-1 min-w-0 transition-colors"
            style={{ color: isSelected ? "rgb(var(--text-primary))" : "rgb(var(--text-muted))" }}
          >
            {item.title}
          </p>
          <span className="text-[10px] shrink-0" style={{ color: "rgb(var(--text-faint))" }}>
            {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        {item.author && (
          <p className="text-[11px] truncate font-medium opacity-80"
            style={{ color: isSuspended ? "#d97706" : ac.tagColor }}>
            {item.author}
          </p>
        )}

        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {isSuspended ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 flex items-center gap-1"
              style={{ background: "rgba(217,119,6,0.1)", color: "#d97706", borderColor: "rgba(217,119,6,0.25)" }}
            >
              <PauseCircle className="w-2.5 h-2.5" />Suspended
            </span>
          ) : (
            <>
              {type === "announcements" && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0"
                  style={isExpired
                    ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.2)" }
                    : { background: "rgba(5,150,105,0.1)", color: "#059669", borderColor: "rgba(5,150,105,0.2)" }}
                >
                  {isExpired ? "Expired" : "Active"}
                </span>
              )}
              {type === "blogs" && item.theme && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0"
                  style={{
                    background: "rgb(var(--surface-raised) / 0.5)",
                    border: "1px solid rgb(var(--surface-border) / 0.4)",
                    color: "rgb(var(--text-faint))",
                  }}
                >
                  {item.theme}
                </span>
              )}
            </>
          )}
          {item.des && (
            <span className="text-[10px] truncate flex-1 min-w-0" style={{ color: "rgb(var(--text-faint) / 0.7)" }}>
              {item.des}
            </span>
          )}
        </div>
      </div>

      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5"
        style={{ color: isSelected ? (isSuspended ? "#d97706" : ac.tagColor) : "rgb(var(--text-faint) / 0.4)" }}
      />
    </button>
  )
}


// ── Detail pane ───────────────────────────────────────────────────────────────
function DetailPane({ item, type, ac, actionLoading, onDelete, onToggleSuspend }) {
  const isExpired   = item.date_end && new Date(item.date_end) < new Date()
  const isSuspended = item.status === "suspended"

  const prizes = useMemo(() => {
    if (!item.prizes) return []
    if (Array.isArray(item.prizes)) return item.prizes
    try { return JSON.parse(item.prizes) } catch { return [] }
  }, [item.prizes])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 pt-6 pb-5 shrink-0"
        style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.15)" }}
      >
        {/* Top accent line */}
        <div
          className="h-px mb-4 -mx-6 -mt-6 rounded-t-2xl"
          style={{
            background: isSuspended
              ? "linear-gradient(to right, transparent, rgba(217,119,6,0.5), transparent)"
              : `linear-gradient(to right, transparent, ${ac.color}60, transparent)`,
          }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2.5">
            <h2
              className="text-xl font-bold leading-snug"
              style={{ color: isSuspended ? "#d97706" : "rgb(var(--text-primary))" }}
            >
              {item.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                <Clock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
              {isSuspended ? (
                <span
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium"
                  style={{ background: "rgba(217,119,6,0.1)", color: "#d97706", borderColor: "rgba(217,119,6,0.25)" }}
                >
                  <PauseCircle className="w-3 h-3" />Suspended
                </span>
              ) : type === "announcements" ? (
                <span
                  className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium"
                  style={isExpired
                    ? { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }
                    : { background: "rgba(5,150,105,0.1)", color: "#059669", borderColor: "rgba(5,150,105,0.25)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isExpired ? "#ef4444" : "#10b981",
                      boxShadow: isExpired ? "none" : "0 0 4px rgba(52,211,153,0.8)",
                    }}
                  />
                  {isExpired ? "Expired" : "Active"}
                </span>
              ) : null}
              {type === "blogs" && item.theme && (
                <span
                  className="text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 font-medium"
                  style={{ background: ac.badgeBg, borderColor: ac.badgeBorder, color: ac.badgeText }}
                >
                  <Tag className="w-3 h-3" />{item.theme}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onToggleSuspend}
              disabled={!!actionLoading}
              className="h-9 px-3.5 cursor-pointer rounded-xl text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={isSuspended
                ? { background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 14px rgba(5,150,105,0.3)" }
                : { background: "linear-gradient(135deg, rgba(217,119,6,0.85), rgba(180,83,9,0.85))", boxShadow: "0 4px 14px rgba(217,119,6,0.25)" }}
            >
              {actionLoading === item.id
                ? <Loader2    className="w-3.5 h-3.5 animate-spin" />
                : isSuspended ? <PlayCircle className="w-3.5 h-3.5" /> : <PauseCircle className="w-3.5 h-3.5" />}
              {isSuspended ? "Reactivate" : "Suspend"}
            </button>

            <button
              onClick={onDelete}
              disabled={!!actionLoading}
              className="h-9 px-3.5 cursor-pointer rounded-xl text-white text-xs font-medium flex items-center gap-2 transition-all active:scale-[0.97] disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${ac.color}CC, ${ac.colorShadow}CC)`,
                boxShadow: `0 4px 14px ${ac.color}30`,
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 6px 20px ${ac.color}50`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = `0 4px 14px ${ac.color}30`}
            >
              {actionLoading === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          </div>
        </div>

        {isSuspended && (
          <div
            className="mt-4 px-4 py-3 rounded-xl flex items-center gap-3"
            style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)" }}
          >
            <PauseCircle className="w-4 h-4 shrink-0" style={{ color: "#d97706" }} />
            <p className="text-xs leading-relaxed" style={{ color: "#d97706" }}>
              This post is <span className="font-semibold">suspended</span> and hidden from the platform.
              Click <span className="font-semibold">"Reactivate"</span> to restore visibility.
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6">

          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
              <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{item.des}</p>
            </DetailBlock>
          )}

          {item.content && (
            <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "rgb(var(--text-secondary))" }}>{item.content}</p>
            </DetailBlock>
          )}

          {/* ── Announcements ── */}
          {type === "announcements" && (
            <>
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Schedule">
                  <div className="flex gap-3">
                    {[
                      { label: "Start", val: item.date_begin, expired: false },
                      { label: "End",   val: item.date_end,   expired: isExpired },
                    ].filter(({ val }) => val).map(({ label, val, expired }) => (
                      <div
                        key={label}
                        className="flex-1 px-4 py-3 rounded-xl"
                        style={{
                          background: "rgb(var(--surface-raised) / 0.5)",
                          border: "1px solid rgb(var(--surface-border) / 0.25)",
                        }}
                      >
                        <p className="text-[10px] mb-1 uppercase tracking-wider" style={{ color: "rgb(var(--text-faint))" }}>{label}</p>
                        <p className="text-sm font-medium" style={{ color: expired ? "#ef4444" : "rgb(var(--text-secondary))" }}>
                          {new Date(val).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>{item.open_to}</p>
                </DetailBlock>
              )}

              {item.countries && (
                <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Countries">
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>{item.countries}</p>
                </DetailBlock>
              )}

              {Array.isArray(prizes) && prizes.length > 0 && (
                <DetailBlock
                  icon={<Trophy className="w-3.5 h-3.5" />}
                  label={`Prizes (${prizes.length})${item?.prize_currency ? ` · ${item.prize_currency}` : ""}`}
                >
                  <div className="space-y-2">
                    {prizes.map((prize, i) => {
                      let name = "", value = "", description = ""
                      if (typeof prize === "string") {
                        value = prize
                      } else if (typeof prize === "object" && prize !== null) {
                        name = prize.name || prize.title || prize.place || `Prize ${i + 1}`
                        value = prize.value || prize.reward || prize.amount || ""
                        description = prize.description || prize.details || ""
                      }
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl"
                          style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}
                        >
                          <Award className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                          <div className="min-w-0">
                            <div className="flex items-start gap-3">
                              <span className="text-md leading-none mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>#{i + 1}</span>
                              <div className="min-w-0">
                                {name && <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: "rgb(var(--text-muted))" }}>{name}</p>}
                                {value && <p className="text-md font-bold leading-tight" style={{ color: "rgb(var(--text-primary))" }}>{value}</p>}
                                {description && <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>{description}</p>}
                              </div>
                            </div>
                            {typeof prize === "object" && prize !== null && !prize.name && !prize.value && !prize.reward && (
                              <p className="text-xs font-mono break-all mt-1" style={{ color: "rgb(var(--text-faint))" }}>
                                {JSON.stringify(prize)}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </DetailBlock>
              )}

              {item.website_link && (
                <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Website">
                  <a href={item.website_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.website_link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}

              {item.dev_link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Dev / Submission Link">
                  <a href={item.dev_link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.dev_link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}

              {item.tracking_method && (
                <DetailBlock icon={<BarChart2 className="w-3.5 h-3.5" />} label="Tracking Method">
                  <p className="text-sm capitalize" style={{ color: "rgb(var(--text-secondary))" }}>{item.tracking_method}</p>
                  {item.google_sheet_csv_url && (
                    <a href={item.google_sheet_csv_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs mt-1.5 hover:underline underline-offset-2 break-all"
                      style={{ color: ac.tagColor }}>
                      <Sheet className="w-3 h-3 shrink-0" />Google Sheet CSV<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                    </a>
                  )}
                </DetailBlock>
              )}

              {item.color_scheme && (
                <DetailBlock icon={<Palette className="w-3.5 h-3.5" />} label="Color Scheme">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-md shrink-0"
                      style={{ background: item.color_scheme, border: "1px solid rgb(var(--surface-border) / 0.3)" }}
                    />
                    <p className="text-sm font-mono" style={{ color: "rgb(var(--text-secondary))" }}>{item.color_scheme}</p>
                  </div>
                </DetailBlock>
              )}

              {(item.submitted_by || item.reviewed_by || item.reviewed_at || item.rejection_reason) && (
                <DetailBlock icon={<Info className="w-3.5 h-3.5" />} label="Review Info">
                  <div className="space-y-2 text-xs" style={{ color: "rgb(var(--text-muted))" }}>
                    {item.submitted_by && (
                      <p className="flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-faint))" }} />
                        <span style={{ color: "rgb(var(--text-faint))" }}>Submitted by</span>
                        <span className="font-mono" style={{ color: "rgb(var(--text-secondary))" }}>{item.submitted_by}</span>
                      </p>
                    )}
                    {item.reviewed_by && (
                      <p className="flex items-center gap-2">
                        <UserX className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-faint))" }} />
                        <span style={{ color: "rgb(var(--text-faint))" }}>Reviewed by</span>
                        <span className="font-mono" style={{ color: "rgb(var(--text-secondary))" }}>{item.reviewed_by}</span>
                      </p>
                    )}
                    {item.reviewed_at && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 shrink-0" style={{ color: "rgb(var(--text-faint))" }} />
                        <span style={{ color: "rgb(var(--text-faint))" }}>Reviewed at</span>
                        <span style={{ color: "rgb(var(--text-secondary))" }}>
                          {new Date(item.reviewed_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </p>
                    )}
                    {item.rejection_reason && (
                      <div
                        className="mt-2 px-3 py-2 rounded-lg"
                        style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}
                      >
                        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgb(var(--text-faint))" }}>Rejection Reason</p>
                        <p className="text-xs leading-relaxed" style={{ color: "#ef4444" }}>{item.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Blogs ── */}
          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>{item.author}</p>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                    style={{ color: ac.tagColor }}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Resources ── */}
          {type === "resources" && item.link && (
            <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link">
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline underline-offset-2 break-all"
                style={{ color: ac.tagColor }}>
                {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}

          {/* Row ID */}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] font-mono" style={{ color: "rgb(var(--text-faint) / 0.4)" }}>
              <Hash className="w-3 h-3" />{item.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}


// ── Detail block ──────────────────────────────────────────────────────────────
function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p
        className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
        style={{ color: "rgb(var(--text-faint))" }}
      >
        <span style={{ color: "rgb(var(--text-faint))" }}>{icon}</span>
        {label}
      </p>
      {children}
    </div>
  )
}