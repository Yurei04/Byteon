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
  Hash, Clock, Globe, Mail, MapPin, BarChart2, Zap,
  AlertTriangle, Ban, BadgeAlert, Skull, FileWarning,
  Activity,
} from "lucide-react"

// ── accent config ─────────────────────────────────────────────────────────────
const ACCENTS = {
  users: {
    dot:       "bg-sky-400",
    tag:       "text-sky-400",
    badge:     "bg-sky-500/15 text-sky-300 border-sky-500/30",
    heading:   "text-sky-300",
    border:    "border-sky-500/30",
    icon:      "bg-sky-500/15 border-sky-500/25 text-sky-300",
    tabActive: "data-[state=active]:from-sky-600 data-[state=active]:to-blue-600",
  },
  orgs: {
    dot:       "bg-fuchsia-400",
    tag:       "text-fuchsia-400",
    badge:     "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30",
    heading:   "text-fuchsia-300",
    border:    "border-fuchsia-500/30",
    icon:      "bg-fuchsia-500/15 border-fuchsia-500/25 text-fuchsia-300",
    tabActive: "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600",
  },
}

// ── preset reasons ─────────────────────────────────────────────────────────────
const SUSPEND_PRESETS = [
  { label: "Scamming",         icon: <AlertTriangle className="w-3 h-3" />, value: "Account found to be involved in scamming activities." },
  { label: "Spam / Abuse",     icon: <Ban className="w-3 h-3" />,           value: "Repeated spam or abusive behavior reported." },
  { label: "Impersonation",    icon: <BadgeAlert className="w-3 h-3" />,    value: "Account is impersonating another user or organization." },
  { label: "Policy Violation", icon: <FileWarning className="w-3 h-3" />,   value: "Violated platform terms of service or community guidelines." },
]

const DELETE_PRESETS = [
  { label: "Fake Account",     icon: <Skull className="w-3 h-3" />,         value: "Account is confirmed fake or fraudulent." },
  { label: "Scamming",         icon: <AlertTriangle className="w-3 h-3" />, value: "Account engaged in scamming and must be permanently removed." },
  { label: "Severe Violation", icon: <XCircle className="w-3 h-3" />,       value: "Severe or repeated violation of platform policies." },
  { label: "Spam Network",     icon: <Ban className="w-3 h-3" />,           value: "Account is part of a coordinated spam or bot network." },
]

const TAB_CONFIG = [
  { value: "users", label: "Users",         Icon: Users     },
  { value: "orgs",  label: "Organizations", Icon: Building2 },
]

