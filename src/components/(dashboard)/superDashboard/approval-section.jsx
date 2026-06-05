"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/(auth)/authContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Megaphone, FileText, BookOpen, CheckCircle, XCircle,
  Loader2, AlertCircle, Calendar, Building2, Trophy,
  Link2, Tag, Clock, User, Hash, Globe,
  AlignLeft, Award, Users, ExternalLink, Inbox,
  ShieldAlert, ShieldCheck, ChevronRight, ChevronLeft, Search,
  BookOpenCheck, ScrollText, PauseCircle, Info,
} from "lucide-react"

function formatUTCDateTime(dateString) {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (isNaN(date)) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC",
  }).format(date) + " UTC"
}

import { notifyPostApproved, notifyPostRejected } from "@/lib/notification"

const ITEMS_PER_PAGE = 10


// ── Guidelines content ─────────────────────────────────────────────────────────
const APPROVAL_GUIDELINES = [
  {
    title: "General Standard",
    items: [
      "Content must comply with platform standards of accuracy, relevance, clarity, and appropriateness.",
      "Approved content immediately becomes visible to all platform users.",
      "Every approval is logged permanently under your admin account.",
    ],
  },
  {
    title: "Hackathon / Announcement Checklist",
    items: [
      "Title, description, date, and organizer details are complete and accurate.",
      "Event is genuinely related to hackathons, innovation, or technology.",
      "No duplicate submission already exists on the platform.",
      "Content is free from harmful, discriminatory, or unethical material.",
      "External links are safe and lead to legitimate registration pages.",
    ],
  },
  {
    title: "Blog Post Checklist",
    items: [
      "Content is well-written with clear structure and sufficient substance.",
      "Topic is relevant to hackathons, learning, or innovation.",
      "No plagiarism — original work or properly credited sources.",
      "All claims are accurate and verifiable.",
    ],
  },
  {
    title: "Learning Resource Checklist",
    items: [
      "Information is accurate and up-to-date.",
      "Content aligns with hackathon learning objectives.",
      "Resource is complete and of acceptable quality.",
    ],
  },
]

const REJECTION_GUIDELINES = [
  {
    title: "1 · General Rule",
    color: "text-red-500 dark:text-red-300",
    items: [
      "Any submission violating platform standards of accuracy, relevance, clarity, or appropriateness may be rejected.",
      "The submitting organization receives a clear rejection reason to guide improvements and resubmission.",
    ],
  },
  {
    title: "2 · Hackathon / Announcement Rejections",
    color: "text-orange-500 dark:text-orange-300",
    items: [
      "Invalid or Incomplete Information — missing title, description, date, or organizer details; unclear or misleading event details.",
      "Irrelevant Content — event is not related to hackathons, innovation, or technology.",
      "Duplicate Submission — same hackathon posted multiple times.",
      "Inappropriate or Offensive Content — harmful, discriminatory, or unethical material.",
      "Suspicious Activity — fake events, misleading registration details, or harmful external links.",
    ],
  },
  {
    title: "3 · Blog Post Rejections",
    color: "text-pink-500 dark:text-pink-300",
    items: [
      "Low-Quality Content — poor grammar, unclear structure, or lack of substance.",
      "Irrelevant Topics — not related to hackathons, learning, or innovation.",
      "Plagiarism — copied content without proper credit.",
      "Misleading Information — false or unverified claims.",
    ],
  },
  {
    title: "4 · Learning Resource Rejections",
    color: "text-violet-500 dark:text-violet-300",
    items: [
      "Content is inaccurate or outdated.",
      "Not aligned with hackathon learning objectives.",
      "Poor quality or incomplete material.",
    ],
  },
  {
    title: "5 · Rejection Process Flow",
    color: "text-blue-500 dark:text-blue-300",
    items: [
      "Organizer / user submits content → system stores as 'Pending'.",
      "Super Admin reviews the submission in the approval queue.",
      "Admin approves (content becomes visible) or rejects (content removed / sent back).",
      "System logs the rejection reason for full transparency.",
      "Submitting organization is notified with the specific reason.",
    ],
  },
]


