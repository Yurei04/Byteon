"use client"

import { useState, useEffect, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Users, Building2, Search, Trash2, ShieldOff, ShieldCheck,
  Loader2, AlertCircle, Calendar, User, RefreshCw,
  ChevronRight, Inbox, ShieldAlert, XCircle, CheckCircle,
  Hash, Globe, Mail, MapPin, BarChart2, Zap,
  AlertTriangle, Ban, BadgeAlert, Skull, FileWarning,
  Activity, ChevronLeft,
  ScrollText,
  BookOpenCheck,
  PauseCircle,
  PlayCircle,
} from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"

import { notifyAccountSuspended, notifyAccountReactivated } from "@/lib/notification"

const ITEMS_PER_PAGE = 10


// ── ACCOUNT MODERATION GUIDELINES ─────────────────────────────────────────────

// 🔶 ACCOUNT SUSPENSION (Temporary restriction)
const SUSPENSION_GUIDELINES = [
  {
    title: "General Suspension Principles",
    items: [
      "Account suspension is a temporary restriction due to policy violations or suspicious activity.",
      "Suspended users cannot post, edit, or interact with content.",
      "The user is notified with a clear reason for the suspension.",
      "Accounts may be reinstated after review or once issues are resolved.",
    ],
  },
  {
    title: "Common Suspension Reasons",
    items: [
      "Posting misleading, incomplete, or low-quality content repeatedly.",
      "Spamming submissions (multiple duplicate hackathons, blogs, or resources).",
      "Suspicious activity such as fake events or unverified links.",
      "Minor violations of community guidelines (non-severe but repeated).",
      "Abusive behavior towards other users or admins.",
    ],
  },
  {
    title: "Security & Integrity Flags",
    items: [
      "Unusual login or activity patterns detected.",
      "Use of multiple accounts to manipulate submissions or approvals.",
      "Attempts to bypass moderation systems.",
    ],
  },
  {
    title: "Reactivation Conditions",
    items: [
      "User acknowledges and corrects the violations.",
      "Content issues are resolved or removed.",
      "Admin review confirms compliance with platform standards.",
    ],
  },
]

// 🔴 ACCOUNT DELETION (Permanent removal)
const ACCOUNT_DELETION_GUIDELINES = [
  {
    title: "1 · General Deletion Policy",
    color: "text-red-300",
    items: [
      "Account deletion is permanent and applied to severe or repeated violations.",
      "Deleted accounts lose all access and associated content may be removed or archived.",
      "This action is irreversible and logged for audit purposes.",
    ],
  },
  {
    title: "2 · Severe Violations",
    color: "text-orange-300",
    items: [
      "Fraudulent activities (fake hackathons, scams, phishing links).",
      "Malicious use of the platform (spreading harmful or dangerous content).",
      "Severe harassment, hate speech, or abusive behavior.",
      "Impersonation of individuals or organizations.",
    ],
  },
  {
    title: "3 · Repeated Violations",
    color: "text-pink-300",
    items: [
      "Multiple suspensions without improvement.",
      "Continuous posting of low-quality or irrelevant content.",
      "Repeated attempts to bypass moderation decisions.",
    ],
  },
  {
    title: "4 · Security Threats",
    color: "text-violet-300",
    items: [
      "Accounts involved in coordinated spam or bot activity.",
      "Unauthorized access attempts or platform exploitation.",
      "Use of the platform for illegal activities.",
    ],
  },
  {
    title: "5 · Enforcement Flow",
    color: "text-blue-300",
    items: [
      "System or admin flags account for review.",
      "Admin evaluates behavior, history, and severity of violations.",
      "Account may be suspended (temporary) or deleted (permanent).",
      "All actions are logged for transparency and accountability.",
      "User is notified of the action and reason (if applicable).",
    ],
  },
]
const ACCENTS = {
  users: {
    dot: "bg-cyan-400", dotGlow: "shadow-[0_0_6px_2px_rgba(34,211,238,0.5)]",
    tag: "text-cyan-300", tagHover: "group-hover:text-cyan-300",
    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", badgeHover: "hover:bg-cyan-500/25 hover:border-cyan-400/50",
    border: "border-cyan-500/35", borderGlow: "shadow-[0_0_0_1px_rgba(6,182,212,0.15)]",
    avatarBg: "bg-cyan-500/12 border-cyan-500/30", avatarText: "text-cyan-300",
    avatarGlow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",
    rowSelected: "bg-cyan-500/8 border-l-cyan-400", rowHover: "hover:bg-cyan-500/5 hover:border-l-cyan-500/40",
    tabActive: "data-[state=active]:from-cyan-600 data-[state=active]:to-sky-600",
    tabGlow: "data-[state=active]:shadow-cyan-500/30",
    heading: "text-cyan-400", statBorder: "border-cyan-500/20 hover:border-cyan-500/40",
    statGlow: "hover:shadow-[0_0_12px_rgba(6,182,212,0.1)]",
    suspendBg: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 hover:border-amber-400/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    headerLine: "bg-gradient-to-r from-cyan-500/60 to-transparent",
    pageBtn: "hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300",
    pageActive: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  },
  orgs: {
    dot: "bg-fuchsia-400", dotGlow: "shadow-[0_0_6px_2px_rgba(232,121,249,0.5)]",
    tag: "text-fuchsia-300", tagHover: "group-hover:text-fuchsia-300",
    badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30", badgeHover: "hover:bg-fuchsia-500/25 hover:border-fuchsia-400/50",
    border: "border-fuchsia-500/35", borderGlow: "shadow-[0_0_0_1px_rgba(192,38,211,0.15)]",
    avatarBg: "bg-fuchsia-500/12 border-fuchsia-500/30", avatarText: "text-fuchsia-300",
    avatarGlow: "shadow-[0_0_20px_rgba(192,38,211,0.15)]",
    rowSelected: "bg-fuchsia-500/8 border-l-fuchsia-400", rowHover: "hover:bg-fuchsia-500/5 hover:border-l-fuchsia-500/40",
    tabActive: "data-[state=active]:from-fuchsia-600 data-[state=active]:to-pink-600",
    tabGlow: "data-[state=active]:shadow-fuchsia-500/30",
    heading: "text-fuchsia-400", statBorder: "border-fuchsia-500/20 hover:border-fuchsia-500/40",
    statGlow: "hover:shadow-[0_0_12px_rgba(192,38,211,0.1)]",
    suspendBg: "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/25 hover:border-amber-400/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    headerLine: "bg-gradient-to-r from-fuchsia-500/60 to-transparent",
    pageBtn: "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:text-fuchsia-300",
    pageActive: "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-300",
  },
}

