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

const ACCOUNT_DELETION_GUIDELINES = [
  {
    title: "1 · General Deletion Policy",
    color: "text-red-500 dark:text-red-300",
    items: [
      "Account deletion is permanent and applied to severe or repeated violations.",
      "Deleted accounts lose all access and associated content may be removed or archived.",
      "This action is irreversible and logged for audit purposes.",
    ],
  },
  {
    title: "2 · Severe Violations",
    color: "text-orange-500 dark:text-orange-300",
    items: [
      "Fraudulent activities (fake hackathons, scams, phishing links).",
      "Malicious use of the platform (spreading harmful or dangerous content).",
      "Severe harassment, hate speech, or abusive behavior.",
      "Impersonation of individuals or organizations.",
    ],
  },
  {
    title: "3 · Repeated Violations",
    color: "text-pink-500 dark:text-pink-300",
    items: [
      "Multiple suspensions without improvement.",
      "Continuous posting of low-quality or irrelevant content.",
      "Repeated attempts to bypass moderation decisions.",
    ],
  },
  {
    title: "4 · Security Threats",
    color: "text-violet-500 dark:text-violet-300",
    items: [
      "Accounts involved in coordinated spam or bot activity.",
      "Unauthorized access attempts or platform exploitation.",
      "Use of the platform for illegal activities.",
    ],
  },
  {
    title: "5 · Enforcement Flow",
    color: "text-blue-500 dark:text-blue-300",
    items: [
      "System or admin flags account for review.",
      "Admin evaluates behavior, history, and severity of violations.",
      "Account may be suspended (temporary) or deleted (permanent).",
      "All actions are logged for transparency and accountability.",
      "User is notified of the action and reason (if applicable).",
    ],
  },
]

// accent hex values used for inline styles that can't use Tailwind opacity utilities
const ACCENT_COLORS = {
  users: { hex: "#22d3ee", shadow: "#0891b2" }, // cyan
  orgs:  { hex: "#e879f9", shadow: "#c026d3" }, // fuchsia
}

