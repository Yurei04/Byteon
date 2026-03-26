"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/components/(auth)/authContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Megaphone, FileText, BookOpen, CheckCircle, XCircle,
  Loader2, AlertCircle, Calendar, Building2, Trophy,
  Link2, Tag, MapPin, Clock, User, Hash, Globe,
  AlignLeft, Award, Users, ExternalLink, Inbox,
  ShieldAlert, ShieldCheck,
  EyeOff,
  Eye,
  ArrowLeft,
  ChevronRight,
} from "lucide-react"

export default function ApprovalSection({ onApprovalChange }) {
  const { session } = useAuth()

  const [pending, setPending]             = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [toast, setToast]                 = useState(null)

  // Confirm dialogs
  const [approveDialog, setApproveDialog] = useState(null)   // item
  const [rejectDialog, setRejectDialog]   = useState(null)   // item
  const [rejectionReason, setRejectionReason] = useState("")

  const totalPending =
  pending.announcements.length +
  pending.blogs.length +
  pending.resources.length

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
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
      showToast("Failed to load pending items: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }, [onApprovalChange])

  useEffect(() => { fetchPending() }, [fetchPending])

  // Auto-select first item when tab/list changes
  useEffect(() => {
    const list = pending[activeTab]
    if (list.length > 0) {
      setSelectedItem((prev) =>
        prev && list.find((i) => i.id === prev.item?.id)
          ? prev
          : { item: list[0], type: activeTab }
      )
    } else {
      setSelectedItem(null)
    }
  }, [activeTab, pending])

  const handleTabChange = (val) => { setActiveTab(val); setSelectedItem(null) }

  // ── Approve (called after confirmation) ───────────────────────────────────
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
        if (orgRow) await supabase.from("organizations").update({ [countField]: (orgRow[countField] || 0) + 1 }).eq("id", item.organization_id)
      }

      setPending((prev) => {
        const next = { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) }
        setSelectedItem(
          next[type].length > 0
            ? { item: next[type][0], type }
            : null
        )
        onApprovalChange?.(next.announcements.length + next.blogs.length + next.resources.length)
        return next
      })
      showToast(`"${item.title}" approved and published!`)
    } catch (err) {
      showToast("Approval failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
    }
  }

  // ── Reject (called after confirmation) ────────────────────────────────────
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

      setPending((prev) => {
        const next = { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) }
        setSelectedItem(
          next[type].length > 0
            ? { item: next[type][0], type }
            : null
        )
        onApprovalChange?.(next.announcements.length + next.blogs.length + next.resources.length)
        return next
      })
      showToast(`"${item.title}" rejected.`)
    } catch (err) {
      showToast("Rejection failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setRejectionReason("")
    }
  }

  const tabConfig = [
    { value: "announcements", label: "Announcements", Icon: Megaphone, color: "fuchsia" },
    { value: "blogs",         label: "Blogs",         Icon: FileText,  color: "purple"  },
    { value: "resources",     label: "Resources",     Icon: BookOpen,  color: "emerald" },
  ]

  
  return (
    <>
      {/* Toast */}
      {toast && (
        <Alert className={`mb-4 ${toast.type === "error"
          ? "bg-red-900/30 border-red-500/40 text-red-200"
          : "bg-emerald-900/30 border-emerald-500/40 text-emerald-200"}`}>
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4" />
            : <CheckCircle className="w-4 h-4" />}
          <AlertDescription>{toast.msg}</AlertDescription>
        </Alert>
      )}

      {/* Summary */}
      <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <Clock className="w-5 h-5 text-amber-400" />
        <span className="text-amber-200 text-sm">
          {totalPending > 0
            ? <><strong className="text-amber-300">{totalPending}</strong> item{totalPending !== 1 ? "s" : ""} awaiting review</>
            : "All caught up — no pending items!"}
        </span>
        {selectedItem && (
          <button
            onClick={() => setSelectedItem(null)}
            className="ml-auto flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <EyeOff className="w-3 h-3" /> Close preview
          </button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-fuchsia-500/20 p-1 mb-5">
          {tabConfig.map(({ value, label, Icon, color }) => (
            <TabsTrigger key={value} value={value}
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white
                ${color === "fuchsia" ? "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600" : ""}
                ${color === "purple"  ? "data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"    : ""}
                ${color === "emerald" ? "data-[state=active]:from-emerald-600 data-[state=active]:to-green-600"  : ""}
              `}>
              <Icon className="w-4 h-4" />
              {label}
              {pending[value].length > 0 && (
                <Badge className="ml-1 text-xs bg-amber-500/30 text-amber-200 border-amber-500/30">
                  {pending[value].length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabConfig.map(({ value, label }) => (
          <TabsContent key={value} value={value}>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-fuchsia-300" />
              </div>
            ) : pending[value].length === 0 ? (
              <div className="text-center py-16 text-white/30">
                <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30 text-emerald-400" />
                <p>No pending {label.toLowerCase()}</p>
              </div>
            ) : (
              /* ── Split-screen layout ── */
              <div className={`flex gap-4 ${selectedItem ? "flex-col lg:flex-row" : "flex-col"}`}>

                {/* Left — Card List */}
                <div className={`flex flex-col gap-3 ${selectedItem ? "lg:w-[340px] lg:shrink-0" : "w-full"}`}>
                  {pending[value].map((item) => (
                    <PendingCard
                      key={item.id}
                      item={item}
                      type={value}
                      actionLoading={actionLoading}
                      isSelected={selectedItem?.item?.id === item.id}
                      compact={!!selectedItem}
                      onView={() =>
                        setSelectedItem(
                          selectedItem?.item?.id === item.id ? null : { item, type: value }
                        )
                      }
                      onApprove={() => setApproveDialog(item)}
                      onReject={() => {
                        setRejectDialog(item)
                        setRejectionReason("")
                      }}
                    />
                  ))}
                </div>

                {/* Right — Detail Panel */}
                {selectedItem && selectedItem.type === value && (
                  <div className="flex-1 min-w-0">
                    <DetailPanel
                      item={selectedItem.item}
                      type={selectedItem.type}
                      actionLoading={actionLoading}
                      onClose={() => setSelectedItem(null)}
                      onApprove={() => setApproveDialog(selectedItem.item)}
                      onReject={() => {
                        setRejectDialog(selectedItem.item)
                        setRejectionReason("")
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      
      {/* ── Approve confirmation dialog ── */}
      <AlertDialog open={!!approveDialog} onOpenChange={(open) => !open && setApproveDialog(null)}>
        <AlertDialogContent className="bg-gradient-to-br ${accent.from} to-slate-950/80 backdrop-blur-xl border border-emerald-500 shadow-2xl shadow-emerald-900/30">
          <AlertDialogHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <AlertDialogTitle className="text-emerald-200 text-lg">
                Approve & Publish
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p className="text-white/60">
                  You are about to publish{" "}
                  <span className="text-white font-medium">"{approveDialog?.title}"</span>{" "}
                  by{" "}
                  <span className="text-emerald-300 font-medium">{approveDialog?.organization || "unknown org"}</span>.
                </p>
                {/* Disclaimer box */}
                <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/20 p-4 space-y-2">
                  <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    Admin Disclaimer
                  </p>
                  <ul className="text-white/50 text-xs space-y-1.5 leading-relaxed list-none">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500/60 mt-0.5 shrink-0">•</span>
                      This content will be immediately visible to all platform users.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500/60 mt-0.5 shrink-0">•</span>
                      You confirm this post complies with platform guidelines and policies.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500/60 mt-0.5 shrink-0">•</span>
                      This action is logged under your admin account and cannot be undone.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500/60 mt-0.5 shrink-0">•</span>
                      The submitting organization will be notified of this approval.
                    </li>
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel
              className="cursor-pointer bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all duration-200"
            >
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={confirmApprove}
              className="cursor-pointer bg-gradient-to-r from-green-600 to-green-600 hover:from-lime-500 hover:to-lime-500 active:scale-[0.97] text-white border-0 gap-2 transition-all duration-200 shadow-md hover:shadow-lime-500/20"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              Yes, Approve & Publish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject confirmation dialog ── */}
      <AlertDialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) { setRejectDialog(null); setRejectionReason("") } }}>
        <AlertDialogContent className="bg-gradient-to-br ${accent.from} to-slate-950/80 backdrop-blur-xl border border-red-500/25 shadow-2xl shadow-red-900/20">
          <AlertDialogHeader className="gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <AlertDialogTitle className="text-red-200 text-lg">
                Reject Submission
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-white/60">
                  You are rejecting{" "}
                  <span className="text-white font-medium">"{rejectDialog?.title}"</span>{" "}
                  submitted by{" "}
                  <span className="text-red-300 font-medium">{rejectDialog?.organization || "unknown org"}</span>.
                </p>

                {/* Reason input */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-white/35 flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 shrink-0" />
                    Reason for Rejection
                    <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Content does not meet community guidelines, missing required information, inappropriate language…"
                    className="bg-black/40 border border-red-500/20 text-white/80 placeholder:text-white/20 text-sm resize-none focus:border-red-400/40 focus:ring-0 rounded-lg"
                    rows={4}
                  />
                  <p className="text-white/25 text-xs leading-relaxed">
                    This message will be sent to the organization. Be clear and constructive.
                    If left blank, a generic reason will be used.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel
              onClick={() => setRejectionReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all duration-200"
            >
              Cancel
            </AlertDialogCancel>

            <Button
              onClick={confirmReject}
              className="cursor-pointer bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.97] text-white border-0 gap-2 transition-all duration-200 shadow-md hover:shadow-red-500/20"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              Confirm Rejection
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  )
}

// ── Pending card (list side) ──────────────────────────────────────────────────
function PendingCard({ item, type, actionLoading, isSelected, compact, onView, onApprove, onReject }) {
  const isBusy = actionLoading === item.id

  return (
    <Card
      onClick={onView}
      className={`cursor-pointer transition-all duration-200 group
        ${isSelected
          ? "bg-gradient-to-br from-fuchsia-900/40 to-purple-900/40 border border-fuchsia-400/50 shadow-lg shadow-fuchsia-500/10"
          : "bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-amber-500/20 hover:border-fuchsia-400/40 hover:shadow-md hover:shadow-fuchsia-500/10"
        }
        backdrop-blur-lg
      `}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Org + time */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {item.organization && (
                <Badge className="bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 text-xs flex items-center gap-1">
                  <Building2 className="w-3 h-3" />{item.organization}
                </Badge>
              )}
              <span className="text-white/30 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(item.created_at).toLocaleString()}
              </span>
            </div>

            {/* Title */}
            <h3 className={`font-bold text-white truncate ${compact ? "text-sm" : "text-base"}`}>
              {item.title}
            </h3>

            {/* Description — hide when compact */}
            {!compact && item.des && (
              <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mt-1">{item.des}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
            {/* View toggle */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onView}
              className={`h-8 w-8 p-0 transition-colors
                ${isSelected
                  ? "text-fuchsia-300 bg-fuchsia-500/20 hover:bg-fuchsia-500/30"
                  : "text-white/40 hover:text-fuchsia-300 hover:bg-fuchsia-500/10"
                }`}
              title={isSelected ? "Close preview" : "Preview"}
            >
              {isSelected ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>

            {!compact && (
              <>
                <Button
                  size="sm"
                  onClick={onApprove}
                  disabled={isBusy}
                  className="h-8 px-3 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs"
                >
                  {isBusy
                    ? <Loader2 className="w-3 h-3 animate-spin" />
                    : <><CheckCircle className="w-3 h-3 mr-1" />Approve</>}
                </Button>
                <Button
                  size="sm"
                  onClick={onReject}
                  disabled={isBusy}
                  className="h-8 px-3 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs"
                >
                  <XCircle className="w-3 h-3 mr-1" />Reject
                </Button>
              </>
            )}

            {/* Compact mode: chevron hint */}
            {compact && (
              <ChevronRight className={`w-4 h-4 transition-colors ${isSelected ? "text-fuchsia-300" : "text-white/20"}`} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Detail Panel (right side) ─────────────────────────────────────────────────
function DetailPanel({ item, type, actionLoading, onClose, onApprove, onReject }) {
  const isBusy = actionLoading === item.id

  // Determine accent color per type
  const accent = {
    announcements: { border: "border-fuchsia-500/30", from: "from-fuchsia-900/20", badge: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30", heading: "text-fuchsia-300" },
    blogs:         { border: "border-purple-500/30",  from: "from-purple-900/20",  badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",   heading: "text-purple-300"  },
    resources:     { border: "border-emerald-500/30", from: "from-emerald-900/20", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", heading: "text-emerald-300" },
  }[type]

  return (
    <Card className={`h-full bg-gradient-to-br ${accent.from} to-slate-950/80 backdrop-blur-xl border ${accent.border} shadow-xl`}>
      <CardContent className="p-5 flex flex-col gap-5 h-full">

        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="lg:hidden flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <span className={`text-xs font-semibold uppercase tracking-widest ${accent.heading}`}>
              {type === "announcements" ? "Announcement" : type === "blogs" ? "Blog Post" : "Resource"} Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onApprove}
              disabled={isBusy}
              className="h-8 px-4 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 text-xs"
            >
              {isBusy
                ? <Loader2 className="w-3 h-3 animate-spin" />
                : <><CheckCircle className="w-3 h-3 mr-1.5" />Approve</>}
            </Button>
            <Button
              size="sm"
              onClick={onReject}
              disabled={isBusy}
              className="h-8 px-4 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30 text-xs"
            >
              <XCircle className="w-3 h-3 mr-1.5" />Reject
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className={`h-px bg-gradient-to-r from-transparent via-white/10 to-transparent`} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

          {/* Organization + Submitted */}
          <div className="flex flex-wrap gap-2">
            {item.organization && (
              <Badge className={`${accent.badge} border text-xs flex items-center gap-1.5`}>
                <Building2 className="w-3 h-3" />{item.organization}
              </Badge>
            )}
            <Badge className="bg-white/5 text-white/40 border border-white/10 text-xs flex items-center gap-1.5">
              <Clock className="w-3 h-3" />Submitted {new Date(item.created_at).toLocaleString()}
            </Badge>
          </div>

          {/* Title */}
          <div>
            <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Title</p>
            <h2 className="text-xl font-bold text-white leading-snug">{item.title}</h2>
          </div>

          {/* Description */}
          {item.des && (
            <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{item.des}</p>
            </DetailBlock>
          )}

          {/* ── Announcement-specific ── */}
          {type === "announcements" && (
            <>
              {(item.date_begin || item.date_end) && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Event Dates">
                  <p className="text-white/70 text-sm">
                    {item.date_begin ? new Date(item.date_begin).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                    {" "}<span className="text-white/30 mx-1">→</span>{" "}
                    {item.date_end   ? new Date(item.date_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  </p>
                </DetailBlock>
              )}

              {item.open_to && (
                <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
                  <p className="text-white/70 text-sm">{item.open_to}</p>
                </DetailBlock>
              )}

              {item.prizes && item.prizes.length > 0 && (
                <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${item.prizes.length})`}>
                  <div className="space-y-2">
                    {item.prizes.map((prize, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20">
                        <Award className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          {prize.place && <p className="text-amber-300 text-xs font-semibold">{prize.place}</p>}
                          {prize.reward && <p className="text-white/60 text-xs">{prize.reward}</p>}
                          {/* fallback for plain strings */}
                          {typeof prize === "string" && <p className="text-white/60 text-xs">{prize}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailBlock>
              )}

              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:text-fuchsia-300 text-sm flex items-center gap-1.5 underline-offset-2 hover:underline break-all">
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Blog-specific ── */}
          {type === "blogs" && (
            <>
              {item.author && (
                <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
                  <p className="text-white/70 text-sm">{item.author}</p>
                </DetailBlock>
              )}

              {item.theme && (
                <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Theme / Category">
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs">
                    {item.theme}
                  </Badge>
                </DetailBlock>
              )}

              {item.place && (
                <DetailBlock icon={<MapPin className="w-3.5 h-3.5" />} label="Place / Venue">
                  <p className="text-white/70 text-sm">{item.place}</p>
                </DetailBlock>
              )}

              {item.date && (
                <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Date">
                  <p className="text-white/70 text-sm">
                    {new Date(item.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </DetailBlock>
              )}

              {/* Body / full content */}
              {item.content && (
                <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Full Content">
                  <div className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                    {item.content}
                  </div>
                </DetailBlock>
              )}

              {item.link && (
                <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1.5 underline-offset-2 hover:underline break-all">
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </DetailBlock>
              )}
            </>
          )}

          {/* ── Resource-specific ── */}
          {type === "resources" && (
            <>
              {item.category && (
                <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Category">
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs">
                    {item.category}
                  </Badge>
                </DetailBlock>
              )}

              {item.type_label && (
                <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Resource Type">
                  <p className="text-white/70 text-sm">{item.type_label}</p>
                </DetailBlock>
              )}

              {item.link && (
                <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Resource Link">
                  <a href={item.link} target="_blank" rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1.5 underline-offset-2 hover:underline break-all">
                    {item.link}<ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </DetailBlock>
              )}

              {item.tags && item.tags.length > 0 && (
                <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Tags">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag, idx) => (
                      <Badge key={idx} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                        #{typeof tag === "string" ? tag : tag.name}
                      </Badge>
                    ))}
                  </div>
                </DetailBlock>
              )}
            </>
          )}

          {/* Submitted by (UUID shown as reference) */}
          {item.submitted_by && (
            <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Submitted By (User ID)">
              <p className="text-white/30 text-xs font-mono break-all">{item.submitted_by}</p>
            </DetailBlock>
          )}

        </div>
      </CardContent>
    </Card>
  )
}

// ── Small helper: labeled detail row ─────────────────────────────────────────
function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p className="text-white/30 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <span className="text-white/40">{icon}</span>
        {label}
      </p>
      {children}
    </div>
  )
}


// ── Meta pill (for submitted/user rows) ───────────────────────────────────────
function Meta({ icon, label, children }) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/30">
      <span className="w-3.5 h-3.5 flex items-center justify-center text-white/20 [&>svg]:w-full [&>svg]:h-full shrink-0">
        {icon}
      </span>
      <span className="text-white/18 uppercase tracking-wider text-[10px] font-semibold">{label}:</span>
      <span>{children}</span>
    </div>
  )
}

function Field({ icon, label, children }) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/22">
        <span className="w-3.5 h-3.5 flex items-center justify-center text-white/18 [&>svg]:w-full [&>svg]:h-full shrink-0">
          {icon}
        </span>
        {label}
      </p>
      {children}
    </div>
  )
}


// ── External link ─────────────────────────────────────────────────────────────
function LinkDisplay({ href, color }) {
  const cls = {
    fuchsia: "text-fuchsia-400 hover:text-fuchsia-300",
    purple:  "text-purple-400  hover:text-purple-300",
    emerald: "text-emerald-400 hover:text-emerald-300",
  }[color]
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm underline-offset-2 hover:underline break-all transition-colors ${cls}`}>
      <span>{href}</span>
      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" />
    </a>
  )
}