const SUSPEND_PRESETS = [
  { label: "Scamming",         icon: <AlertTriangle className="w-3 h-3" />, value: "Account found to be involved in scamming activities." },
  { label: "Spam / Abuse",     icon: <Ban           className="w-3 h-3" />, value: "Repeated spam or abusive behavior reported." },
  { label: "Impersonation",    icon: <BadgeAlert    className="w-3 h-3" />, value: "Account is impersonating another user or organization." },
  { label: "Policy Violation", icon: <FileWarning   className="w-3 h-3" />, value: "Violated platform terms of service or community guidelines." },
]

const DELETE_PRESETS = [
  { label: "Fake Account",     icon: <Skull         className="w-3 h-3" />, value: "Account is confirmed fake or fraudulent." },
  { label: "Scamming",         icon: <AlertTriangle className="w-3 h-3" />, value: "Account engaged in scamming and must be permanently removed." },
  { label: "Severe Violation", icon: <XCircle       className="w-3 h-3" />, value: "Severe or repeated violation of platform policies." },
  { label: "Spam Network",     icon: <Ban           className="w-3 h-3" />, value: "Account is part of a coordinated spam or bot network." },
]

const TAB_CONFIG = [
  { value: "users", label: "Users",         Icon: Users     },
  { value: "orgs",  label: "Organizations", Icon: Building2 },
]