const ACCENTS = {
  users: {
    color:      "#22d3ee",
    colorShadow:"#0891b2",
    dot:        "bg-cyan-400",
    tag:        "text-cyan-600 dark:text-cyan-300",
    badge:      "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/30",
    tabActive:  "data-[state=active]:from-cyan-600 data-[state=active]:to-sky-600",
    heading:    "text-cyan-600 dark:text-cyan-400",
    pageActive: "bg-cyan-500/20 border-cyan-500/40 text-cyan-600 dark:text-cyan-300",
    pageHover:  "hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600 dark:hover:text-cyan-300",
  },
  orgs: {
    color:      "#e879f9",
    colorShadow:"#c026d3",
    dot:        "bg-fuchsia-400",
    tag:        "text-fuchsia-600 dark:text-fuchsia-300",
    badge:      "bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-300 border-fuchsia-500/30",
    tabActive:  "data-[state=active]:from-fuchsia-600 data-[state=active]:to-pink-600",
    heading:    "text-fuchsia-600 dark:text-fuchsia-400",
    pageActive: "bg-fuchsia-500/20 border-fuchsia-500/40 text-fuchsia-600 dark:text-fuchsia-300",
    pageHover:  "hover:bg-fuchsia-500/10 hover:border-fuchsia-500/30 hover:text-fuchsia-600 dark:hover:text-fuchsia-300",
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


// ── Standalone Guidelines Dialog ──────────────────────────────────────────────
function GuidelinesDialog({ open, onClose, mode }) {
  const isSuspend = mode === "suspension"
  const sections  = isSuspend ? SUSPENSION_GUIDELINES : ACCOUNT_DELETION_GUIDELINES

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg backdrop-blur-xl border shadow-2xl"
        style={{
          background: isSuspend
            ? "rgb(var(--bg-base)))"
            : "rgb(var(--bg-base)))",
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
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
              className={`w-6 h-6 rounded-md text-[11px] font-medium transition-all
                ${currentPage === item ? ac.pageActive : ac.pageHover}`}
              style={currentPage !== item ? { border: "1px solid rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-faint))" } : { border: "1px solid" }}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
export default function AccountManageSection({ addToast }) {
  const [users, setUsers]               = useState([])
  const [orgs, setOrgs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState("")
  const [activeTab, setActiveTab]       = useState("users")
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const [suspendDialog, setSuspendDialog]         = useState(null)
  const [suspendReason, setSuspendReason]         = useState("")
  const [suspendConfirmed, setSuspendConfirmed]   = useState(false)

  const [deleteDialog, setDeleteDialog]           = useState(null)
  const [deleteReason, setDeleteReason]           = useState("")
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const [guidelinesMode, setGuidelinesMode] = useState(null)
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

  const resetSuspendState = () => { setSuspendDialog(null); setSuspendReason(""); setSuspendConfirmed(false) }
  const resetDeleteState  = () => { setDeleteDialog(null);  setDeleteReason("");  setDeleteConfirmText("") }

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const handleConfirmSuspend = async () => {
    if (!suspendDialog) return
    const item      = suspendDialog
    const isOrg     = activeTab === "orgs"
    const table     = isOrg ? "organizations" : "users"
    const wasActive = item.active !== false
    const finalReason = wasActive ? (suspendReason.trim() || "Suspended by administrator") : null
    resetSuspendState()
    setActionLoading(item.id)
    try {
      const { error: e1 } = await supabase.from(table).update({ active: !wasActive, suspension_reason: finalReason }).eq("id", item.id)
      if (e1) {
        const { error: e2 } = await supabase.from(table).update({ active: !wasActive }).eq("id", item.id)
        if (e2) throw e2
      }
      const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false })
      if (activeTab === "users") setUsers(data || [])
      else setOrgs(data || [])
      if (wasActive) {
        await notifyAccountSuspended({ authUserId: item.user_id, role: isOrg ? "org_admin" : "user", name: item.name, reason: finalReason })
      } else {
        await notifyAccountReactivated({ authUserId: item.user_id, role: isOrg ? "org_admin" : "user", name: item.name })
      }
      setSelectedItem((prev) => prev?.id === item.id ? { ...prev, active: !wasActive, suspension_reason: finalReason } : prev)
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

  const suspendIsReactivate = suspendDialog?.active === false
  const suspendCanSubmit    = suspendIsReactivate ? true : (suspendReason.trim().length >= 10 && suspendConfirmed)
  const deleteCanSubmit     = deleteReason.trim().length >= 10 && deleteConfirmText === "DELETE"

  return (
    <div className="flex flex-col h-full gap-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList
            className="p-1 rounded-xl h-auto"
            style={{
              border: "1px solid rgb(var(--surface-border) / 0.3)",
              background: "rgb(var(--surface-raised) / 0.3)",
            }}
          >
            {TAB_CONFIG.map(({ value, label, Icon }) => {
              const a = ACCENTS[value]
              return (
                <TabsTrigger key={value} value={value}
                  className={`flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                    ${a.tabActive}`}
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  <Icon className="w-3.5 h-3.5" />{label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${a.badge}`}>
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, affiliation…"
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
            onMouseEnter={e => { e.currentTarget.style.color = "rgb(var(--text-secondary))"; e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.6)" }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgb(var(--text-faint))"; e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.3)" }}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>

          {/* Guidelines buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setGuidelinesMode("suspension")}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ border: "1px solid rgba(217,119,6,0.25)", background: "rgba(217,119,6,0.06)", color: "rgb(var(--text-secondary))" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(217,119,6,0.12)"; e.currentTarget.style.borderColor = "rgba(217,119,6,0.4)"; e.currentTarget.style.color = "#d97706" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(217,119,6,0.06)"; e.currentTarget.style.borderColor = "rgba(217,119,6,0.25)"; e.currentTarget.style.color = "rgb(var(--text-secondary))" }}
            >
              <BookOpenCheck className="w-3.5 h-3.5" />Suspension Guide
            </button>
            <button
              onClick={() => setGuidelinesMode("deletion")}
              className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "rgb(var(--text-secondary))" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444" }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "rgb(var(--text-secondary))" }}
            >
              <ScrollText className="w-3.5 h-3.5" />Deletion Rules
            </button>
          </div>
        </div>

        {error && (
          <div
            className="mb-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {TAB_CONFIG.map(({ value }) => {
          const a        = ACCENTS[value]
          const list     = filtered[value]
          const pageList = paginated[value]
          const tp       = totalPages[value]
          const cp       = pages[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">
                {/* LEFT */}
                <div
                  className="w-[300px] shrink-0 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgb(var(--surface) / 0.5)",
                    border: selectedItem
                      ? `1px solid ${a.color}50`
                      : "1px solid rgb(var(--surface-border) / 0.35)",
                    boxShadow: selectedItem ? `0 0 20px ${a.color}12` : "none",
                  }}
                >
                  {/* List header */}
                  <div
                    className="relative px-4 py-3 flex items-center justify-between shrink-0"
                    style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
                  >
                    <div
                      className="absolute bottom-0 left-4 right-0 h-px"
                      style={{ background: `linear-gradient(to right, ${a.color}60, transparent)` }}
                    />
                    <span className={`text-xs font-bold uppercase tracking-widest ${a.heading}`}>
                      {value === "users" ? "Users" : "Organizations"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && <span className="text-[10px]" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>p.{cp}/{tp}</span>}
                      <span className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>{list.length} total</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin" style={{ color: `${a.color}99` }} />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-30" style={{ color: "rgb(var(--text-faint))" }} />
                      <p className="text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                        {search ? `No results for "${search}"` : `No ${value} found`}
                      </p>
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
                    currentPage={cp} totalPages={tp}
                    onPageChange={(p) => { setPage(value, p); setSelectedItem(null) }}
                    ac={a}
                  />
                </div>

                {/* RIGHT */}
                <div
                  className="flex-1 rounded-2xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "rgb(var(--surface) / 0.4)",
                    border: selectedItem
                      ? `1px solid ${a.color}50`
                      : "1px solid rgb(var(--surface-border) / 0.25)",
                  }}
                >
                  {selectedItem ? (
                    <AccountDetailPane key={selectedItem.id} item={selectedItem} type={value} ac={a}
                      actionLoading={actionLoading}
                      onSuspend={() => setSuspendDialog(selectedItem)}
                      onDelete={() => setDeleteDialog(selectedItem)}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 select-none">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{
                          background: `${a.color}12`,
                          border: `1px solid ${a.color}30`,
                        }}
                      >
                        {value === "users"
                          ? <Users     className="w-6 h-6 opacity-40" style={{ color: a.color }} />
                          : <Building2 className="w-6 h-6 opacity-40" style={{ color: a.color }} />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium" style={{ color: "rgb(var(--text-faint))" }}>No account selected</p>
                        <p className="text-xs mt-1" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>Pick an account from the left panel</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )
        })}
      </Tabs>


      {/* ── Suspend / Reactivate Dialog ── */}
      <AlertDialog open={!!suspendDialog} onOpenChange={(open) => { if (!open) resetSuspendState() }}>
        <AlertDialogContent
          className="backdrop-blur-xl border shadow-2xl p-0 overflow-hidden max-w-xl w-full"
          style={{
            background: suspendIsReactivate
              ? "rgb(var(--bg-base)))"
              : "rgb(var(--bg-base)))",
            borderColor: suspendIsReactivate ? "rgba(5,150,105,0.2)" : "rgba(217,119,6,0.2)",
            boxShadow: suspendIsReactivate ? "0 25px 50px rgba(5,150,105,0.1)" : "0 25px 50px rgba(217,119,6,0.1)",
          }}
        >
          <div className="flex flex-col h-[580px]">
            <AlertDialogHeader
              className="px-6 pt-6 pb-5 shrink-0"
              style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: suspendIsReactivate ? "rgba(5,150,105,0.1)" : "rgba(217,119,6,0.1)",
                    border: `1px solid ${suspendIsReactivate ? "rgba(5,150,105,0.25)" : "rgba(217,119,6,0.25)"}`,
                  }}
                >
                  {suspendIsReactivate
                    ? <PlayCircle  className="w-5 h-5 text-emerald-500" />
                    : <PauseCircle className="w-5 h-5 text-amber-500" />}
                </div>
                <div>
                  <AlertDialogTitle
                    className="text-base font-semibold"
                    style={{ color: "rgb(var(--text-primary))" }}
                  >
                    {suspendIsReactivate ? "Reactivate Account" : "Suspend Account"}
                  </AlertDialogTitle>
                  <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
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
                  {/* Target info */}
                  <div
                    className="px-3 py-2.5 rounded-lg text-xs leading-relaxed"
                    style={{
                      background: "rgb(var(--surface-raised) / 0.5)",
                      border: "1px solid rgb(var(--surface-border) / 0.3)",
                      color: "rgb(var(--text-muted))",
                    }}
                  >
                    {suspendIsReactivate ? "Reactivating" : "Suspending"}{" "}
                    <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>"{suspendDialog?.name}"</span>.
                  </div>

                  {!suspendIsReactivate && (
                    <>
                      {/* Quick presets */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                          style={{ color: "rgb(var(--text-faint))" }}>
                          <Zap className="w-3 h-3 shrink-0" style={{ color: "rgba(217,119,6,0.7)" }} />
                          Quick Reason
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {SUSPEND_PRESETS.map(({ label, icon, value }) => (
                            <button key={label} onClick={() => setSuspendReason(value)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left active:scale-[0.98]"
                              style={suspendReason === value
                                ? { background: "rgba(217,119,6,0.15)", border: "1px solid rgba(217,119,6,0.45)", color: "#d97706" }
                                : { background: "rgb(var(--surface-raised) / 0.4)", border: "1px solid rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-muted))" }}
                              onMouseEnter={e => { if (suspendReason !== value) { e.currentTarget.style.background = "rgba(217,119,6,0.08)"; e.currentTarget.style.borderColor = "rgba(217,119,6,0.25)"; e.currentTarget.style.color = "#d97706" } }}
                              onMouseLeave={e => { if (suspendReason !== value) { e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.4)"; e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.4)"; e.currentTarget.style.color = "rgb(var(--text-muted))" } }}
                            >
                              <span style={{ color: suspendReason === value ? "#d97706" : "rgb(var(--text-faint))" }}>{icon}</span>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reason textarea */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                          style={{ color: "rgb(var(--text-faint))" }}>
                          <PauseCircle className="w-3 h-3 shrink-0" />
                          Suspension Reason <span className="text-amber-500 font-bold">*</span>
                        </label>
                        <Textarea
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          placeholder="Describe the reason for suspending this account (min. 10 characters)…"
                          className="text-xs resize-none focus:ring-0 rounded-lg"
                          style={{
                            background: "rgb(var(--surface-raised) / 0.6)",
                            border: "1px solid rgba(217,119,6,0.2)",
                            color: "rgb(var(--text-secondary))",
                          }}
                          rows={3}
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-[11px]" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>Required for moderation audit trail.</p>
                          <span className="text-[11px] tabular-nums" style={{ color: suspendReason.trim().length >= 10 ? "#10b981" : "rgb(var(--text-faint))" }}>
                            {suspendReason.trim().length}/10 min
                          </span>
                        </div>
                      </div>

                      {/* Confirm checkbox */}
                      <label className="flex items-start gap-3 cursor-pointer group/check">
                        <div
                          className="mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all"
                          style={{
                            background: suspendConfirmed ? "#d97706" : "rgb(var(--surface-raised) / 0.5)",
                            border: `1px solid ${suspendConfirmed ? "#d97706" : "rgb(var(--surface-border) / 0.5)"}`,
                          }}
                        >
                          {suspendConfirmed && <CheckCircle className="w-3 h-3 text-white" />}
                        </div>
                        <input type="checkbox" className="sr-only" checked={suspendConfirmed} onChange={(e) => setSuspendConfirmed(e.target.checked)} />
                        <p className="text-[11px] leading-snug select-none transition-colors"
                          style={{ color: "rgb(var(--text-faint))" }}>
                          I confirm that I have reviewed the suspension guidelines and understand that this account
                          will be hidden from the platform until manually reactivated by an administrator.
                        </p>
                      </label>
                    </>
                  )}

                  {suspendIsReactivate && (
                    <div
                      className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
                      style={{ background: "rgba(5,150,105,0.07)", border: "1px solid rgba(5,150,105,0.22)" }}
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
                        Reactivating this account will restore full access. The suspension reason will be cleared.
                        Ensure the account issue has been resolved before proceeding.
                      </p>
                    </div>
                  )}
                </div>
              </AlertDialogDescription>
            </ScrollArea>

            <AlertDialogFooter
              className="px-6 py-4 gap-2 shrink-0"
              style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.2)" }}
            >
              <AlertDialogCancel onClick={resetSuspendState}
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


      {/* ── Delete Dialog ── */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) resetDeleteState() }}>
        <AlertDialogContent
          className="backdrop-blur-xl border shadow-2xl p-0 overflow-hidden max-w-xl w-full"
          style={{
            background: "rgb(var(--bg-base)))",
            borderColor: "rgba(239,68,68,0.2)",
            boxShadow: "0 25px 50px rgba(239,68,68,0.1)",
          }}
        >
          <div className="flex flex-col h-[540px]">
            <AlertDialogHeader
              className="px-6 pt-6 pb-5 shrink-0"
              style={{ borderBottom: "1px solid rgb(var(--surface-border) / 0.2)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}
                >
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <AlertDialogTitle className="text-base font-semibold" style={{ color: "rgb(var(--text-primary))" }}>
                    Delete Account Permanently
                  </AlertDialogTitle>
                  <p className="text-xs mt-0.5" style={{ color: "rgb(var(--text-faint))" }}>
                    Irreversible — cascades to all associated data
                  </p>
                </div>
              </div>
            </AlertDialogHeader>

            <ScrollArea className="flex-1 min-h-0">
              <AlertDialogDescription asChild>
                <div className="px-6 py-5 space-y-5">
                  {/* Target info */}
                  <div
                    className="px-3 py-2.5 rounded-lg text-xs leading-relaxed"
                    style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)", color: "rgb(var(--text-muted))" }}
                  >
                    Permanently deleting{" "}
                    <span className="font-medium" style={{ color: "rgb(var(--text-primary))" }}>"{deleteDialog?.name}"</span>. This cannot be undone.
                  </div>

                  {/* Quick presets */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "rgb(var(--text-faint))" }}>
                      <Zap className="w-3 h-3 shrink-0" style={{ color: "rgba(244,63,94,0.7)" }} />
                      Quick Reason
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {DELETE_PRESETS.map(({ label, icon, value }) => (
                        <button key={label} onClick={() => setDeleteReason(value)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 text-left active:scale-[0.98]"
                          style={deleteReason === value
                            ? { background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.4)", color: "#ef4444" }
                            : { background: "rgb(var(--surface-raised) / 0.4)", border: "1px solid rgb(var(--surface-border) / 0.4)", color: "rgb(var(--text-muted))" }}
                          onMouseEnter={e => { if (deleteReason !== value) { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "#ef4444" } }}
                          onMouseLeave={e => { if (deleteReason !== value) { e.currentTarget.style.background = "rgb(var(--surface-raised) / 0.4)"; e.currentTarget.style.borderColor = "rgb(var(--surface-border) / 0.4)"; e.currentTarget.style.color = "rgb(var(--text-muted))" } }}
                        >
                          <span style={{ color: deleteReason === value ? "#ef4444" : "rgb(var(--text-faint))" }}>{icon}</span>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Deletion reason textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "rgb(var(--text-secondary))" }}>
                      <XCircle className="w-3 h-3 shrink-0" />
                      Deletion Reason <span className="text-red-500 font-bold">*</span>
                    </label>
                    <Textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Describe why this account is being permanently deleted (min. 10 characters)…"
                      className="text-xs resize-none focus:ring-0 rounded-lg"
                      style={{
                        background: "rgb(var(--surface-raised) / 0.6)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        color: "rgb(var(--text-secondary))",
                      }}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[11px]" style={{ color: "rgb(var(--text-faint) / 0.6)" }}>Required for permanent deletion audit log.</p>
                      <span className="text-[11px] tabular-nums" style={{ color: deleteReason.trim().length >= 10 ? "#10b981" : "rgb(var(--text-faint))" }}>
                        {deleteReason.trim().length}/10 min
                      </span>
                    </div>
                  </div>

                  {/* Type DELETE confirmation */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-2"
                      style={{ color: "rgb(var(--text-secondary))" }}>
                      <AlertTriangle className="w-3 h-3 shrink-0 text-red-400" />
                      Confirm Deletion <span className="text-red-500 font-bold">*</span>
                    </label>
                    <p className="text-[11px]" style={{ color: "rgb(var(--text-faint))" }}>
                      Type <span className="font-mono font-bold text-red-500 tracking-widest">DELETE</span> below to confirm this action.
                    </p>
                    <div className="relative">
                      <Input
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type DELETE to confirm"
                        className="text-sm font-mono tracking-widest focus:ring-0 rounded-lg transition-colors"
                        style={{
                          background: "rgb(var(--surface-raised) / 0.6)",
                          border: deleteConfirmText === "DELETE"
                            ? "1px solid rgba(16,185,129,0.4)"
                            : deleteConfirmText.length > 0
                              ? "1px solid rgba(239,68,68,0.4)"
                              : "1px solid rgba(239,68,68,0.2)",
                          color: "rgb(var(--text-primary))",
                        }}
                      />
                      {deleteConfirmText === "DELETE" && (
                        <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </ScrollArea>

            <AlertDialogFooter
              className="px-6 py-4 gap-2 shrink-0"
              style={{ borderTop: "1px solid rgb(var(--surface-border) / 0.2)" }}
            >
              <AlertDialogCancel onClick={resetDeleteState}
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
                onClick={handleConfirmDelete}
                disabled={!!actionLoading || !deleteCanSubmit}
                className="cursor-pointer text-white border-0 gap-2 text-sm transition-all active:scale-[0.97] shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
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
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Guidelines Dialog */}
      <GuidelinesDialog open={!!guidelinesMode} onClose={() => setGuidelinesMode(null)} mode={guidelinesMode} />
    </div>
  )
}


// ── Sub-components ─────────────────────────────────────────────────────────────
function AccountListRow({ item, type, ac, isSelected, onClick }) {
  const isActive = item.active !== false

  return (
    <button
      onClick={onClick}
      className="w-full cursor-pointer text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2"
      style={{
        background: isSelected ? `${ac.color}08` : "transparent",
        borderLeftColor: isSelected ? ac.color : "transparent",
        borderBottom: "1px solid rgb(var(--surface-border) / 0.1)",
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = `${ac.color}05` }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent" }}
    >
      <span
        className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`}
        style={{ opacity: isSelected ? 1 : 0.35 }}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-xs font-semibold leading-snug truncate transition-colors"
            style={{ color: isSelected ? "rgb(var(--text-primary))" : "rgb(var(--text-muted))" }}
          >
            {item.name || <span className="italic" style={{ color: "rgb(var(--text-faint))" }}>Unnamed</span>}
          </p>
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0"
            style={isActive
              ? { background: "rgba(5,150,105,0.1)", color: "#059669", borderColor: "rgba(5,150,105,0.22)" }
              : { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.22)" }}
          >
            {isActive ? "Active" : "Suspended"}
          </span>
        </div>
        <p className={`text-[11px] truncate font-medium ${ac.tag}`} style={{ opacity: isSelected ? 0.9 : 0.6 }}>
          {type === "users" ? item.affiliation || item.country || "No affiliation" : item.author_name || "No contact"}
        </p>
        <p className="text-[10px] transition-colors" style={{ color: "rgb(var(--text-faint) / 0.5)" }}>
          Joined {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>
      <ChevronRight
        className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-all"
        style={{ color: isSelected ? ac.color : "rgb(var(--text-faint) / 0.3)" }}
      />
    </button>
  )
}

function AccountDetailPane({ item, type, ac, actionLoading, onSuspend, onDelete }) {
  const isUser   = type === "users"
  const isActive = item.active !== false

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
          style={{ background: `linear-gradient(to right, transparent, ${ac.color}60, transparent)` }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
              style={{ background: `${ac.color}12`, border: `1px solid ${ac.color}30`, boxShadow: `0 0 20px ${ac.color}15` }}
            >
              {isUser
                ? <User      className="w-5 h-5" style={{ color: ac.color }} />
                : <Building2 className="w-5 h-5" style={{ color: ac.color }} />}
            </div>
            <div className="flex-1 min-w-0 space-y-1.5">
              <h2 className="text-lg font-bold leading-tight truncate" style={{ color: "rgb(var(--text-primary))" }}>
                {item.name || <span className="italic" style={{ color: "rgb(var(--text-faint))" }}>Unnamed</span>}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${ac.badge} border text-[11px] transition-all cursor-default`}>
                  {isUser ? "User Account" : "Organization"}
                </Badge>
                <span
                  className="flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-medium"
                  style={isActive
                    ? { background: "rgba(5,150,105,0.1)", color: "#059669", borderColor: "rgba(5,150,105,0.25)" }
                    : { background: "rgba(239,68,68,0.1)", color: "#ef4444", borderColor: "rgba(239,68,68,0.25)" }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: isActive ? "#10b981" : "#ef4444",
                      boxShadow: isActive ? "0 0 4px rgba(52,211,153,0.8)" : "0 0 4px rgba(248,113,113,0.8)",
                    }}
                  />
                  {isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={onSuspend} disabled={actionLoading === item.id}
              className="h-9 px-4 border gap-2 text-xs font-medium active:scale-[0.97] transition-all cursor-pointer"
              style={isActive
                ? { background: "rgba(217,119,6,0.1)", border: "1px solid rgba(217,119,6,0.3)", color: "#d97706" }
                : { background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", color: "#059669" }}
              onMouseEnter={e => { e.currentTarget.style.background = isActive ? "rgba(217,119,6,0.18)" : "rgba(5,150,105,0.18)" }}
              onMouseLeave={e => { e.currentTarget.style.background = isActive ? "rgba(217,119,6,0.1)" : "rgba(5,150,105,0.1)" }}
            >
              {actionLoading === item.id
                ? <Loader2     className="w-3.5 h-3.5 animate-spin" />
                : isActive
                  ? <ShieldOff   className="w-3.5 h-3.5" />
                  : <ShieldCheck className="w-3.5 h-3.5" />}
              {isActive ? "Suspend" : "Reactivate"}
            </Button>
            <Button size="sm" onClick={onDelete} disabled={actionLoading === item.id}
              className="h-9 cursor-pointer px-4 text-white border-0 gap-2 text-xs font-medium active:scale-[0.97] transition-all"
              style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.8), rgba(192,38,211,0.8))",
                boxShadow: "0 4px 12px rgba(192,38,211,0.25)",
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(236,72,153,0.35)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(192,38,211,0.25)"}
            >
              <Trash2 className="w-3.5 h-3.5" />Delete
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-6">
          {!isActive && (
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.22)" }}
            >
              <ShieldOff className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold mb-1 text-red-500">Account Suspended</p>
                <p className="text-xs leading-relaxed" style={{ color: "rgb(var(--text-muted))" }}>
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
                  {item.author_name && <InfoRow icon={<User  className="w-3 h-3" />} label="Contact" value={item.author_name} />}
                  {item.email       && <InfoRow icon={<Mail  className="w-3 h-3" />} label="Email"   value={item.email} />}
                  {item.website     && <InfoRow icon={<Globe className="w-3 h-3" />} label="Website" value={item.website} />}
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
              <p className="text-sm leading-relaxed" style={{ color: "rgb(var(--text-secondary))" }}>{item.bio || item.description}</p>
            </DetailBlock>
          )}

          <div className="pb-2">
            <p className="flex items-center gap-1.5 text-[11px] font-mono select-all cursor-text transition-colors"
              style={{ color: "rgb(var(--text-faint) / 0.4)" }}>
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
      <p className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-3 ${ac.heading} opacity-70`}>
        <span>{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 group/row">
      <span className="shrink-0 transition-colors" style={{ color: "rgb(var(--text-faint))" }}>{icon}</span>
      <span className="text-xs min-w-[80px]" style={{ color: "rgb(var(--text-faint))" }}>{label}</span>
      <span className="text-xs truncate transition-colors" style={{ color: "rgb(var(--text-secondary))" }}>{value}</span>
    </div>
  )
}

function StatCard({ label, value, ac }) {
  return (
    <div
      className="px-3 py-3 rounded-xl text-center transition-all duration-200 cursor-default"
      style={{
        background: "rgb(var(--surface-raised) / 0.4)",
        border: `1px solid ${ac.color}20`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${ac.color}40`; e.currentTarget.style.boxShadow = `0 0 12px ${ac.color}10` }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = `${ac.color}20`; e.currentTarget.style.boxShadow = "none" }}
    >
      <p className={`text-xl font-bold ${ac.tag}`}>{value}</p>
      <p className="text-[10px] mt-0.5" style={{ color: "rgb(var(--text-muted))" }}>{label}</p>
    </div>
  )
}