// ── Guidelines Dialog ──────────────────────────────────────────────────────────
function GuidelinesDialog({ open, onClose, mode }) {
  const isApproval = mode === "approval"
  const sections   = isApproval ? APPROVAL_GUIDELINES : REJECTION_GUIDELINES

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg backdrop-blur-xl border shadow-2xl"
        style={{
          background: isApproval
            ? "linear-gradient(rgb(var(--bg-base))"
            : "linear-gradient(135deg, rgb(var(--bg-base)), rgba(239,68,68,0.04), rgb(var(--bg-base)))",
          borderColor: isApproval ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)",
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: isApproval ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${isApproval ? "rgba(5,150,105,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}
            >
              {isApproval
                ? <BookOpenCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                : <ScrollText   className="w-4 h-4 text-red-500 dark:text-red-400" />}
            </div>
            <div>
              <DialogTitle className={`text-base font-semibold ${isApproval ? "text-emerald-700 dark:text-emerald-200" : "text-red-700 dark:text-red-200"}`}>
                {isApproval ? "Approval Guidelines" : "Rejection Rules & Guidelines"}
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
                  sec.color ?? (isApproval ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400")
                }`}>
                  {sec.title}
                </p>
                <ul className="space-y-1.5">
                  {sec.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-relaxed"
                      style={{ color: "rgb(var(--text-muted))" }}>
                      <span
                        className="mt-[5px] w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: isApproval ? "rgba(5,150,105,0.6)" : "rgba(239,68,68,0.6)" }}
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


// ── Pagination ─────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null
  const pages = []
  const delta = 1
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) pages.push(i)
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
        style={{ border: "1px solid rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-faint))" }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgb(var(--text-secondary))"; e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.5)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgb(var(--text-faint))"; e.currentTarget.style.background = "transparent" }}
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
              className="w-6 h-6 rounded-md text-[11px] font-medium transition-all"
              style={currentPage === item
                ? { background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)", color: "#d97706" }
                : { border: "1px solid rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-faint))" }}
              onMouseEnter={e => { if (currentPage !== item) { e.currentTarget.style.background = "rgba(245,158,11,0.08)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; e.currentTarget.style.color = "#d97706" } }}
              onMouseLeave={e => { if (currentPage !== item) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.4)"; e.currentTarget.style.color = "rgb(var(--text-faint))" } }}
            >
              {item}
            </button>
          )
        )}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center cursor-pointer gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ border: "1px solid rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-faint))" }}
        onMouseEnter={e => { e.currentTarget.style.color = "rgb(var(--text-secondary))"; e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.5)" }}
        onMouseLeave={e => { e.currentTarget.style.color = "rgb(var(--text-faint))"; e.currentTarget.style.background = "transparent" }}
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}


// ── Main component ─────────────────────────────────────────────────────────────
export default function ApprovalSection({ onApprovalChange, addToast }) {
  const { session } = useAuth()

  const [pending, setPending]             = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [search, setSearch]               = useState("")

  const [approveDialog, setApproveDialog]     = useState(null)
  const [rejectDialog, setRejectDialog]       = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [guidelinesMode, setGuidelinesMode]   = useState(null)
  const [approvalChecks, setApprovalChecks]   = useState({})
  const [confirmRejectCheck, setConfirmRejectCheck] = useState(false)
  const [pages, setPages] = useState({ announcements: 1, blogs: 1, resources: 1 })

  const totalPending = pending.announcements.length + pending.blogs.length + pending.resources.length

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: ann }, { data: blogs }, { data: res }] = await Promise.all([
        supabase.from("pending_announcements").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("pending_blogs").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("pending_resources").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      ])
      setPending({ announcements: ann || [], blogs: blogs || [], resources: res || [] })
      onApprovalChange?.((ann?.length || 0) + (blogs?.length || 0) + (res?.length || 0))
    } catch (err) {
      addToast("error", "Loading / Fetching Failed")
    } finally {
      setLoading(false)
    }
  }, [onApprovalChange])

  useEffect(() => { fetchPending() }, [fetchPending])

  useEffect(() => {
    const list = filtered[activeTab]
    if (list.length > 0) {
      setSelectedItem((prev) =>
        prev && list.find((i) => i.id === prev.item?.id) ? prev : { item: list[0], type: activeTab }
      )
    } else {
      setSelectedItem(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pending])

  useEffect(() => { setPages({ announcements: 1, blogs: 1, resources: 1 }) }, [search, activeTab])

  const handleTabChange = (val) => { setActiveTab(val); setSelectedItem(null); setSearch("") }
  const setPage = (tab, page) => setPages((prev) => ({ ...prev, [tab]: page }))

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const filter = (arr) => arr.filter((i) =>
      (i.title        || "").toLowerCase().includes(q) ||
      (i.organization || "").toLowerCase().includes(q)
    )
    return {
      announcements: filter(pending.announcements),
      blogs:         filter(pending.blogs),
      resources:     filter(pending.resources),
    }
  }, [pending, search])

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

  const getChecklistForType = (type) => {
    const common = [
      "Content is accurate, relevant, and clearly written.",
      "No harmful, discriminatory, or inappropriate material.",
      "Post complies with all platform guidelines.",
    ]
    if (type === "announcements") return [...common,
      "Event details (title, date, organizer) are complete.",
      "This is not a duplicate submission.",
      "External links are safe and legitimate.",
    ]
    if (type === "blogs") return [...common,
      "Content is original and not plagiarized.",
      "Topic is relevant to hackathons, learning, or innovation.",
    ]
    return [...common, "Resource is up-to-date and aligns with learning objectives."]
  }

  const openApproveDialog = (item) => {
    const checks = {}
    getChecklistForType(activeTab).forEach((_, i) => { checks[i] = false })
    setApprovalChecks(checks)
    setApproveDialog(item)
  }

  const allChecked = Object.values(approvalChecks).every(Boolean)

  // ── Approve ────────────────────────────────────────────────────────────────
  const confirmApprove = async () => {
    const item = approveDialog
    const type = activeTab
    setApproveDialog(null)
    setActionLoading(item.id)
    try {
      const { status, submitted_by, reviewed_by, reviewed_at, rejection_reason, ...payload } = item
      let mainTable, countField

      if (type === "announcements") {
        mainTable = "announcements"; countField = "total_announcements"
        const { error } = await supabase.from(mainTable).insert([payload])
        if (error) throw error
      } else if (type === "blogs") {
        mainTable = "blogs"; countField = "total_blogs"
        const { id: _id, ...blogPayload } = payload
        const { error } = await supabase.from(mainTable).insert([blogPayload])
        if (error) throw error
      } else {
        mainTable = "resource_hub"; countField = "total_resources"
        const { error } = await supabase.from(mainTable).insert([payload])
        if (error) throw error
      }

      await supabase.from(`pending_${type}`).update({
        status: "approved", reviewed_by: session?.user?.id, reviewed_at: new Date().toISOString(),
      }).eq("id", item.id)

      if (item.organization_id && countField) {
        const { data: orgRow } = await supabase.from("organizations").select(countField).eq("id", item.organization_id).single()
        if (orgRow) {
          await supabase.from("organizations").update({ [countField]: (orgRow[countField] || 0) + 1 }).eq("id", item.organization_id)
        }
      }

      await notifyPostApproved({ submittedBy: item.submitted_by, contentType: type.replace(/s$/, ""), title: item.title })

      setPending((prev) => {
        const next = { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) }
        setSelectedItem(next[type].length > 0 ? { item: next[type][0], type } : null)
        onApprovalChange?.(next.announcements.length + next.blogs.length + next.resources.length)
        return next
      })
      addToast("success", "Approved and published!")
    } catch (err) {
      addToast("error", "Post Approval Error")
    } finally {
      setActionLoading(null)
    }
  }

  // ── Reject ─────────────────────────────────────────────────────────────────
  const confirmReject = async () => {
    const item = rejectDialog
    const type = activeTab
    setRejectDialog(null)
    setActionLoading(item.id)
    try {
      await supabase.from(`pending_${type}`).update({
        status: "rejected",
        rejection_reason: rejectionReason.trim() || "No reason provided",
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      }).eq("id", item.id)

      await notifyPostRejected({
        submittedBy: item.submitted_by,
        contentType: type.replace(/s$/, ""),
        title: item.title,
        reason: rejectionReason.trim() || "No reason provided",
      })

      setPending((prev) => {
        const next = { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) }
        setSelectedItem(next[type].length > 0 ? { item: next[type][0], type } : null)
        onApprovalChange?.(next.announcements.length + next.blogs.length + next.resources.length)
        return next
      })
      addToast("success", "Post Rejected")
    } catch (err) {
      addToast("error", "Error in rejection")
    } finally {
      setActionLoading(null)
      setRejectionReason("")
    }
  }

  const tabConfig = [
    { value: "announcements", label: "Announcements", Icon: Megaphone, tabActive: "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600" },
    { value: "blogs",         label: "Blogs",         Icon: FileText,  tabActive: "data-[state=active]:from-pink-600 data-[state=active]:to-fuchsia-600"   },
    { value: "resources",     label: "Resources",     Icon: BookOpen,  tabActive: "data-[state=active]:from-violet-600 data-[state=active]:to-purple-600"  },
  ]

  return (
    <>
      {/* Summary bar */}
      <div
        className="flex items-center gap-3 mb-4 p-3 rounded-xl"
        style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}
      >
        <Clock className="w-4 h-4 shrink-0" style={{ color: "#d97706" }} />
        <span className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
          {totalPending > 0
            ? <><strong style={{ color: "#d97706" }}>{totalPending}</strong> item{totalPending !== 1 ? "s" : ""} awaiting review</>
            : "All caught up — no pending items!"}
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList
            className="p-1 rounded-xl h-auto"
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.3)",
              background: "rgb(var(--surface-raised) / 0.3)",
            }}
          >
            {tabConfig.map(({ value, label, Icon, tabActive }) => (
              <TabsTrigger key={value} value={value}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                  ${tabActive}`}
                style={{ color: "rgb(var(--text-faint))" }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {pending[value].length > 0 && (
                  <span
                    className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium"
                    style={{ background: "rgba(245,158,11,0.15)", color: "#d97706", borderColor: "rgba(245,158,11,0.35)" }}
                  >
                    {pending[value].length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Search */}
          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors"
              style={{ color: "rgb(var(--text-faint) / 0.6)" }} />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, organization…"
              className="pl-9 h-9 text-sm rounded-lg focus:ring-0 transition-colors"
              style={{
                background: "rgb(var(--surface-raised) / 0.5)",
                border: "1px solid rgb(var(--surface-border) / 0.4)",
                color: "rgb(var(--text-primary))",
              }}
            />
          </div>

          {/* Guidelines buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setGuidelinesMode("approval")}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ border: "1px solid rgba(5,150,105,0.25)", background: "rgba(5,150,105,0.06)", color: "rgb(var(--text-secondary))" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(5,150,105,0.12)"; e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)"; e.currentTarget.style.color = "#059669" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(5,150,105,0.06)"; e.currentTarget.style.borderColor = "rgba(5,150,105,0.25)"; e.currentTarget.style.color = "rgb(var(--text-secondary))" }}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />Approval Guide
            </button>
            <button
              onClick={() => setGuidelinesMode("rejection")}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "rgb(var(--text-secondary))" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "rgb(var(--text-secondary))" }}
            >
              <ScrollText className="w-3.5 h-3.5" />Rejection Rules
            </button>
          </div>
        </div>

        {tabConfig.map(({ value }) => {
          const list     = filtered[value]
          const pageList = paginated[value]
          const tp       = totalPages[value]
          const cp       = pages[value]

          return (
            <TabsContent key={value} value={value}>
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin" style={{ color: "rgb(var(--brand-400) / 0.6)" }} />
                </div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  {search
                    ? <><Inbox className="w-10 h-10 opacity-30" style={{ color: "rgb(var(--text-faint))" }} /><p className="text-sm" style={{ color: "rgb(var(--text-faint))" }}>No results for "{search}"</p></>
                    : <><CheckCircle className="w-10 h-10 opacity-40 text-emerald-500" /><p className="text-sm" style={{ color: "rgb(var(--text-faint))" }}>No pending {value}</p></>}
                </div>
              ) : (
                <div className="flex gap-3 h-[620px]">
                  {/* LEFT — list */}
                  <div
                    className="w-[300px] shrink-0 flex flex-col rounded-2xl overflow-hidden"
                    style={{
                      background: "rgb(var(--surface) / 0.5)",
                      border: "1px solid rgb(var(--surface-border) / 0.35)",
                    }}
                  >
                    <div
                      className="px-4 py-3 flex items-center justify-between shrink-0"
                      style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#d97706" }}>Queue</span>
                      <div className="flex items-center gap-2">
                        {tp > 1 && <span className="text-[10px]" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>p.{cp}/{tp}</span>}
                        <span className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>{list.length} pending</span>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                      <div>
                        {pageList.map((item) => (
                          <PendingListRow
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.item?.id === item.id}
                            onClick={() => setSelectedItem(selectedItem?.item?.id === item.id ? null : { item, type: value })}
                          />
                        ))}
                      </div>
                    </ScrollArea>

                    <Pagination
                      currentPage={cp} totalPages={tp}
                      onPageChange={(p) => { setPage(value, p); setSelectedItem(null) }}
                    />
                  </div>

                  {/* RIGHT — detail */}
                  <div
                    className="flex-1 rounded-2xl overflow-hidden"
                    style={{
                      background: "rgb(var(--surface) / 0.4)",
                      border: "1px solid rgb(var(--surface-border) / 0.25)",
                    }}
                  >
                    {selectedItem && selectedItem.type === value ? (
                      <DetailPanel
                        item={selectedItem.item}
                        type={selectedItem.type}
                        actionLoading={actionLoading}
                        onClose={() => setSelectedItem(null)}
                        onApprove={() => openApproveDialog(selectedItem.item)}
                        onReject={() => { setRejectDialog(selectedItem.item); setRejectionReason("") }}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 select-none">
                        <Inbox className="w-10 h-10 opacity-30" style={{ color: "rgb(var(--text-faint))" }} />
                        <p className="text-sm" style={{ color: "rgb(var(--text-faint))" }}>Select a submission to review</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* ── Guidelines Dialog ── */}
      <GuidelinesDialog open={!!guidelinesMode} onClose={() => setGuidelinesMode(null)} mode={guidelinesMode} />

      {/* ── Approve dialog ── */}
      <AlertDialog open={!!approveDialog} onOpenChange={(open) => !open && setApproveDialog(null)}>
        <AlertDialogContent
          className="backdrop-blur-xl border shadow-2xl max-w-lg"
          style={{
            background: "linear-gradient(135deg, rgb(var(--bg-base)), rgba(5,150,105,0.05), rgb(var(--bg-base)))",
            borderColor: "rgba(5,150,105,0.2)",
            boxShadow: "0 25px 50px rgba(5,150,105,0.1)",
          }}
        >
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.25)" }}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <AlertDialogTitle className="text-emerald-700 dark:text-emerald-200 text-base font-semibold">
                  Approve & Publish
                </AlertDialogTitle>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                  Tick every item to confirm this post meets platform standards
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p style={{ color: "rgb(var(--text-muted))" }}>
                  Publishing{" "}
                  <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>"{approveDialog?.title}"</span>{" "}
                  by <span className="font-medium text-emerald-600 dark:text-emerald-300">{approveDialog?.organization || "unknown org"}</span>.
                </p>

                {/* Pre-approval checklist */}
                <div
                  className="rounded-xl p-4 space-y-3"
                  style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-emerald-600 dark:text-emerald-300">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Pre-Approval Checklist
                    <span className="ml-auto font-normal normal-case tracking-normal" style={{ color: "rgba(5,150,105,0.7)" }}>
                      {Object.values(approvalChecks).filter(Boolean).length} / {Object.keys(approvalChecks).length} confirmed
                    </span>
                  </p>
                  <ul className="space-y-2.5">
                    {getChecklistForType(activeTab).map((label, i) => (
                      <li key={i}
                        onClick={() => setApprovalChecks((prev) => ({ ...prev, [i]: !prev[i] }))}
                        className="flex items-start gap-2.5 cursor-pointer group"
                      >
                        <div
                          className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: approvalChecks[i] ? "#059669" : "rgb(var(--surface-raised) / 0.5)",
                            border: `1px solid ${approvalChecks[i] ? "#059669" : "rgb(var(--surface-border) / 0.5)"}`,
                          }}
                        >
                          {approvalChecks[i] && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <span
                          className="text-xs leading-relaxed transition-colors"
                          style={{ color: approvalChecks[i] ? "rgba(5,150,105,0.5)" : "rgb(var(--text-muted))", textDecoration: approvalChecks[i] ? "line-through" : "none" }}
                        >
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Admin notice */}
                <div
                  className="rounded-lg p-3 space-y-1.5"
                  style={{
                    background: "rgb(var(--surface-raised) / 0.4)",
                    border: "1px solid rgb(var(--surface-border) / 0.25)",
                  }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5"
                    style={{ color: "rgb(var(--text-faint))" }}>
                    <Info className="w-3 h-3" />Admin Notice
                  </p>
                  <ul className="text-xs space-y-1 leading-relaxed" style={{ color: "rgb(var(--text-faint))" }}>
                    {[
                      "Content becomes immediately visible to all platform users.",
                      "This action is permanently logged under your admin account.",
                      "The submitting organization will be notified of this approval.",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>

                {!allChecked && (
                  <p className="text-xs flex items-center gap-1.5" style={{ color: "#d97706" }}>
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Confirm all checklist items before approving.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
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
              onClick={confirmApprove}
              disabled={!allChecked}
              className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #059669, #0d9488)",
                boxShadow: "0 4px 16px rgba(5,150,105,0.35)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(5,150,105,0.5)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(5,150,105,0.35)"}
            >
              <CheckCircle className="w-4 h-4 shrink-0" />Approve & Publish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject dialog ── */}
      <AlertDialog
        open={!!rejectDialog}
        onOpenChange={(open) => {
          if (!open) { setRejectDialog(null); setRejectionReason(""); setConfirmRejectCheck(false) }
        }}
      >
        <AlertDialogContent
          className="backdrop-blur-xl border shadow-2xl max-w-md"
          style={{
            background: "linear-gradient(135deg, rgb(var(--bg-base)), rgba(239,68,68,0.04), rgb(var(--bg-base)))",
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
                  Reject Submission
                </AlertDialogTitle>
                <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                  The organization will be notified with your reason
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p style={{ color: "rgb(var(--text-muted))" }}>
                  Rejecting{" "}
                  <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>"{rejectDialog?.title}"</span>{" "}
                  by <span className="font-medium text-red-500">{rejectDialog?.organization || "unknown org"}</span>.
                </p>

                {/* Quick-pick reasons */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "rgb(var(--text-faint))" }}>
                    Common Reasons
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "Incomplete event details",
                      "Duplicate submission",
                      "Irrelevant content",
                      "Plagiarism detected",
                      "Misleading information",
                      "Inappropriate content",
                    ].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRejectionReason(r)}
                        className="text-[11px] px-2.5 py-1 rounded-full border transition-all"
                        style={rejectionReason === r
                          ? { background: "rgba(239,68,68,0.15)", borderColor: "rgba(239,68,68,0.5)", color: "#ef4444" }
                          : { background: "rgb(var(--surface-raised) / 0.4)", borderColor: "rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-muted))" }}
                        onMouseEnter={e => { if (rejectionReason !== r) { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; e.currentTarget.style.color = "#ef4444" } }}
                        onMouseLeave={e => { if (rejectionReason !== r) { e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.4)"; e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.4)"; e.currentTarget.style.color = "rgb(var(--text-muted))" } }}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason textarea */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                    style={{ color: "rgb(var(--text-secondary))" }}>
                    <XCircle className="w-3 h-3 shrink-0" />
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for rejection..."
                    className="text-xs resize-none focus:ring-0 rounded-lg"
                    style={{
                      background: "rgb(var(--surface-raised) / 0.6)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      color: "rgb(var(--text-secondary))",
                    }}
                    rows={3}
                  />
                  <p className="text-[11px]" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>
                    Required. This will be sent to the organization.
                  </p>
                </div>

                {/* Confirm checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    checked={confirmRejectCheck}
                    onChange={(e) => setConfirmRejectCheck(e.target.checked)}
                    className="mt-1 accent-red-500 cursor-pointer"
                  />
                  <p className="text-[11px] leading-snug" style={{ color: "rgb(var(--text-faint))" }}>
                    I confirm that this submission violates guidelines or does not meet requirements.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => { setRejectionReason(""); setConfirmRejectCheck(false) }}
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
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || !confirmRejectCheck}
              className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #ec4899, #c026d3)",
                boxShadow: "0 4px 16px rgba(192,38,211,0.4)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 24px rgba(192,38,211,0.6)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(192,38,211,0.4)"}
            >
              <XCircle className="w-4 h-4 shrink-0" />Confirm Rejection
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


// ── List row ──────────────────────────────────────────────────────────────────
function PendingListRow({ item, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2"
      style={{
        background: isSelected ? "rgba(245,158,11,0.06)" : "transparent",
        borderLeftColor: isSelected ? "#d97706" : "transparent",
        borderBottom: "1px solid rgb(var(--surface-border) / 0.1)",
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(245,158,11,0.03)" }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
    >
      <span
        className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          background: "#f59e0b",
          opacity: isSelected ? 1 : 0.4,
          boxShadow: isSelected ? "0 0 6px rgba(251,191,36,0.6)" : "none",
        }}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p
          className="text-xs font-semibold leading-snug line-clamp-2 transition-colors"
          style={{ color: isSelected ? "rgb(var(--text-primary))" : "rgb(var(--text-muted))" }}
        >
          {item.title}
        </p>
        {item.organization && (
          <p className="text-[11px] truncate font-medium" style={{ color: "rgba(245,158,11,0.8)" }}>{item.organization}</p>
        )}
        <p className="text-[10px]" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>
          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors"
        style={{ color: isSelected ? "#d97706" : "rgb(var(--text-faint) / 0.3)" }}
      />
    </button>
  )
}


// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ item, type, actionLoading, onClose, onApprove, onReject }) {
  const isBusy = actionLoading === item.id
  const accentColor = {
    announcements: "#e879f9",
    blogs:         "#f472b6",
    resources:     "#a78bfa",
  }[type]
  const accentBadge = {
    announcements: "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30",
    blogs:         "bg-pink-500/15 text-pink-600 dark:text-pink-300 border-pink-500/30",
    resources:     "bg-violet-500/15 text-violet-600 dark:text-violet-300 border-violet-500/30",
  }[type]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="px-6 pt-5 pb-4 shrink-0"
        style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.15)" }}
      >
        {/* Accent line */}
        <div
          className="h-px mb-4 -mx-6 -mt-5 rounded-t-2xl"
          style={{ background: `linear-gradient(to right, transparent, ${accentColor}60, transparent)` }}
        />
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: accentColor }}>
            {type === "announcements" ? "Announcement" : type === "blogs" ? "Blog Post" : "Resource"} Preview
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onApprove} disabled={isBusy}
              className="h-8 px-3 cursor-pointer text-xs gap-1.5 transition-all"
              style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", color: "#059669" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(5,150,105,0.18)"; e.currentTarget.style.borderColor = "rgba(5,150,105,0.5)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(5,150,105,0.1)"; e.currentTarget.style.borderColor = "rgba(5,150,105,0.3)" }}
            >
              {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}Approve
            </Button>
            <Button size="sm" onClick={onReject} disabled={isBusy}
              className="h-8 px-3 cursor-pointer text-xs gap-1.5 transition-all"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.18)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)" }}
            >
              <XCircle className="w-3 h-3" />Reject
            </Button>
          </div>
        </div>

        {item.organization && (
          <Badge className={`${accentBadge} border text-xs flex items-center gap-1.5 w-fit mb-2`}>
            <Building2 className="w-3 h-3" />{item.organization}
          </Badge>
        )}
        <h2 className="text-lg font-bold leading-snug" style={{ color: "rgb(var(--text-primary))" }}>{item.title}</h2>
        <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "rgb(var(--text-faint))" }}>
          <Clock className="w-3 h-3" />Submitted {formatUTCDateTime(item.created_at)}
        </p>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="px-6 py-5 space-y-6 min-h-full">

          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgb(var(--text-secondary))" }}>{item.des}</p>
            </DetailBlock>
          )}

          {type === "announcements" && (
            <>
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Event Dates">
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>
                    {item.date_begin ? formatUTCDateTime(item.date_begin) : "—"}
                    <span className="mx-2" style={{ color: "rgb(var(--text-faint) / 0.4)" }}>→</span>
                    {item.date_end ? formatUTCDateTime(item.date_end) : "—"}
                  </p>
                </DetailBlock>
              )}
              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>{item.open_to}</p>
                </DetailBlock>
              )}
              {item.prizes?.length > 0 && (
                <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${item.prizes.length})`}>
                  <div className="space-y-2">
                    {item.prizes.map((prize, idx) => (
                      <div key={idx}
                        className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)" }}
                      >
                        <Award className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                        <div>
                          {prize.place  && <p className="text-xs font-semibold" style={{ color: "#d97706" }}>{prize.place}</p>}
                          {prize.reward && <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>{prize.reward}</p>}
                          {typeof prize === "string" && <p className="text-xs" style={{ color: "rgb(var(--text-muted))" }}>{prize}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}
            </>
          )}

          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
                  <p className="text-sm" style={{ color: "rgb(var(--text-secondary))" }}>{item.author}</p>
                </DetailBlock>
              )}
              {item.theme && (
                <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Theme">
                  <Badge className="bg-pink-500/15 text-pink-600 dark:text-pink-300 border border-pink-500/25 text-xs">{item.theme}</Badge>
                </DetailBlock>
              )}
              {item.content && (
                <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-6" style={{ color: "rgb(var(--text-secondary))" }}>{item.content}</p>
                </DetailBlock>
              )}
            </>
          )}

          {type === "resources" && (
            <>
              {item.category && (
                <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Category">
                  <Badge className="bg-violet-500/15 text-violet-600 dark:text-violet-300 border border-violet-500/25 text-xs">{item.category}</Badge>
                </DetailBlock>
              )}
              {item.link && (
                <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm hover:underline break-all"
                    style={{ color: "#a78bfa" }}>
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {item.link && type === "announcements" && (
            <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm hover:underline break-all"
                style={{ color: "#e879f9" }}>
                {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>
          )}

          {item.submitted_by && (
            <div className="pt-1 pb-2">
              <p className="flex items-center gap-1.5 text-[11px] font-mono"
                style={{ color: "rgb(var(--text-faint) / 0.4)" }}>
                <User className="w-3 h-3" />{item.submitted_by}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-2"
        style={{ color: "rgb(var(--text-faint))" }}>
        <span style={{ color: "rgb(var(--text-faint))" }}>{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}