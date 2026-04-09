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
} from "lucide-react"

import { notifyAccountSuspended, notifyAccountReactivated } from "@/lib/notification"

const ITEMS_PER_PAGE = 10

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
  // Insert ellipsis markers
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

export default function AccountManageSection({addToast}) {
  const [users, setUsers]               = useState([])
  const [orgs, setOrgs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState("")
  const [activeTab, setActiveTab]       = useState("users")
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const [suspendDialog, setSuspendDialog] = useState(null)
  const [deleteDialog, setDeleteDialog]   = useState(null)
  const [suspendReason, setSuspendReason] = useState("")
  const [deleteReason, setDeleteReason]   = useState("")

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

  // Reset page when search changes
  useEffect(() => {
    setPages({ users: 1, orgs: 1 })
  }, [search])

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

  // Paginated slices
  const paginated = useMemo(() => ({
    users: filtered.users.slice((pages.users - 1) * ITEMS_PER_PAGE, pages.users * ITEMS_PER_PAGE),
    orgs:  filtered.orgs.slice((pages.orgs  - 1) * ITEMS_PER_PAGE, pages.orgs  * ITEMS_PER_PAGE),
  }), [filtered, pages])

  const totalPages = {
    users: Math.ceil(filtered.users.length / ITEMS_PER_PAGE),
    orgs:  Math.ceil(filtered.orgs.length  / ITEMS_PER_PAGE),
  }

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const confirmSuspend = async () => {
    if (!suspendDialog) return
    const item      = suspendDialog
    const isOrg     = activeTab === "orgs"
    const table     = isOrg ? "organizations" : "users"
    const wasActive = item.active !== false

    const finalReason = wasActive
      ? (suspendReason.trim() || "Suspended by administrator")
      : null

    setSuspendDialog(null)
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

      setSelectedItem((prev) => prev?.id === item.id ? { ...prev, active: !wasActive, suspension_reason: finalReason } : prev)
       addToast(
        "success",
        wasActive
          ? "Post Reactivated Successfully"
          : "Post Suspended Successfully",
      )
    } catch (err) {
      addToast("error", "Error in reactivation/suspension")
    } finally {
      setActionLoading(null)
      setSuspendReason("")
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteDialog) return
    const item  = deleteDialog
    const table = activeTab === "users" ? "users" : "organizations"
    setDeleteDialog(null)
    setActionLoading(item.id)
    try {
      const { error } = await supabase.from(table).delete().eq("id", item.id)
      if (error) throw error
      if (activeTab === "users") setUsers((p) => p.filter((u) => u.id !== item.id))
      else setOrgs((p) => p.filter((o) => o.id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
      addToast("success", "Account permanently deleted.")
    } catch (err) {
      addToast("error", "Error In deletion")
    } finally {
      setActionLoading(null)
      setDeleteReason("")
    }
  }

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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
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
              className="pl-9 h-9 bg-black/30 border-white/8 hover:border-white/15 focus:border-white/25 text-white text-sm placeholder:text-white/20 rounded-lg focus:ring-0 transition-colors backdrop-blur-sm"
            />
          </div>

          <Button size="sm" onClick={fetchAll} disabled={loading} variant="ghost"
            className="h-9 w-9 p-0 border border-white/8 hover:border-white/20 text-white/30 hover:text-white/70 hover:bg-white/6 bg-black/30 backdrop-blur-sm transition-all duration-200 rounded-lg">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          </Button>
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

                  {/* Header */}
                  <div className="relative px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                    <div className={`absolute bottom-0 left-4 right-0 h-px ${a.headerLine}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${a.heading}`}>
                      {value === "users" ? "Users" : "Organizations"}
                    </span>
                    <div className="flex items-center gap-2">
                      {tp > 1 && (
                        <span className="text-white/18 text-[10px]">
                          p.{cp}/{tp}
                        </span>
                      )}
                      <span className="text-white/20 text-xs">{list.length} total</span>
                    </div>
                  </div>

                  {/* List */}
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

                  {/* Pagination */}
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

      {/* ── Suspend dialog ── */}
      <AlertDialog
        open={!!suspendDialog}
        onOpenChange={(open) => { if (!open) { setSuspendDialog(null); setSuspendReason("") } }}
      >
        <AlertDialogContent className={`backdrop-blur-xl border shadow-2xl max-w-md
          ${suspendDialog?.active !== false
            ? "bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 border-amber-500/20 shadow-amber-900/20"
            : "bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 border-emerald-500/20 shadow-emerald-900/20"}`}
        >
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border
                ${suspendDialog?.active !== false
                  ? "bg-amber-500/10 border-amber-500/25 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.15)]"}`}
              >
                {suspendDialog?.active !== false
                  ? <ShieldOff className="w-5 h-5 text-amber-400" />
                  : <ShieldCheck className="w-5 h-5 text-emerald-400" />}
              </div>
              <div>
                <AlertDialogTitle className={`text-base font-semibold ${suspendDialog?.active !== false ? "text-amber-200" : "text-emerald-200"}`}>
                  {suspendDialog?.active !== false ? "Suspend Account" : "Reactivate Account"}
                </AlertDialogTitle>
                <p className="text-white/28 text-xs mt-0.5">
                  {suspendDialog?.active !== false
                    ? "Account locked immediately — reason will be shown to user"
                    : "Account restored — user will regain full access"}
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className={`px-3 py-2.5 rounded-lg border text-xs leading-relaxed
                  ${suspendDialog?.active !== false
                    ? "bg-amber-500/5 border-amber-500/15 text-white/45"
                    : "bg-emerald-500/5 border-emerald-500/15 text-white/45"}`}
                >
                  You are {suspendDialog?.active !== false ? "suspending" : "reactivating"}{" "}
                  <span className="text-white font-medium">"{suspendDialog?.name}"</span>.{" "}
                  {suspendDialog?.active !== false
                    ? "They will immediately lose all platform access."
                    : "They will regain full access to the platform."}
                </div>

                {suspendDialog?.active !== false && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-amber-400/60 shrink-0" />Quick Reason
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SUSPEND_PRESETS.map(({ label, icon, value }) => (
                          <button key={label} onClick={() => setSuspendReason(value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left active:scale-[0.98]
                              ${suspendReason === value
                                ? "bg-amber-500/18 border-amber-500/45 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.12)]"
                                : "bg-white/3 border-white/8 text-white/35 hover:bg-amber-500/8 hover:border-amber-500/25 hover:text-amber-200/80"}`}
                          >
                            <span className={suspendReason === value ? "text-amber-400" : "text-white/20"}>{icon}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 shrink-0 text-white/25" />Custom Reason
                        <span className="text-white/16 font-normal normal-case tracking-normal">(optional)</span>
                      </label>
                      <Textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="Describe why this account is being suspended…"
                        className="bg-black/40 border border-amber-500/15 hover:border-amber-500/25 text-white/70 placeholder:text-white/16 text-xs resize-none focus:border-amber-400/35 focus:ring-0 rounded-lg"
                        rows={3}
                      />
                      <p className="text-white/18 text-[11px] leading-relaxed">
                        This reason will be saved to the database and displayed on the user's suspension page.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel onClick={() => setSuspendReason("")}
              className="cursor-pointer bg-white/4 hover:bg-white/8 text-white/45 hover:text-white/80 border border-white/8 hover:border-white/18 text-sm transition-all">
              Cancel
            </AlertDialogCancel>
            <Button onClick={confirmSuspend} disabled={!!actionLoading}
              className={`cursor-pointer active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg
                ${suspendDialog?.active !== false
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-amber-500/30"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/30"}`}
            >
              {actionLoading
                ? <Loader2   className="w-4 h-4 animate-spin shrink-0" />
                : suspendDialog?.active !== false
                  ? <ShieldOff  className="w-4 h-4 shrink-0" />
                  : <ShieldCheck className="w-4 h-4 shrink-0" />}
              {suspendDialog?.active !== false ? "Confirm Suspension" : "Reactivate Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete dialog ── */}
      <AlertDialog
        open={!!deleteDialog}
        onOpenChange={(open) => { if (!open) { setDeleteDialog(null); setDeleteReason("") } }}
      >
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/25 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">Delete Account</AlertDialogTitle>
                <p className="text-white/28 text-xs mt-0.5">Permanent — cascades to all associated data</p>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <div className="px-3 py-2.5 rounded-lg bg-red-500/6 border border-red-500/18 text-white/45 text-xs leading-relaxed">
                  Permanently deleting{" "}
                  <span className="text-white font-medium">"{deleteDialog?.name}"</span>.{" "}
                  Cannot be undone.
                </div>
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
                            : "bg-white/3 border-white/8 text-white/35 hover:bg-rose-500/8 hover:border-rose-500/25 hover:text-rose-200/80"}`}
                      >
                        <span className={deleteReason === value ? "text-rose-400" : "text-white/20"}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0 text-white/25" />Reason
                    <span className="text-white/16 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Describe why this account is being permanently deleted…"
                    className="bg-black/40 border border-red-500/15 hover:border-red-500/25 text-white/70 placeholder:text-white/16 text-xs resize-none focus:border-red-400/35 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel onClick={() => setDeleteReason("")}
              className="cursor-pointer bg-white/4 hover:bg-white/8 text-white/45 hover:text-white/80 border border-white/8 hover:border-white/18 text-sm transition-all">
              Cancel
            </AlertDialogCancel>
            <Button onClick={confirmDelete} disabled={!!actionLoading}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600
                hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500
                active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg
                hover:shadow-[0_4px_20px_rgba(236,72,153,0.3)]">
              {actionLoading
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : <Trash2  className="w-4 h-4 shrink-0" />}
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function AccountListRow({ item, type, ac, isSelected, onClick }) {
  const isActive = item.active !== false
  return (
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2
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
      <div className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-[52px] h-[52px] rounded-xl border flex items-center justify-center shrink-0 transition-all duration-300 ${ac.avatarBg} ${ac.avatarGlow}`}>
              {isUser
                ? <User     className={`w-5 h-5 ${ac.avatarText}`} />
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
                ? <Loader2    className="w-3.5 h-3.5 animate-spin" />
                : isActive
                  ? <ShieldOff   className="w-3.5 h-3.5" />
                  : <ShieldCheck className="w-3.5 h-3.5" />}
              {isActive ? "Suspend" : "Reactivate"}
            </Button>
            <Button size="sm" onClick={onDelete} disabled={actionLoading === item.id}
              className="h-9 px-4 bg-gradient-to-r from-pink-600/65 to-fuchsia-600/65
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
              <p className="text-white/50 text-sm leading-relaxed">{item.bio || item.description}</p>
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
      <p className={`text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 mb-3 ${ac.heading} opacity-60`}>
        <span>{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5 group/row">
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
      <p className="text-[10px] text-white/28 mt-0.5">{label}</p>
    </div>
  )
}