export default function AccountManageSection() {
  const [users, setUsers]               = useState([])
  const [orgs, setOrgs]                 = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState("")
  const [activeTab, setActiveTab]       = useState("users")
  const [selectedItem, setSelectedItem] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]               = useState(null)

  // dialogs
  const [suspendDialog, setSuspendDialog]   = useState(null)  // item
  const [deleteDialog, setDeleteDialog]     = useState(null)  // item
  const [suspendReason, setSuspendReason]   = useState("")
  const [deleteReason, setDeleteReason]     = useState("")

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [{ data: u, error: ue }, { data: o, error: oe }] = await Promise.all([
        supabase.from("users").select("*").order("created_at", { ascending: false }),
        supabase.from("organizations").select("*").order("created_at", { ascending: false }),
      ])
      if (ue) throw ue
      if (oe) throw oe
      setUsers(u || [])
      setOrgs(o || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])
  useEffect(() => { setSelectedItem(null) }, [activeTab])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return {
      users: users.filter((u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.affiliation || "").toLowerCase().includes(q) ||
        (u.country || "").toLowerCase().includes(q)
      ),
      orgs: orgs.filter((o) =>
        (o.name || "").toLowerCase().includes(q) ||
        (o.author_name || "").toLowerCase().includes(q)
      ),
    }
  }, [users, orgs, search])

  // ── Suspend ──────────────────────────────────────────────────────────────────
  const confirmSuspend = async () => {
    if (!suspendDialog) return
    const item  = suspendDialog
    const table = activeTab === "users" ? "users" : "organizations"
    const newActive = item.active !== false  // toggling: if currently active → suspend
    setSuspendDialog(null)
    setActionLoading(item.id)
    try {
      const { error: e1 } = await supabase.from(table).update({
        active: !newActive,
        suspension_reason: !newActive
          ? (suspendReason.trim() || "Suspended by administrator")
          : null,
      }).eq("id", item.id)

      if (e1) {
        const { error: e2 } = await supabase.from(table).update({ active: !newActive }).eq("id", item.id)
        if (e2) throw e2
      }

      // refetch
      const { data } = await supabase.from(table).select("*").order("created_at", { ascending: false })
      if (activeTab === "users") setUsers(data || [])
      else setOrgs(data || [])

      // update selectedItem
      setSelectedItem((prev) => prev?.id === item.id ? { ...prev, active: !newActive } : prev)
      showToast(`Account ${!newActive ? "suspended" : "reactivated"} successfully.`)
    } catch (err) {
      showToast("Failed to update status: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setSuspendReason("")
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteDialog) return
    const item  = deleteDialog
    const table = activeTab === "users" ? "users" : "organizations"
    setDeleteDialog(null)
    setActionLoading(item.id)
    try {
      const { error } = await supabase.from(table).delete().eq("id", item.id)
      if (error) throw error
      if (activeTab === "users") setUsers((prev) => prev.filter((u) => u.id !== item.id))
      else setOrgs((prev) => prev.filter((o) => o.id !== item.id))
      if (selectedItem?.id === item.id) setSelectedItem(null)
      showToast("Account permanently deleted.")
    } catch (err) {
      showToast("Failed to delete: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setDeleteReason("")
    }
  }

  const ac = ACCENTS[activeTab]

  return (
    <div className="flex flex-col h-full gap-4">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium
          animate-in slide-in-from-top-2 fade-in duration-300
          ${toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40"
          }`}
        >
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          }
          {toast.msg}
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">

        {/* ── Tab bar + Search + Refresh ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-black/30 border border-white/8 p-1 rounded-xl h-auto">
            {TAB_CONFIG.map(({ value, label, Icon }) => {
              const a = ACCENTS[value]
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                    text-white/40 hover:text-white/70
                    data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                    ${a.tabActive}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${a.badge}`}>
                    {filtered[value].length}
                  </span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, affiliation…"
              className="pl-9 h-9 bg-black/25 border-white/8 text-white text-sm placeholder:text-white/25 rounded-lg focus:border-white/20 focus:ring-0"
            />
          </div>

          <Button
            size="sm"
            onClick={fetchAll}
            disabled={loading}
            variant="outline"
            className="h-9 px-3 border-white/10 text-white/40 hover:text-white/70 hover:bg-white/6 hover:border-white/20 bg-transparent shrink-0"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <RefreshCw className="w-3.5 h-3.5" />
            }
          </Button>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/60 border border-red-500/25 text-red-300 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {/* ── Tab panels ── */}
        {TAB_CONFIG.map(({ value }) => {
          const a    = ACCENTS[value]
          const list = filtered[value]

          return (
            <TabsContent key={value} value={value} className="flex-1 min-h-0 mt-0">
              <div className="flex gap-3 h-[680px]">

                {/* ── LEFT — scrollable list ── */}
                <div className={`w-[300px] shrink-0 flex flex-col rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? a.border : "border-white/8"}`}
                >
                  {/* header */}
                  <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                    <span className={`text-xs font-bold uppercase tracking-widest ${a.heading}`}>
                      {value === "users" ? "Users" : "Organizations"}
                    </span>
                    <span className="text-white/25 text-xs">
                      {list.length} account{list.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                    </div>
                  ) : list.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20 p-6 text-center">
                      <Inbox className="w-8 h-8 opacity-40" />
                      <p className="text-xs">
                        {search ? `No results for "${search}"` : `No ${value} found`}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-screen overflow-y-hidden">
                      <div className="divide-y divide-white/5">
                        {list.map((item) => (
                          <AccountListRow
                            key={item.id}
                            item={item}
                            type={value}
                            ac={a}
                            isSelected={selectedItem?.id === item.id}
                            onClick={() =>
                              setSelectedItem(selectedItem?.id === item.id ? null : item)
                            }
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>

                {/* ── RIGHT — detail panel ── */}
                <div className={`flex-1 rounded-2xl border bg-black/20 overflow-hidden transition-colors duration-200
                  ${selectedItem ? a.border : "border-white/8"}`}
                >
                  {selectedItem ? (
                    <ScrollArea className="h-screen overflow-y-hidden">
                      <AccountDetailPane
                        key={selectedItem.id}
                        item={selectedItem}
                        type={value}
                        ac={a}
                        actionLoading={actionLoading}
                        onSuspend={() => setSuspendDialog(selectedItem)}
                        onDelete={() => setDeleteDialog(selectedItem)}
                      />
                    </ScrollArea>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-white/15 select-none">
                      <div className="w-14 h-14 rounded-2xl border border-white/8 flex items-center justify-center bg-white/3">
                        {value === "users"
                          ? <Users className="w-6 h-6" />
                          : <Building2 className="w-6 h-6" />
                        }
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-white/20">No account selected</p>
                        <p className="text-xs text-white/10 mt-1">
                          Pick an account from the left to manage it
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

      {/* ── Suspend dialog ── */}
      <AlertDialog
        open={!!suspendDialog}
        onOpenChange={(open) => { if (!open) { setSuspendDialog(null); setSuspendReason("") } }}
      >
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 backdrop-blur-xl border border-amber-500/20 shadow-2xl shadow-amber-900/20 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                {suspendDialog?.active !== false
                  ? <ShieldOff className="w-5 h-5 text-amber-400" />
                  : <ShieldCheck className="w-5 h-5 text-emerald-400" />
                }
              </div>
              <div>
                <AlertDialogTitle className={`text-base font-semibold ${suspendDialog?.active !== false ? "text-amber-200" : "text-emerald-200"}`}>
                  {suspendDialog?.active !== false ? "Suspend Account" : "Reactivate Account"}
                </AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">
                  {suspendDialog?.active !== false
                    ? "Account will be locked immediately"
                    : "Account will regain full access"
                  }
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-white/55">
                  You are {suspendDialog?.active !== false ? "suspending" : "reactivating"}{" "}
                  <span className="text-white font-medium">"{suspendDialog?.name}"</span>.
                  {suspendDialog?.active !== false && " They will lose access to the platform until manually reactivated."}
                </p>

                {/* Only show reason for suspension, not reactivation */}
                {suspendDialog?.active !== false && (
                  <div className="space-y-3">
                    {/* Quick presets */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                        <Zap className="w-3 h-3 shrink-0" />
                        Quick Reason
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SUSPEND_PRESETS.map(({ label, icon, value }) => (
                          <button
                            key={label}
                            onClick={() => setSuspendReason(value)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left
                              ${suspendReason === value
                                ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                                : "bg-white/3 border-white/8 text-white/40 hover:bg-white/6 hover:border-white/15 hover:text-white/65"
                              }`}
                          >
                            <span className={suspendReason === value ? "text-amber-400" : "text-white/25"}>{icon}</span>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom reason */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                        <ShieldAlert className="w-3 h-3 shrink-0" />
                        Reason
                        <span className="text-white/18 font-normal normal-case tracking-normal">(or write custom)</span>
                      </label>
                      <Textarea
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="Describe why this account is being suspended…"
                        className="bg-black/40 border border-amber-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-amber-400/30 focus:ring-0 rounded-lg"
                        rows={3}
                      />
                      <p className="text-white/20 text-[11px] leading-relaxed">
                        The account holder will see this reason. If blank, a generic message is shown.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => setSuspendReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all duration-200"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={confirmSuspend}
              disabled={!!actionLoading}
              className={`cursor-pointer active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all duration-200 shadow-lg
                ${suspendDialog?.active !== false
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-amber-500/25"
                  : "bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 hover:shadow-emerald-500/25"
                }`}
            >
              {actionLoading
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : suspendDialog?.active !== false
                  ? <ShieldOff className="w-4 h-4 shrink-0" />
                  : <ShieldCheck className="w-4 h-4 shrink-0" />
              }
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
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">
                  Delete Account
                </AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">
                  Permanent — cascades to all associated data
                </p>
              </div>
            </div>

            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-white/55">
                  You are permanently deleting{" "}
                  <span className="text-white font-medium">"{deleteDialog?.name}"</span>.
                  This cannot be undone and will remove all linked content.
                </p>

                {/* Quick presets */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <Zap className="w-3 h-3 shrink-0" />
                    Quick Reason
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {DELETE_PRESETS.map(({ label, icon, value }) => (
                      <button
                        key={label}
                        onClick={() => setDeleteReason(value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 text-left
                          ${deleteReason === value
                            ? "bg-red-500/20 border-red-500/40 text-red-300"
                            : "bg-white/3 border-white/8 text-white/40 hover:bg-white/6 hover:border-white/15 hover:text-white/65"
                          }`}
                      >
                        <span className={deleteReason === value ? "text-red-400" : "text-white/25"}>{icon}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom reason */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0" />
                    Reason for Deletion
                    <span className="text-white/18 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Describe why this account is being permanently deleted…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={3}
                  />
                  <p className="text-white/20 text-[11px] leading-relaxed">
                    For audit trail purposes only. Leave blank to delete without a logged reason.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel
              onClick={() => setDeleteReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all duration-200"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={confirmDelete}
              disabled={!!actionLoading}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600
                hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500
                active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all duration-200
                shadow-lg hover:shadow-pink-500/25"
            >
              {actionLoading
                ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                : <Trash2 className="w-4 h-4 shrink-0" />
              }
              Delete Permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── List row ──────────────────────────────────────────────────────────────────
function AccountListRow({ item, type, ac, isSelected, onClick }) {
  const isActive = item.active !== false

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 m-4 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected
          ? "bg-white/6 border-l-current"
          : "border-l-transparent hover:bg-green hover:border-l-white/10"
        }`}
    >
      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}
        ${isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}
      />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-xs font-semibold leading-snug truncate
            ${isSelected ? "text-white" : "text-white/60 group-hover:text-white/85"}`}
          >
            {item.name || <span className="italic text-white/30">Unnamed</span>}
          </p>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium shrink-0 ${
            isActive
              ? "bg-emerald-500/10 text-emerald-400/70 border-emerald-500/15"
              : "bg-red-500/10 text-red-400/70 border-red-500/15"
          }`}>
            {isActive ? "Active" : "Suspended"}
          </span>
        </div>

        <p className={`text-[11px] truncate ${ac.tag} opacity-75`}>
          {type === "users"
            ? item.affiliation || item.country || "No affiliation"
            : item.author_name || "No contact"
          }
        </p>

        <p className="text-[10px] text-white/20">
          Joined {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors
        ${isSelected ? ac.tag : "text-white/12 group-hover:text-white/25"}`}
      />
    </button>
  )
}

// ── Detail pane ───────────────────────────────────────────────────────────────
function AccountDetailPane({ item, type, ac, actionLoading, onSuspend, onDelete }) {
  const isUser   = type === "users"
  const isActive = item.active !== false

  return (
    <div className="h-full flex flex-col">

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5 border-b border-white/8 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* avatar */}
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${ac.icon}`}>
              {isUser
                ? <User className="w-5 h-5" />
                : <Building2 className="w-5 h-5" />
              }
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <h2 className="text-lg font-bold text-white leading-tight truncate">
                {item.name || <span className="italic text-white/30">Unnamed</span>}
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${ac.badge} border text-[11px]`}>
                  {isUser ? "User Account" : "Organization"}
                </Badge>
                <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                    : "bg-red-500/10 text-red-300 border-red-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                  {isActive ? "Active" : "Suspended"}
                </span>
              </div>
            </div>
          </div>

          {/* action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={onSuspend}
              disabled={actionLoading === item.id}
              className={`h-9 px-4 border-0 gap-2 text-xs font-medium shadow-md active:scale-[0.97] transition-all duration-200
                ${isActive
                  ? "bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border border-amber-500/30 shadow-amber-900/20 hover:shadow-amber-500/15"
                  : "bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 border border-emerald-500/30 shadow-emerald-900/20 hover:shadow-emerald-500/15"
                }`}
            >
              {actionLoading === item.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : isActive
                  ? <ShieldOff className="w-3.5 h-3.5" />
                  : <ShieldCheck className="w-3.5 h-3.5" />
              }
              {isActive ? "Suspend" : "Reactivate"}
            </Button>
            <Button
              size="sm"
              onClick={onDelete}
              disabled={actionLoading === item.id}
              className="h-9 px-4 bg-gradient-to-r from-pink-600/70 to-fuchsia-600/70
                hover:from-pink-500 hover:to-fuchsia-500 text-white border-0 gap-2 text-xs font-medium
                shadow-md hover:shadow-pink-500/20 active:scale-[0.97] transition-all duration-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-6">

          {/* Suspension notice */}
          {!isActive && (
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/8 border border-red-500/20">
              <ShieldOff className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-300 text-xs font-semibold mb-0.5">Account Suspended</p>
                <p className="text-white/40 text-xs leading-relaxed">
                  {item.suspension_reason || "Suspended by administrator. No reason provided."}
                </p>
              </div>
            </div>
          )}

          {/* Profile info */}
          <DetailBlock icon={<User className="w-3.5 h-3.5" />} label={isUser ? "Profile" : "Contact"}>
            <div className="space-y-2">
              {isUser ? (
                <>
                  {item.affiliation && (
                    <InfoRow icon={<Building2 className="w-3 h-3" />} label="Affiliation" value={item.affiliation} />
                  )}
                  {item.country && (
                    <InfoRow icon={<MapPin className="w-3 h-3" />} label="Country" value={item.country} />
                  )}
                  {item.email && (
                    <InfoRow icon={<Mail className="w-3 h-3" />} label="Email" value={item.email} />
                  )}
                </>
              ) : (
                <>
                  {item.author_name && (
                    <InfoRow icon={<User className="w-3 h-3" />} label="Contact Person" value={item.author_name} />
                  )}
                  {item.email && (
                    <InfoRow icon={<Mail className="w-3 h-3" />} label="Email" value={item.email} />
                  )}
                  {item.website && (
                    <InfoRow icon={<Globe className="w-3 h-3" />} label="Website" value={item.website} />
                  )}
                </>
              )}
              <InfoRow
                icon={<Calendar className="w-3 h-3" />}
                label="Joined"
                value={new Date(item.created_at).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              />
            </div>
          </DetailBlock>

          {/* Stats */}
          <DetailBlock icon={<BarChart2 className="w-3.5 h-3.5" />} label="Activity Stats">
            <div className="grid grid-cols-3 gap-2">
              {isUser ? (
                <>
                  <StatCard label="Projects"  value={item.total_projects         ?? 0} />
                  <StatCard label="Hackathons" value={item.total_hackathons_joined ?? 0} />
                  <StatCard label="Blogs Read" value={item.total_blogs_read        ?? 0} />
                </>
              ) : (
                <>
                  <StatCard label="Posts"     value={item.total_announcements ?? 0} />
                  <StatCard label="Blogs"     value={item.total_blogs         ?? 0} />
                  <StatCard label="Resources" value={item.total_resources     ?? 0} />
                </>
              )}
            </div>
          </DetailBlock>

          {/* Description / bio */}
          {(item.bio || item.description) && (
            <DetailBlock icon={<Activity className="w-3.5 h-3.5" />} label={isUser ? "Bio" : "Description"}>
              <p className="text-white/55 text-sm leading-relaxed">
                {item.bio || item.description}
              </p>
            </DetailBlock>
          )}

          {/* Account ID */}
          <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] text-white/15 font-mono">
              <Hash className="w-3 h-3" />{item.id}
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-3">
        <span className="text-white/35">{icon}</span>
        {label}
      </p>
      {children}
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-white/25 shrink-0">{icon}</span>
      <span className="text-white/30 text-xs min-w-[80px]">{label}</span>
      <span className="text-white/65 text-xs truncate">{value}</span>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="px-3 py-3 rounded-xl bg-white/4 border border-white/8 text-center">
      <p className="text-lg font-bold text-white/80">{value}</p>
      <p className="text-[10px] text-white/30 mt-0.5">{label}</p>
    </div>
  )
}