// ── Inline Guidelines Panel (used inside dialogs) ──────────────────────────────
function InlineGuidelinesPanel({ mode }) {
  const isSuspend = mode === "suspend"
  const sections  = isSuspend ? SUSPENSION_GUIDELINES : DELETION_GUIDELINES
  const accent    = isSuspend ? "amber" : "red"

  return (
    <div className={`flex flex-col h-full border-l ${isSuspend ? "border-amber-500/15" : "border-red-500/15"}`}>
      {/* Panel header */}
      <div className={`px-4 py-3 border-b flex items-center gap-2 shrink-0 ${isSuspend ? "border-amber-500/15 bg-amber-500/5" : "border-red-500/15 bg-red-500/5"}`}>
        {isSuspend
          ? <BookOpenCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          : <ScrollText    className="w-3.5 h-3.5 text-red-400 shrink-0" />}
        <span className={`text-[11px] font-bold uppercase tracking-widest ${isSuspend ? "text-amber-300/80" : "text-red-300/80"}`}>
          {isSuspend ? "Suspension Guidelines" : "Deletion Rules"}
        </span>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-4 py-4 space-y-5">
          {sections.map((sec, i) => (
            <div key={i}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${sec.color ?? (isSuspend ? "text-amber-400/80" : "text-red-400/80")}`}>
                {sec.title}
              </p>
              <ul className="space-y-1.5">
                {sec.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-white/40 text-[11px] leading-relaxed">
                    <span className={`mt-[5px] w-1 h-1 rounded-full shrink-0 ${isSuspend ? "bg-amber-500/50" : "bg-red-500/50"}`} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}


// ── Standalone Guidelines Dialog (from top-bar buttons) ──────────────────────
function GuidelinesDialog({ open, onClose, mode }) {
  const isSuspend = mode === "suspension"
  const sections   = isSuspend ? SUSPENSION_GUIDELINES : ACCOUNT_DELETION_GUIDELINES

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className={`max-w-lg bg-gradient-to-br ${
        isSuspend
          ? "from-slate-950 via-emerald-950/20 to-slate-950 border-emerald-500/20"
          : "from-slate-950 via-rose-950/20 to-slate-950 border-red-500/20"
        } backdrop-blur-xl border shadow-2xl`}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isSuspend
                ? "bg-emerald-500/10 border border-emerald-500/25"
                : "bg-red-500/10 border border-red-500/25"}`}>
              {isSuspend
                ? <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                : <ScrollText   className="w-4 h-4 text-red-400" />}
            </div>
            <div>
              <DialogTitle className={`text-base font-semibold ${isSuspend ? "text-emerald-200" : "text-red-200"}`}>
                {isSuspend ? "Suspension Guidelines" : "Deletion Guidelines"}
              </DialogTitle>
              <p className="text-white/30 text-xs mt-0.5">Platform policy — read before acting on a submission</p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[68vh] pr-1 mt-2">
          <div className="space-y-5 pb-2">
            {sections.map((sec, i) => (
              <div key={i}>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${
                  sec.color ?? (isSuspend ? "text-emerald-400" : "text-red-400")}`}>
                  {sec.title}
                </p>
                <ul className="space-y-1.5">
                  {sec.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-white/55 text-xs leading-relaxed">
                      <span className={`mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 ${
                        isSuspend ? "bg-emerald-500/60" : "bg-red-500/60"}`} />
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


// ── Pagination component ───────────────────────────────────────────────────────
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
    <div className="flex items-center justify-between px-3 py-2 border-t border-white/6 shrink-0 bg-black/10">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 text-white/30 text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white/60 hover:bg-white/5 hover:border-white/15"
      >
        <ChevronLeft className="w-3 h-3" /> Prev
      </button>

      <div className="flex items-center gap-1">
        {withEllipsis.map((item, idx) =>
          item === "…" ? (
            <span key={`ellipsis-${idx}`} className="text-white/20 text-[11px] px-1">…</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-6 h-6 rounded-md border text-[11px] font-medium transition-all
                ${currentPage === item
                  ? ac.pageActive
                  : `border-white/8 text-white/30 ${ac.pageBtn}`}`}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-white/8 text-white/30 text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:text-white/60 hover:bg-white/5 hover:border-white/15"
      >
        Next <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  )
}

export default function AccountManageSection({ addToast }) {
  const [users, setUsers]               = useState([])
  const [orgs, setOrgs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState("")
  const [activeTab, setActiveTab]       = useState("users")
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const [suspendDialog, setSuspendDialog]     = useState(null)
  const [suspendReason, setSuspendReason]     = useState("")
  const [suspendConfirmed, setSuspendConfirmed] = useState(false)

  const [deleteDialog, setDeleteDialog]       = useState(null)
  const [deleteReason, setDeleteReason]       = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  // Standalone guidelines panel
  const [guidelinesMode, setGuidelinesMode] = useState(null)

  // Pagination state per tab
  const [pages, setPages] = useState({ users: 1, orgs: 1 })

  const fetchAll = async () => {
    setLoading(true); setError(null)
    try {
      const [{ data: u, error: ue }, { data: o, error: oe }] = await Promise.all([
        supabase.from("users").select("*").order("created_at", { ascending: false }),
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
      ])
      if (ue) throw ue; if (oe) throw oe
      setUsers(u || []); setOrgs(o || [])
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSelectedItem(null) }, [activeTab])
  useEffect(() => { setPages({ users: 1, orgs: 1 }) }, [search])

  const setPage = (tab, page) => setPages((prev) => ({ ...prev, [tab]: page }))

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return {
      users: users.filter((u) =>
        (u.name        || "").toLowerCase().includes(q) ||
        (u.affiliation || "").toLowerCase().includes(q) ||
        (u.country     || "").toLowerCase().includes(q)
      ),
      orgs: orgs.filter((o) =>
        (o.name        || "").toLowerCase().includes(q) ||
        (o.author_name || "").toLowerCase().includes(q)
      ),
    }
  }, [users, orgs, search])

  const paginated = useMemo(() => ({
    users: filtered.users.slice((pages.users - 1) * ITEMS_PER_PAGE, pages.users * ITEMS_PER_PAGE),
    orgs:  filtered.orgs.slice((pages.orgs  - 1) * ITEMS_PER_PAGE, pages.orgs  * ITEMS_PER_PAGE),
  }), [filtered, pages])

  const totalPages = {
    users: Math.ceil(filtered.users.length / ITEMS_PER_PAGE),
    orgs:  Math.ceil(filtered.orgs.length  / ITEMS_PER_PAGE),
  }

  // ── Helpers to reset dialog state ─────────────────────────────────────────
  const resetSuspendState = () => {
    setSuspendDialog(null)
    setSuspendReason("")
    setSuspendConfirmed(false)
  }

  const resetDeleteState = () => {
    setDeleteDialog(null)
    setDeleteReason("")
    setDeleteConfirmText("")
  }

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const handleConfirmSuspend = async () => {
    if (!suspendDialog) return
    const item      = suspendDialog
    const isOrg     = activeTab === "orgs"
    const table     = isOrg ? "organizations" : "users"
    const wasActive = item.active !== false

    const finalReason = wasActive
      ? (suspendReason.trim() || "Suspended by administrator")
      : null

    resetSuspendState()
    setActionLoading(item.id)

    try {
      const { error: e1 } = await supabase.from(table).update({
        active:            !wasActive,
        suspension_reason: finalReason,
      }).eq("id", item.id)

      if (e1) {
        const { error: e2 } = await supabase.from(table).update({ active: !wasActive }).eq("id", item.id)
        if (e2) throw e2
      }

      const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false })
      if (activeTab === "users") setUsers(data || [])
      else setOrgs(data || [])

      if (wasActive) {
        await notifyAccountSuspended({
          authUserId: item.user_id,
          role:       isOrg ? "org_admin" : "user",
          name:       item.name,
          reason:     finalReason,
        })
      } else {
        await notifyAccountReactivated({
          authUserId: item.user_id,
          role:       isOrg ? "org_admin" : "user",
          name:       item.name,
        })
      }

      setSelectedItem((prev) =>
        prev?.id === item.id
          ? { ...prev, active: !wasActive, suspension_reason: finalReason }
          : prev
      )
      addToast("success", wasActive ? "Account suspended successfully." : "Account reactivated successfully.")
    } catch (err) {
      addToast("error", "Error updating account status.")
    } finally {
      setActionLoading(null)
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteDialog) return
    const item  = deleteDialog
    const table = activeTab === "users" ? "users" : "organizations"
    resetDeleteState()
    setActionLoading(item.id)
    try {
      const { error } = await supabase.from(table).delete().eq("id", item.id)
      if (error) throw error
      if (activeTab === "users") setUsers((p) => p.filter((u) => u.id !== item.id))
      else setOrgs((p) => p.filter((o) => o.id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
      addToast("success", "Account permanently deleted.")
    } catch (err) {
      addToast("error", "Error deleting account.")
    } finally {
      setActionLoading(null)
    }
  }

  // ── Derived dialog booleans ───────────────────────────────────────────────
  const suspendIsReactivate = suspendDialog?.active === false
  const suspendCanSubmit    = suspendIsReactivate
    ? true
    : (suspendReason.trim().length >= 10 && suspendConfirmed)
  const deleteCanSubmit     = deleteReason.trim().length >= 10 && deleteConfirmText === "DELETE"

  return (
    <div className="flex flex-col h-full gap-4">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-black/40 border border-white/8 p-1 rounded-xl h-auto backdrop-blur-sm">
            {TAB_CONFIG.map(({ value, label, Icon }) => {
              const a = ACCENTS[value]
              return (
                <TabsTrigger key={value} value={value}
                  className={`flex cursor-pointer  items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    text-white/35 hover:text-white/65 hover:bg-white/5
                    data-[state=active]:bg-gradient-to-r data-[state=active]:text-white
                    data-[state=active]:shadow-lg ${a.tabActive} ${a.tabGlow}`}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-all ${a.badge}`}>
                    {filtered[value].length}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-white/50 transition-colors" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, affiliation…"
              className="pl-9 h-9 cursor-pointer  bg-black/30 border-white/8 hover:border-white/15 focus:border-white/25 text-white text-sm placeholder:text-white/20 rounded-lg focus:ring-0 transition-colors backdrop-blur-sm"
            />
          </div>
          <Button size="sm" onClick={fetchAll} disabled={loading} variant="ghost"
            className="h-9 w-9 p-0 cursor-pointer  border border-white/8 hover:border-white/20 text-white/30 hover:text-white/70 hover:bg-white/6 bg-black/30 backdrop-blur-sm transition-all duration-200 rounded-lg">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setGuidelinesMode("suspension")}
              className="flex items-center cursor-pointer  gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/25 bg-amber-500/8 text-amber-300/80 text-xs font-medium hover:bg-yellow-500/15 hover:border-yellow-400/40 hover:text-yellow-200 transition-all">
              <BookOpenCheck className="w-3.5 h-3.5" />
              Suspension Guide
            </button>
            <button
              onClick={() => setGuidelinesMode("deletion")}
              className="flex items-center cursor-pointer  gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/25 bg-red-500/8 text-red-300/80 text-xs font-medium hover:bg-red-500/15 hover:border-red-400/40 hover:text-red-200 transition-all">
              <ScrollText className="w-3.5 h-3.5" />
              Deletion Rules
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/25 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {TAB_CONFIG.map(({ value }) => {
          const a    = ACCENTS[value]
          const list = filtered[value]
          const pageList = paginated[value]
          const tp = totalPages[value]
          const cp = pages[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">
                {/* LEFT */}
                <div className={`w-[300px] shrink-0 flex flex-col rounded-2xl border bg-black/25 backdrop-blur-sm overflow-hidden transition-all duration-300
                  ${selectedItem ? `${a.border} ${a.borderGlow}` : "border-white/8 hover:border-white/12"}`}>
                  <div className="relative px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                    <div className={`absolute bottom-0 left-4 right-0 h-px ${a.headerLine}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${a.heading}`}>
                      {value === "users" ? "Users" : "Organizations"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && <span className="text-white/18 text-[10px]">p.{cp}/{tp}</span>}
                      <span className="text-white/20 text-xs">{list.length} total</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className={`w-5 h-5 animate-spin ${a.tag}`} />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/15 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-30" />
                      <p className="text-xs">{search ? `No results for "${search}"` : `No ${value} found`}</p>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 min-h-0">
                      <div className="py-1">
                        {pageList.map((item) => (
                          <AccountListRow key={item.id} item={item} type={value} ac={a}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}

                  <Pagination
                    currentPage={cp}
                    totalPages={tp}
                    onPageChange={(p) => { setPage(value, p); setSelectedItem(null) }}
                    ac={a}
                  />
                </div>

                {/* RIGHT */}
                <div className={`flex-1 rounded-2xl border bg-black/25 backdrop-blur-sm overflow-hidden transition-all duration-300
                  ${selectedItem ? `${a.border} ${a.borderGlow}` : "border-white/8"}`}>
                  {selectedItem ? (
                    <AccountDetailPane key={selectedItem.id} item={selectedItem} type={value} ac={a}
                      actionLoading={actionLoading}
                      onSuspend={() => setSuspendDialog(selectedItem)}
                      onDelete={() => setDeleteDialog(selectedItem)}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
                      <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${a.avatarBg}`}>
                        {value === "users"
                          ? <Users    className={`w-6 h-6 ${a.avatarText} opacity-40`} />
                          : <Building2 className={`w-6 h-6 ${a.avatarText} opacity-40`} />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white/15">No account selected</p>
                        <p className="text-xs text-white/8 mt-1">Pick an account from the left panel</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>


      {/* ══════════════════════════════════════════════════════════════════════
          SUSPEND / REACTIVATE DIALOG
      ══════════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!suspendDialog} onOpenChange={(open) => { if (!open) resetSuspendState() }}>
        <AlertDialogContent className={`backdrop-blur-xl border shadow-2xl p-0 overflow-hidden
          max-w-xl w-full
          ${suspendIsReactivate
            ? "bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 border-emerald-500/20 shadow-emerald-900/20"
            : "bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 border-amber-500/20 shadow-amber-900/20"
          }`}
        >
          <div className="flex flex-col h-[580px]">
            <AlertDialogHeader className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border
                  ${suspendIsReactivate
                    ? "bg-emerald-500/10 border-emerald-500/25"
                    : "bg-amber-500/10 border-amber-500/25"}`}>
                  {suspendIsReactivate
                    ? <PlayCircle  className="w-5 h-5 text-emerald-400" />
                    : <PauseCircle className="w-5 h-5 text-amber-400" />}
                </div>
                <div>
                  <AlertDialogTitle className={`text-base font-semibold ${suspendIsReactivate ? "text-emerald-200" : "text-amber-200"}`}>
                    {suspendIsReactivate ? "Reactivate Account" : "Suspend Account"}
                  </AlertDialogTitle>
                  <p className="text-white/30 text-xs mt-0.5">
                    {suspendIsReactivate
                      ? "This account will become fully active again."
                      : "This account will be hidden from the platform until reactivated."}
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            <ScrollArea className="flex-1 min-h-0">
              <AlertDialogDescription asChild>
                <div className="px-6 py-5 space-y-5">

                  {/* Target account info */}
                  <div className="px-3 py-2.5 rounded-lg bg-white/3 border border-white/8 text-white/40 text-xs leading-relaxed">
                    {suspendIsReactivate ? "Reactivating" : "Suspending"}{" "}
                    <span className="text-white font-medium">"{suspendDialog?.name}"</span>.
                  </div>

                  {!suspendIsReactivate && (
                    <>
                      {/* Quick presets */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-amber-400/60 shrink-0" />
                          Quick Reason
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {SUSPEND_PRESETS.map(({ label, icon, value }) => (
                            <button key={label} onClick={() => setSuspendReason(value)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left active:scale-[0.98]
                                ${suspendReason === value
                                  ? "bg-amber-500/18 border-amber-500/45 text-amber-300"
                                  : "bg-white/3 border-white/8 text-white/35 hover:bg-amber-500/8 hover:border-amber-500/25 hover:text-amber-200/80"}`}>
                              <span className={suspendReason === value ? "text-amber-400" : "text-white/20"}>{icon}</span>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reason textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                          <PauseCircle className="w-3 h-3 shrink-0" />
                          Suspension Reason
                          <span className="text-amber-400 font-bold">*</span>
                        </label>
                        <Textarea
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          placeholder="Describe the reason for suspending this account (min. 10 characters)…"
                          className="bg-black/40 border border-amber-500/15 hover:border-amber-500/25 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-amber-400/35 focus:ring-0 rounded-lg"
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-white/18 text-[11px]">Required for moderation audit trail.</p>
                          <span className={`text-[11px] tabular-nums ${suspendReason.trim().length >= 10 ? "text-emerald-400/60" : "text-white/20"}`}>
                            {suspendReason.trim().length}/10 min
                          </span>
                        </div>
                      </div>

                      {/* Confirmation checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group/check">
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all
                          ${suspendConfirmed
                            ? "bg-amber-500 border-amber-500"
                            : "bg-white/5 border-white/15 group-hover/check:border-amber-500/40"}`}>
                          {suspendConfirmed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={suspendConfirmed}
                          onChange={(e) => setSuspendConfirmed(e.target.checked)}
                        />
                        <p className="text-[11px] text-white/40 leading-snug group-hover/check:text-white/60 transition-colors select-none">
                          I confirm that I have reviewed the suspension guidelines and understand that this account
                          will be hidden from the platform until manually reactivated by an administrator.
                        </p>
                      </label>
                    </>
                  )}

                  {suspendIsReactivate && (
                    <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/6 border border-emerald-500/22">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-white/50 text-xs leading-relaxed">
                        Reactivating this account will restore full access. The suspension reason will be cleared.
                        Ensure the account issue has been resolved before proceeding.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </ScrollArea>

            <AlertDialogFooter className="px-6 py-4 border-t border-white/8 gap-2 shrink-0">
              <AlertDialogCancel onClick={resetSuspendState}
                className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all">
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleConfirmSuspend}
                disabled={!!actionLoading || !suspendCanSubmit}
                className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                style={suspendIsReactivate
                  ? { background: "linear-gradient(135deg, #059669, #047857)", boxShadow: "0 4px 16px rgba(5,150,105,0.35)" }
                  : { background: "linear-gradient(135deg, #d97706, #b45309)", boxShadow: "0 4px 16px rgba(217,119,6,0.35)" }
                }
              >
                {actionLoading
                  ? <Loader2    className="w-4 h-4 animate-spin shrink-0" />
                  : suspendIsReactivate
                    ? <PlayCircle  className="w-4 h-4 shrink-0" />
                    : <PauseCircle className="w-4 h-4 shrink-0" />}
                {suspendIsReactivate ? "Reactivate Account" : "Suspend Account"}
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>


      {/* ══════════════════════════════════════════════════════════════════════
          DELETE DIALOG
      ══════════════════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) resetDeleteState() }}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 p-0 overflow-hidden
        max-w-xl w-full">
          <div className="flex flex-col h-[540px]">
            <AlertDialogHeader className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <AlertDialogTitle className="text-red-200 text-base font-semibold">Delete Account Permanently</AlertDialogTitle>
                  <p className="text-white/28 text-xs mt-0.5">Irreversible — cascades to all associated data</p>
                </div>
              </div>
            </AlertDialogHeader>

            <ScrollArea className="flex-1 min-h-0">
              <AlertDialogDescription asChild>
                <div className="px-6 py-5 space-y-5">

                  {/* Target account info */}
                  <div className="px-3 py-2.5 rounded-lg bg-red-500/6 border border-red-500/18 text-white/45 text-xs leading-relaxed">
                    Permanently deleting{" "}
                    <span className="text-white font-medium">"{deleteDialog?.name}"</span>.{" "}
                    This cannot be undone.
                  </div>

                  {/* Quick reason presets */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-rose-400/60 shrink-0" />Quick Reason
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DELETE_PRESETS.map(({ label, icon, value }) => (
                        <button key={label} onClick={() => setDeleteReason(value)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left active:scale-[0.98]
                            ${deleteReason === value
                              ? "bg-rose-500/18 border-rose-500/45 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.12)]"
                              : "bg-white/3 border-white/8 text-white/35 hover:bg-rose-500/8 hover:border-rose-500/25 hover:text-rose-200/80"}`}>
                          <span className={deleteReason === value ? "text-rose-400" : "text-white/20"}>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deletion reason textarea — REQUIRED */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-2">
                      <XCircle className="w-3 h-3 shrink-0 text-white/25" />
                      Deletion Reason
                      <span className="text-red-400 font-bold">*</span>
                    </label>
                    <Textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Describe why this account is being permanently deleted (min. 10 characters)…"
                      className="bg-black/40 border border-red-500/15 hover:border-red-500/25 text-white/70 placeholder:text-white/16 text-xs resize-none focus:border-red-400/35 focus:ring-0 rounded-lg"
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-white/18 text-[11px]">Required for permanent deletion audit log.</p>
                      <span className={`text-[11px] tabular-nums ${deleteReason.trim().length >= 10 ? "text-emerald-400/60" : "text-white/20"}`}>
                        {deleteReason.trim().length}/10 min
                      </span>
                    </div>
                  </div>

                  {/* Type DELETE confirmation */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3 shrink-0 text-red-400/60" />
                      Confirm Deletion
                      <span className="text-red-400 font-bold">*</span>
                    </label>
                    <p className="text-white/30 text-[11px]">
                      Type <span className="font-mono font-bold text-red-300 tracking-widest">DELETE</span> below to confirm this action.
                    </p>
                    <div className="relative">
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className={`bg-black/40 text-white text-sm font-mono tracking-widest placeholder:text-white/15 placeholder:font-sans placeholder:tracking-normal focus:ring-0 rounded-lg transition-colors
                          ${deleteConfirmText === "DELETE"
                            ? "border-emerald-500/40 focus:border-emerald-400/60"
                            : deleteConfirmText.length > 0
                              ? "border-red-500/40 focus:border-red-400/50"
                              : "border-red-500/15 hover:border-red-500/25 focus:border-red-400/35"}`}
                      />
                      {deleteConfirmText === "DELETE" && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                      )}
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </ScrollArea>

            <AlertDialogFooter className="px-6 py-4 border-t border-white/8 gap-2 shrink-0">
              <AlertDialogCancel onClick={resetDeleteState}
                className="cursor-pointer bg-white/4 hover:bg-white/8 text-white/45 hover:text-white/80 border border-white/8 hover:border-white/18 text-sm transition-all">
                Cancel
              </AlertDialogCancel>
              <Button
                onClick={handleConfirmDelete}
                disabled={!!actionLoading || !deleteCanSubmit}
                className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600
                  hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500
                  active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg
                  hover:shadow-[0_4px_20px_rgba(236,72,153,0.3)]
                  disabled:opacity-40 disabled:cursor-not-allowed">
                {actionLoading
                  ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  : <Trash2  className="w-4 h-4 shrink-0" />}
                Delete Permanently
              </Button>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Standalone Guidelines Dialog (top-bar buttons) ── */}
      <GuidelinesDialog
        open={!!guidelinesMode}
        onClose={() => setGuidelinesMode(null)}
        mode={guidelinesMode}
      />
    </div>
  )
}


// ── Sub-components ─────────────────────────────────────────────────────────────
function AccountListRow({ item, type, ac, isSelected, onClick }) {
  const isActive = item.active !== false
  return (
    <button onClick={onClick}
      className={`w-full cursor-pointer  text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected ? `${ac.rowSelected} bg-opacity-100` : `border-l-transparent ${ac.rowHover}`}`}
    >
      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200 ${ac.dot}
        ${isSelected ? `opacity-100 ${ac.dotGlow}` : "opacity-30 group-hover:opacity-80"}`} />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug truncate transition-colors
            ${isSelected ? "text-white" : "text-white/50 group-hover:text-white/85"}`}>
            {item.name || <span className="italic text-white/25">Unnamed</span>}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 transition-colors
            ${isActive
              ? "bg-emerald-500/10 text-emerald-400/65 border-emerald-500/18 group-hover:border-emerald-500/35 group-hover:text-emerald-300"
              : "bg-red-500/10 text-red-400/65 border-red-500/18 group-hover:border-red-500/35 group-hover:text-red-300"}`}>
            {isActive ? "Active" : "Suspended"}
          </span>
        </div>
        <p className={`text-[11px] truncate transition-colors ${ac.tag} ${isSelected ? "opacity-90" : "opacity-55 group-hover:opacity-80"}`}>
          {type === "users" ? item.affiliation || item.country || "No affiliation" : item.author_name || "No contact"}
        </p>
        <p className="text-[10px] text-white/18 group-hover:text-white/30 transition-colors">
          Joined {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-all
        ${isSelected ? ac.tag : "text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5"}`} />
    </button>
  )
}

function AccountDetailPane({ item, type, ac, actionLoading, onSuspend, onDelete }) {
  const isUser   = type === "users"
  const isActive = item.active !== false

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0 ">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-[52px] h-[52px] rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${ac.avatarBg} ${ac.avatarGlow}`}>
              {isUser
                ? <User      className={`w-5 h-5 ${ac.avatarText}`} />
                : <Building2 className={`w-5 h-5 ${ac.avatarText}`} />}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <h2 className="text-lg font-bold text-white leading-tight truncate">
                {item.name || <span className="italic text-white/25">Unnamed</span>}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${ac.badge} ${ac.badgeHover} border text-[11px] transition-all cursor-default`}>
                  {isUser ? "User Account" : "Organization"}
                </Badge>
                <span className={`flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-medium transition-all
                  ${isActive
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/22 hover:bg-emerald-500/18 hover:border-emerald-500/40"
                    : "bg-red-500/10 text-red-300 border-red-500/22 hover:bg-red-500/18 hover:border-red-500/40"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full
                    ${isActive ? "bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]" : "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.8)]"}`} />
                  {isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={onSuspend} disabled={actionLoading === item.id}
              className={`h-9 px-4 border gap-2 text-xs font-medium active:scale-[0.97] transition-all duration-200
                ${isActive
                  ? ac.suspendBg
                  : "bg-emerald-500/15 hover:bg-emerald-500/28 text-emerald-300 border border-emerald-500/25 hover:border-emerald-400/50 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]"}`}>
              {actionLoading === item.id
                ? <Loader2     className="w-3.5 h-3.5 animate-spin" />
                : isActive
                  ? <ShieldOff   className="w-3.5 h-3.5" />
                  : <ShieldCheck className="w-3.5 h-3.5" />}
              {isActive ? "Suspend" : "Reactivate"}
            </Button>
            <Button size="sm" onClick={onDelete} disabled={actionLoading === item.id}
              className="h-9 cursor-pointer  px-4 bg-gradient-to-r from-pink-600/65 to-fuchsia-600/65
                hover:from-pink-500 hover:to-fuchsia-500 text-white border-0 gap-2 text-xs font-medium
                hover:shadow-[0_4px_16px_rgba(236,72,153,0.28)] active:scale-[0.97] transition-all">
              <Trash2 className="w-3.5 h-3.5" />Delete
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-6">
          {!isActive && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/6 border border-red-500/22">
              <ShieldOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-300 text-xs font-semibold mb-1">Account Suspended</p>
                <p className="text-white/50 text-xs leading-relaxed">
                  {item.suspension_reason || "Suspended by administrator. No reason provided."}
                </p>
              </div>
            </div>
          )}

          <DetailBlock icon={<User className="w-3.5 h-3.5" />} label={isUser ? "Profile" : "Contact"} ac={ac}>
            <div className="space-y-2.5">
              {isUser ? (
                <>
                  {item.affiliation && <InfoRow icon={<Building2 className="w-3 h-3" />} label="Affiliation" value={item.affiliation} />}
                  {item.country     && <InfoRow icon={<MapPin    className="w-3 h-3" />} label="Country"     value={item.country} />}
                  {item.email       && <InfoRow icon={<Mail      className="w-3 h-3" />} label="Email"       value={item.email} />}
                </>
              ) : (
                <>
                  {item.author_name && <InfoRow icon={<User  className="w-3 h-3" />} label="Contact"  value={item.author_name} />}
                  {item.email       && <InfoRow icon={<Mail  className="w-3 h-3" />} label="Email"    value={item.email} />}
                  {item.website     && <InfoRow icon={<Globe className="w-3 h-3" />} label="Website"  value={item.website} />}
                </>
              )}
              <InfoRow icon={<Calendar className="w-3 h-3" />} label="Joined"
                value={new Date(item.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              />
            </div>
          </DetailBlock>

          <DetailBlock icon={<BarChart2 className="w-3.5 h-3.5" />} label="Activity Stats" ac={ac}>
            <div className="grid grid-cols-3 gap-2">
              {isUser ? (
                <>
                  <StatCard label="Projects"   value={item.total_projects          ?? 0} ac={ac} />
                  <StatCard label="Hackathons"  value={item.total_hackathons_joined ?? 0} ac={ac} />
                  <StatCard label="Blogs Read"  value={item.total_blogs_read        ?? 0} ac={ac} />
                </>
              ) : (
                <>
                  <StatCard label="Posts"      value={item.total_announcements ?? 0} ac={ac} />
                  <StatCard label="Blogs"      value={item.total_blogs         ?? 0} ac={ac} />
                  <StatCard label="Resources"  value={item.total_resources     ?? 0} ac={ac} />
                </>
              )}
            </div>
          </DetailBlock>

          {(item.bio || item.description) && (
            <DetailBlock icon={<Activity className="w-3.5 h-3.5" />} label={isUser ? "Bio" : "Description"} ac={ac}>
              <p className="text-white/70 text-sm leading-relaxed">{item.bio || item.description}</p>
            </DetailBlock>
          )}

          <div className="pb-2">
            <p className="flex items-center gap-1.5 text-[11px] text-white/12 font-mono hover:text-white/25 transition-colors cursor-text select-all">
              <Hash className="w-3 h-3" />{item.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

function DetailBlock({ icon, label, ac, children }) {
  return (
    <div>
      <p className={`text-[11px]  font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-3 ${ac.heading} opacity-60`}>
        <span>{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 group/row ">
      <span className="text-white/20 shrink-0 group-hover/row:text-white/35 transition-colors">{icon}</span>
      <span className="text-white/28 text-xs min-w-[80px]">{label}</span>
      <span className="text-white/60 text-xs truncate group-hover/row:text-white/75 transition-colors">{value}</span>
    </div>
  )
}

function StatCard({ label, value, ac }) {
  return (
    <div className={`px-3 py-3 rounded-xl bg-white/3 border text-center transition-all duration-200 cursor-default ${ac.statBorder} ${ac.statGlow}`}>
      <p className={`text-xl font-bold ${ac.tag}`}>{value}</p>
      <p className="text-[10px] text-white/70 mt-0.5">{label}</p>
    </div>
  )
}