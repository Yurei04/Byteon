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
  Link2, Tag, MapPin, Clock,
} from "lucide-react"

export default function ApprovalSection({ onApprovalChange }) {
  const { session } = useAuth()

  const [pending, setPending] = useState({
    announcements: [],
    blogs: [],
    resources: [],
  })
  const [loading, setLoading]       = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [rejectDialog, setRejectDialog]   = useState(null)  // { item, type }
  const [rejectionReason, setRejectionReason] = useState("")
  const [activeTab, setActiveTab]   = useState("announcements")
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const [{ data: ann }, { data: blogs }, { data: res }] = await Promise.all([
        supabase.from("pending_announcements").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("pending_blogs").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("pending_resources").select("*").eq("status", "pending").order("created_at", { ascending: false }),
      ])
      setPending({
        announcements: ann || [],
        blogs:         blogs || [],
        resources:     res || [],
      })
      onApprovalChange?.((ann?.length || 0) + (blogs?.length || 0) + (res?.length || 0))
    } catch (err) {
      showToast("Failed to load pending items: " + err.message, "error")
    } finally {
      setLoading(false)
    }
  }, [onApprovalChange])

  useEffect(() => { fetchPending() }, [fetchPending])

  // ── Approve ──────────────────────────────────────────────────────────────
  const approve = async (item, type) => {
    setActionLoading(item.id)
    try {
      // Strip approval-metadata fields — only keep content fields
      const { status, submitted_by, reviewed_by, reviewed_at, rejection_reason, ...payload } = item

      let mainTable, countField

      if (type === "announcements") {
        mainTable  = "announcements"
        countField = "total_announcements"
        const { error } = await supabase.from(mainTable).insert([payload])
        if (error) throw error
      } else if (type === "blogs") {
        mainTable  = "blogs"
        countField = "total_blogs"
        // blogs id is uuid — remove it to let DB generate a new one
        const { id: _id, ...blogPayload } = payload
        const { error } = await supabase.from(mainTable).insert([blogPayload])
        if (error) throw error
      } else {
        mainTable  = "resource_hub"
        countField = "total_resources"
        const { error } = await supabase.from(mainTable).insert([payload])
        if (error) throw error
      }

      // Mark as approved
      await supabase
        .from(`pending_${type}`)
        .update({
          status:      "approved",
          reviewed_by: session?.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      // Increment org counter
      if (item.organization_id && countField) {
        const { data: orgRow } = await supabase
          .from("organizations")
          .select(countField)
          .eq("id", item.organization_id)
          .single()
        if (orgRow) {
          await supabase
            .from("organizations")
            .update({ [countField]: (orgRow[countField] || 0) + 1 })
            .eq("id", item.organization_id)
        }
      }

      setPending((prev) => ({
        ...prev,
        [type]: prev[type].filter((i) => i.id !== item.id),
      }))
      onApprovalChange?.(
        (pending.announcements.length + pending.blogs.length + pending.resources.length) - 1
      )
      showToast(`"${item.title}" approved and published!`)
    } catch (err) {
      showToast("Approval failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
    }
  }

  // ── Reject ───────────────────────────────────────────────────────────────
  const reject = async () => {
    if (!rejectDialog) return
    const { item, type } = rejectDialog
    setActionLoading(item.id)
    try {
      await supabase
        .from(`pending_${type}`)
        .update({
          status:           "rejected",
          rejection_reason: rejectionReason.trim() || "No reason provided",
          reviewed_by:      session?.user?.id,
          reviewed_at:      new Date().toISOString(),
        })
        .eq("id", item.id)

      setPending((prev) => ({
        ...prev,
        [type]: prev[type].filter((i) => i.id !== item.id),
      }))
      onApprovalChange?.(
        (pending.announcements.length + pending.blogs.length + pending.resources.length) - 1
      )
      showToast(`"${item.title}" rejected.`)
    } catch (err) {
      showToast("Rejection failed: " + err.message, "error")
    } finally {
      setActionLoading(null)
      setRejectDialog(null)
      setRejectionReason("")
    }
  }

  const totalPending =
    pending.announcements.length + pending.blogs.length + pending.resources.length

  const tabConfig = [
    {
      value: "announcements",
      label: "Announcements",
      Icon:  Megaphone,
      count: pending.announcements.length,
      color: "fuchsia",
    },
    {
      value: "blogs",
      label: "Blogs",
      Icon:  FileText,
      count: pending.blogs.length,
      color: "purple",
    },
    {
      value: "resources",
      label: "Resources",
      Icon:  BookOpen,
      count: pending.resources.length,
      color: "emerald",
    },
  ]

  return (
    <>
      {/* Toast */}
      {toast && (
        <Alert className={`mb-4 ${toast.type === "error" ? "bg-red-900/30 border-red-500/40 text-red-200" : "bg-emerald-900/30 border-emerald-500/40 text-emerald-200"}`}>
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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-fuchsia-500/20 p-1 mb-5">
          {tabConfig.map(({ value, label, Icon, count, color }) => (
            <TabsTrigger key={value} value={value}
              className={`flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white
                ${color === "fuchsia"  ? "data-[state=active]:from-fuchsia-600 data-[state=active]:to-purple-600" : ""}
                ${color === "purple"   ? "data-[state=active]:from-purple-600 data-[state=active]:to-pink-600"    : ""}
                ${color === "emerald"  ? "data-[state=active]:from-emerald-600 data-[state=active]:to-green-600"  : ""}
              `}>
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <Badge className="ml-1 text-xs bg-amber-500/30 text-amber-200 border-amber-500/30">
                  {count}
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
              <div className="space-y-4">
                {pending[value].map((item) => (
                  <PendingCard
                    key={item.id}
                    item={item}
                    type={value}
                    actionLoading={actionLoading}
                    onApprove={() => approve(item, value)}
                    onReject={() => { setRejectDialog({ item, type: value }); setRejectionReason("") }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectDialog} onOpenChange={(open) => !open && setRejectDialog(null)}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-200">Reject Submission</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Rejecting <strong className="text-red-300">"{rejectDialog?.item?.title}"</strong>.
              Provide an optional reason for the submitter.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Reason for rejection (optional)…"
            className="bg-black/30 border-red-500/20 text-white resize-none"
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={reject}
              disabled={!!actionLoading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white"
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ── Pending card ──────────────────────────────────────────────────────────────
function PendingCard({ item, type, actionLoading, onApprove, onReject }) {
  const isBusy = actionLoading === item.id

  return (
    <Card className="bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-lg border border-amber-500/20 hover:border-amber-400/40 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Org + submitted */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
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
            <h3 className="text-lg font-bold text-white mb-1 truncate">{item.title}</h3>

            {/* Description */}
            {item.des && (
              <p className="text-white/50 text-sm leading-relaxed line-clamp-2 mb-3">{item.des}</p>
            )}

            {/* Type-specific details */}
            {type === "announcements" && (
              <div className="flex flex-wrap gap-3 text-xs text-white/40 mb-2">
                {item.date_begin && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-fuchsia-400" />
                    {new Date(item.date_begin).toLocaleDateString()} – {new Date(item.date_end).toLocaleDateString()}
                  </span>
                )}
                {item.prizes?.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    {item.prizes.length} prize{item.prizes.length !== 1 ? "s" : ""}
                  </span>
                )}
                {item.open_to && <span>Open to: {item.open_to}</span>}
              </div>
            )}

            {type === "blogs" && (
              <div className="flex flex-wrap gap-2 mb-2">
                {item.theme && (
                  <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs flex items-center gap-1">
                    <Tag className="w-3 h-3" />{item.theme}
                  </Badge>
                )}
                {item.place && (
                  <Badge className="bg-slate-700/40 text-slate-300 border border-slate-600/30 text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{item.place}
                  </Badge>
                )}
              </div>
            )}

            {type === "resources" && item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer"
                className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 mb-2">
                <Link2 className="w-3 h-3" />
                {item.link.slice(0, 60)}{item.link.length > 60 ? "…" : ""}
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <Button
              size="sm"
              onClick={onApprove}
              disabled={isBusy}
              className="h-9 px-4 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30"
            >
              {isBusy
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <><CheckCircle className="w-4 h-4 mr-1" />Approve</>}
            </Button>
            <Button
              size="sm"
              onClick={onReject}
              disabled={isBusy}
              className="h-9 px-4 bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/30"
            >
              <XCircle className="w-4 h-4 mr-1" />Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}