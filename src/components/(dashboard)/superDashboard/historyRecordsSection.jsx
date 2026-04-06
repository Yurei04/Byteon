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
  Megaphone, FileText, BookOpen, CheckCircle, XCircle,
  Loader2, AlertCircle, Calendar, Building2, Trophy,
  Link2, Tag, Clock, User, Hash, Globe,
  AlignLeft, Award, Users, ExternalLink, Inbox,
  ShieldAlert, ShieldCheck, ChevronRight, ChevronLeft, Search,
} from "lucide-react"

import { notifyPostApproved, notifyPostRejected } from "@/lib/notification"

const ITEMS_PER_PAGE = 10

// ── Pagination component ───────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
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
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "border-white/8 text-white/30 hover:bg-amber-500/10 hover:border-amber-500/30 hover:text-amber-300"}`}
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

export default function ApprovalSection({ onApprovalChange }) {
  const { session } = useAuth()

  const [pending, setPending]             = useState({ announcements: [], blogs: [], resources: [] })
  const [loading, setLoading]             = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [activeTab, setActiveTab]         = useState("announcements")
  const [selectedItem, setSelectedItem]   = useState(null)
  const [toast, setToast]                 = useState(null)
  const [search, setSearch]               = useState("")

  const [approveDialog, setApproveDialog] = useState(null)
  const [rejectDialog, setRejectDialog]   = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")

  // Pagination per tab
  const [pages, setPages] = useState({ announcements: 1, blogs: 1, resources: 1 })

  const totalPending =
    pending.announcements.length + pending.blogs.length + pending.resources.length

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

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

  useEffect(() => {
    const list = filtered[activeTab]
    if (list.length > 0) {
      setSelectedItem((prev) =>
        prev && list.find((i) => i.id === prev.item?.id)
          ? prev
          : { item: list[0], type: activeTab }
      )
    } else {
      setSelectedItem(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pending])

  // Reset pages on search/tab change
  useEffect(() => {
    setPages({ announcements: 1, blogs: 1, resources: 1 })
  }, [search, activeTab])

  const handleTabChange = (val) => { setActiveTab(val); setSelectedItem(null); setSearch("") }
  const setPage = (tab, page) => setPages((prev) => ({ ...prev, [tab]: page }))

  // Filtered lists
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

  // Paginated slices
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
        status: "approved",
        reviewed_by: session?.user?.id,
        reviewed_at: new Date().toISOString(),
      }).eq("id", item.id)

      if (item.organization_id && countField) {
        const { data: orgRow } = await supabase
          .from("organizations").select(countField).eq("id", item.organization_id).single()
        if (orgRow) {
          await supabase.from("organizations")
            .update({ [countField]: (orgRow[countField] || 0) + 1 })
            .eq("id", item.organization_id)
        }
      }

      await notifyPostApproved({
        submittedBy:  item.submitted_by,
        contentType:  type.replace(/s$/, ""),
        title:        item.title,
      })

      setPending((prev) => {
        const next = { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) }
        setSelectedItem(next[type].length > 0 ? { item: next[type][0], type } : null)
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

  // ── Reject ─────────────────────────────────────────────────────────────────
  const confirmReject = async () => {
    const item = rejectDialog
    const type = activeTab
    setRejectDialog(null)
    setActionLoading(item.id)
    try {
      await supabase.from(`pending_${type}`).update({
        status:           "rejected",
        rejection_reason: rejectionReason.trim() || "No reason provided",
        reviewed_by:      session?.user?.id,
        reviewed_at:      new Date().toISOString(),
      }).eq("id", item.id)

      await notifyPostRejected({
        submittedBy:  item.submitted_by,
        contentType:  type.replace(/s$/, ""),
        title:        item.title,
        reason:       rejectionReason.trim() || "No reason provided",
      })

      setPending((prev) => {
        const next = { ...prev, [type]: prev[type].filter((i) => i.id !== item.id) }
        setSelectedItem(next[type].length > 0 ? { item: next[type][0], type } : null)
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
    { value: "announcements", label: "Announcements", Icon: Megaphone, tabActive: "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600" },
    { value: "blogs",         label: "Blogs",         Icon: FileText,  tabActive: "data-[state=active]:from-pink-600 data-[state=active]:to-fuchsia-600"   },
    { value: "resources",     label: "Resources",     Icon: BookOpen,  tabActive: "data-[state=active]:from-violet-600 data-[state=active]:to-purple-600"  },
  ]

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm font-medium
          animate-in slide-in-from-top-2 fade-in duration-300
          ${toast.type === "error"
            ? "bg-red-950/90 border-red-500/40 text-red-200 shadow-red-900/40"
            : "bg-emerald-950/90 border-emerald-500/40 text-emerald-200 shadow-emerald-900/40"}`}
        >
          {toast.type === "error"
            ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            : <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Summary bar */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/18">
        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-amber-200/80 text-sm">
          {totalPending > 0
            ? <><strong className="text-amber-300">{totalPending}</strong> item{totalPending !== 1 ? "s" : ""} awaiting review</>
            : "All caught up — no pending items!"}
        </span>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Tabs + Search row */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <TabsList className="bg-black/30 border border-white/8 p-1 rounded-xl h-auto">
            {tabConfig.map(({ value, label, Icon, tabActive }) => (
              <TabsTrigger key={value} value={value}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  text-white/40 hover:text-white/70
                  data-[state=active]:bg-gradient-to-r data-[state=active]:text-white data-[state=active]:shadow-lg
                  ${tabActive}`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {pending[value].length > 0 && (
                  <Badge className="ml-1 text-[10px] px-1.5 py-0.5 bg-amber-500/25 text-amber-200 border border-amber-500/30">
                    {pending[value].length}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="relative flex-1 max-w-xs group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-white/50 transition-colors" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, organization…"
              className="pl-9 h-9 bg-black/30 border-white/8 hover:border-white/15 focus:border-white/25 text-white text-sm placeholder:text-white/20 rounded-lg focus:ring-0 transition-colors"
            />
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
                  <Loader2 className="w-6 h-6 animate-spin text-fuchsia-400/60" />
                </div>
              ) : list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/20">
                  {search
                    ? <><Inbox className="w-10 h-10 opacity-30" /><p className="text-sm">No results for "{search}"</p></>
                    : <><CheckCircle className="w-10 h-10 opacity-30 text-emerald-400" /><p className="text-sm">No pending {value}</p></>}
                </div>
              ) : (
                <div className="flex gap-3 h-[620px]">
                  {/* LEFT — list */}
                  <div className="w-[300px] shrink-0 flex flex-col rounded-2xl border border-white/8 bg-black/20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between shrink-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Queue</span>
                      <div className="flex items-center gap-2">
                        {tp > 1 && <span className="text-white/18 text-[10px]">p.{cp}/{tp}</span>}
                        <span className="text-white/25 text-xs">{list.length} pending</span>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 min-h-0">
                      <div className="divide-y divide-white/5">
                        {pageList.map((item) => (
                          <PendingListRow
                            key={item.id}
                            item={item}
                            isSelected={selectedItem?.item?.id === item.id}
                            onClick={() => setSelectedItem(
                              selectedItem?.item?.id === item.id ? null : { item, type: value }
                            )}
                          />
                        ))}
                      </div>
                    </ScrollArea>

                    <Pagination
                      currentPage={cp}
                      totalPages={tp}
                      onPageChange={(p) => { setPage(value, p); setSelectedItem(null) }}
                    />
                  </div>

                  {/* RIGHT — detail */}
                  <div className="flex-1 rounded-2xl border border-white/8 bg-black/20 overflow-hidden">
                    {selectedItem && selectedItem.type === value ? (
                      <DetailPanel
                        item={selectedItem.item}
                        type={selectedItem.type}
                        actionLoading={actionLoading}
                        onClose={() => setSelectedItem(null)}
                        onApprove={() => setApproveDialog(selectedItem.item)}
                        onReject={() => { setRejectDialog(selectedItem.item); setRejectionReason("") }}
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 text-white/15 select-none">
                        <Inbox className="w-10 h-10 opacity-30" />
                        <p className="text-sm text-white/20">Select a submission to review</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      {/* ── Approve dialog ── */}
      <AlertDialog open={!!approveDialog} onOpenChange={(open) => !open && setApproveDialog(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-emerald-950/20 to-slate-950 backdrop-blur-xl border border-emerald-500/20 shadow-2xl shadow-emerald-900/20 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-emerald-200 text-base font-semibold">Approve & Publish</AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">The submitting organization will be notified</p>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm">
                <p className="text-white/55">
                  You are publishing{" "}
                  <span className="text-white font-medium">"{approveDialog?.title}"</span>{" "}
                  by <span className="text-emerald-300 font-medium">{approveDialog?.organization || "unknown org"}</span>.
                </p>
                <div className="rounded-lg bg-emerald-950/60 border border-emerald-500/20 p-4 space-y-2">
                  <p className="text-emerald-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" />Admin Disclaimer
                  </p>
                  <ul className="text-white/45 text-xs space-y-1.5 leading-relaxed">
                    {[
                      "This content will be immediately visible to all platform users.",
                      "You confirm this post complies with platform guidelines.",
                      "This action is logged under your admin account.",
                      "The submitting organization will be notified of this approval.",
                    ].map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-500/50 mt-0.5 shrink-0">•</span>{t}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all">
              Cancel
            </AlertDialogCancel>
            <Button onClick={confirmApprove} className="cursor-pointer bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg hover:shadow-emerald-500/25">
              <CheckCircle className="w-4 h-4 shrink-0" />Yes, Approve & Publish
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Reject dialog ── */}
      <AlertDialog open={!!rejectDialog} onOpenChange={(open) => { if (!open) { setRejectDialog(null); setRejectionReason("") } }}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-950 via-rose-950/25 to-slate-950 backdrop-blur-xl border border-red-500/20 shadow-2xl shadow-red-900/20 max-w-md">
          <AlertDialogHeader className="gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <AlertDialogTitle className="text-red-200 text-base font-semibold">Reject Submission</AlertDialogTitle>
                <p className="text-white/30 text-xs mt-0.5">The organization will be notified with your reason</p>
              </div>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-sm">
                <p className="text-white/55">
                  Rejecting <span className="text-white font-medium">"{rejectDialog?.title}"</span>{" "}
                  by <span className="text-red-300 font-medium">{rejectDialog?.organization || "unknown org"}</span>.
                </p>
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/30 flex items-center gap-2">
                    <XCircle className="w-3 h-3 shrink-0" />Reason for Rejection
                    <span className="text-white/18 font-normal normal-case tracking-normal">(optional)</span>
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Content does not meet community guidelines…"
                    className="bg-black/40 border border-red-500/15 text-white/70 placeholder:text-white/18 text-xs resize-none focus:border-red-400/30 focus:ring-0 rounded-lg"
                    rows={4}
                  />
                  <p className="text-white/20 text-[11px] leading-relaxed">
                    This reason will be delivered to the organization via notification.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-1">
            <AlertDialogCancel onClick={() => setRejectionReason("")}
              className="cursor-pointer bg-white/5 hover:bg-white/8 text-white/55 hover:text-white border border-white/10 text-sm transition-all">
              Cancel
            </AlertDialogCancel>
            <Button onClick={confirmReject}
              className="cursor-pointer bg-gradient-to-r from-pink-600 via-fuchsia-600 to-rose-600 hover:from-pink-500 hover:via-fuchsia-500 hover:to-rose-500 active:scale-[0.97] text-white border-0 gap-2 text-sm transition-all shadow-lg hover:shadow-pink-500/25">
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
    <button onClick={onClick}
      className={`w-full text-left px-4 py-3.5 flex items-start gap-3 transition-all duration-150 group border-l-2
        ${isSelected ? "bg-amber-500/8 border-l-amber-400" : "border-l-transparent hover:bg-white/3 hover:border-l-amber-500/30"}`}
    >
      <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 bg-amber-400
        ${isSelected ? "opacity-100 shadow-[0_0_6px_rgba(251,191,36,0.6)]" : "opacity-40 group-hover:opacity-70"}`}
      />
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-xs font-semibold leading-snug line-clamp-2 ${isSelected ? "text-white" : "text-white/55 group-hover:text-white/85"}`}>
          {item.title}
        </p>
        {item.organization && (
          <p className="text-[11px] text-amber-400/70 truncate">{item.organization}</p>
        )}
        <p className="text-[10px] text-white/20">
          {new Date(item.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <ChevronRight className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? "text-amber-400" : "text-white/12 group-hover:text-white/30"}`} />
    </button>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPanel({ item, type, actionLoading, onClose, onApprove, onReject }) {
  const isBusy = actionLoading === item.id
  const accent = {
    announcements: { border: "border-fuchsia-500/30", heading: "text-fuchsia-300", badge: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30" },
    blogs:         { border: "border-pink-500/30",    heading: "text-pink-300",    badge: "bg-pink-500/15 text-pink-300 border-pink-500/30"           },
    resources:     { border: "border-violet-500/30",  heading: "text-violet-300",  badge: "bg-violet-500/15 text-violet-300 border-violet-500/30"     },
  }[type]

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 pt-5 pb-4 border-b border-white/8 shrink-0">
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className={`text-xs font-bold uppercase tracking-widest ${accent.heading}`}>
            {type === "announcements" ? "Announcement" : type === "blogs" ? "Blog Post" : "Resource"} Preview
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onApprove} disabled={isBusy}
              className="h-8 px-3 bg-emerald-600/18 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/28 hover:border-emerald-400/50 text-xs gap-1.5 transition-all">
              {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}Approve
            </Button>
            <Button size="sm" onClick={onReject} disabled={isBusy}
              className="h-8 px-3 bg-red-600/18 hover:bg-red-600/35 text-red-300 border border-red-500/28 hover:border-red-400/50 text-xs gap-1.5 transition-all">
              <XCircle className="w-3 h-3" />Reject
            </Button>
          </div>
        </div>

        {item.organization && (
          <Badge className={`${accent.badge} border text-xs flex items-center gap-1.5 w-fit mb-2`}>
            <Building2 className="w-3 h-3" />{item.organization}
          </Badge>
        )}
        <h2 className="text-lg font-bold text-white leading-snug">{item.title}</h2>
        <p className="text-white/28 text-xs mt-1 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Submitted {new Date(item.created_at).toLocaleString()}
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-5">
          {item.des && <DetailBlock icon={<AlignLeft className="w-3.5 h-3.5" />} label="Description">
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{item.des}</p>
          </DetailBlock>}

          {type === "announcements" && <>
            {(item.date_begin || item.date_end) && (
              <DetailBlock icon={<Calendar className="w-3.5 h-3.5" />} label="Event Dates">
                <p className="text-white/60 text-sm">
                  {item.date_begin ? new Date(item.date_begin).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                  <span className="text-white/25 mx-2">→</span>
                  {item.date_end   ? new Date(item.date_end).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </p>
              </DetailBlock>
            )}
            {item.open_to && <DetailBlock icon={<Users className="w-3.5 h-3.5" />} label="Open To">
              <p className="text-white/60 text-sm">{item.open_to}</p>
            </DetailBlock>}
            {item.prizes?.length > 0 && <DetailBlock icon={<Trophy className="w-3.5 h-3.5" />} label={`Prizes (${item.prizes.length})`}>
              <div className="space-y-2">
                {item.prizes.map((prize, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <Award className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      {prize.place  && <p className="text-amber-300 text-xs font-semibold">{prize.place}</p>}
                      {prize.reward && <p className="text-white/55 text-xs">{prize.reward}</p>}
                      {typeof prize === "string" && <p className="text-white/55 text-xs">{prize}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </DetailBlock>}
          </>}

          {type === "blogs" && <>
            {item.author && <DetailBlock icon={<User className="w-3.5 h-3.5" />} label="Author">
              <p className="text-white/60 text-sm">{item.author}</p>
            </DetailBlock>}
            {item.theme && <DetailBlock icon={<Tag className="w-3.5 h-3.5" />} label="Theme">
              <Badge className="bg-pink-500/15 text-pink-300 border border-pink-500/25 text-xs">{item.theme}</Badge>
            </DetailBlock>}
            {item.content && <DetailBlock icon={<FileText className="w-3.5 h-3.5" />} label="Content">
              <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap line-clamp-6">{item.content}</p>
            </DetailBlock>}
          </>}

          {type === "resources" && <>
            {item.category && <DetailBlock icon={<Hash className="w-3.5 h-3.5" />} label="Category">
              <Badge className="bg-violet-500/15 text-violet-300 border border-violet-500/25 text-xs">{item.category}</Badge>
            </DetailBlock>}
            {item.link && <DetailBlock icon={<Globe className="w-3.5 h-3.5" />} label="Link">
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:underline break-all">
                {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
              </a>
            </DetailBlock>}
          </>}

          {(item.link && type === "announcements") && <DetailBlock icon={<Link2 className="w-3.5 h-3.5" />} label="Link">
            <a href={item.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-fuchsia-400 hover:underline break-all">
              {item.link}<ExternalLink className="w-3 h-3 shrink-0 opacity-60" />
            </a>
          </DetailBlock>}

          {item.submitted_by && <div className="pt-1 pb-2">
            <p className="flex items-center gap-1.5 text-[11px] text-white/15 font-mono">
              <User className="w-3 h-3" />{item.submitted_by}
            </p>
          </div>}
        </div>
      </ScrollArea>
    </div>
  )
}

function DetailBlock({ icon, label, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/28 flex items-center gap-1.5 mb-2">
        <span className="text-white/35">{icon}</span>{label}
      </p>
      {children}
    </div>
  )
}