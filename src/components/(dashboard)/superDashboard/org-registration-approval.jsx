"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import {
  Building2, CheckCircle, XCircle, Clock, Loader2,
  Mail, User, Calendar, Search, RefreshCw, ChevronDown,
  Eye, AlertCircle, Filter,
} from "lucide-react"
import { Input } from "@/components/ui/input"

// ─── Design tokens (match super-admin palette) ────────────────────────────────
const P = "#c026d3"
const S = "#a855f7"

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)"  },
  approved: { label: "Approved", color: "#22c55e", bg: "rgba(34,197,94,0.1)",    border: "rgba(34,197,94,0.3)"   },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.1)",    border: "rgba(239,68,68,0.3)"   },
}

// ─── Rejection reason modal ───────────────────────────────────────────────────
function RejectModal({ org, onConfirm, onCancel }) {
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await onConfirm(org, reason.trim())
    setLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: "#0d0018",
          border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 32px 64px rgba(239,68,68,0.12)",
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{ background: "linear-gradient(to right, transparent, rgba(239,68,68,0.6), transparent)" }} />

        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <XCircle className="w-4.5 h-4.5 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Reject Application</h3>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              {org.name}
            </p>
          </div>
        </div>

        <div className="h-px my-4" style={{ background: "rgba(239,68,68,0.2)" }} />

        <label className="block text-xs font-medium mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
          Rejection reason <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional — visible to the org)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Insufficient information provided, duplicate account, etc."
          className="w-full text-sm text-white placeholder:text-white/20 resize-none rounded-xl px-3 py-2.5 outline-none transition-all duration-200"
          style={{
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(239,68,68,0.25)",
            minHeight: 90,
          }}
          onFocus={e => (e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.18)")}
          onBlur={e => (e.target.style.boxShadow = "none")}
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#fca5a5",
            }}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Confirm Rejection
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Org card ─────────────────────────────────────────────────────────────────
function OrgCard({ org, onApprove, onReject, approving, rejecting }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[org.approval_status] ?? STATUS_CONFIG.pending
  const busy = approving || rejecting

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.025)",
        border: `1px solid ${cfg.border}`,
        transition: "border-color 0.2s",
      }}
    >
      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${P}18`, border: `1px solid ${P}30` }}
        >
          {org.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.profile_photo_url}
              alt={org.name}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <Building2 className="w-5 h-5" style={{ color: P }} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white truncate">{org.name || "Unnamed Org"}</p>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            @{org.author_name || "—"} · Registered {org.created_at
              ? new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Unknown"}
          </p>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
          style={{ color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.04)" }}
        >
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px" style={{ background: `${P}18` }} />

              {/* Description */}
              {org.description && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold"
                    style={{ color: `${P}80` }}>Description</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {org.description}
                  </p>
                </div>
              )}

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Mail className="w-3.5 h-3.5" />, label: "Email",     value: org.contact_email || "—" },
                  { icon: <User className="w-3.5 h-3.5" />, label: "Author",    value: org.author_name    || "—" },
                  { icon: <Calendar className="w-3.5 h-3.5" />, label: "Registered", value: org.created_at
                    ? new Date(org.created_at).toLocaleDateString()
                    : "—" },
                  { icon: <Building2 className="w-3.5 h-3.5" />, label: "Active", value: org.active ? "Yes" : "No" },
                ].map(({ icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "rgba(0,0,0,0.2)" }}
                  >
                    <span className="mt-0.5 flex-shrink-0" style={{ color: P }}>{icon}</span>
                    <div>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</p>
                      <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rejection reason if present */}
              {org.approval_status === "rejected" && org.rejection_reason && (
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-red-300 mb-0.5">Rejection reason</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {org.rejection_reason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons — only shown for pending */}
      {org.approval_status === "pending" && (
        <div
          className="flex gap-2 px-4 pb-4 pt-1"
          style={{ borderTop: expanded ? `1px solid ${P}12` : "none" }}
        >
          <button
            onClick={() => onApprove(org)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: approving ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.14)",
              border: "1px solid rgba(34,197,94,0.35)",
              color: "#4ade80",
            }}
          >
            {approving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
            Approve
          </button>
          <button
            onClick={() => onReject(org)}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171",
            }}
          >
            {rejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
            Reject
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ─── Main section ─────────────────────────────────────────────────────────────
export default function OrgRegistrationApprovals({ addToast }) {
  const [orgs, setOrgs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState("pending")   // "all" | "pending" | "approved" | "rejected"
  const [search, setSearch]     = useState("")
  const [rejectTarget, setRejectTarget] = useState(null)

  // Track per-card loading states: { [id]: "approving" | "rejecting" | null }
  const [actionState, setActionState] = useState({})

  const fetchOrgs = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from("organizations")
      .select("id, user_id, name, description, author_name, contact_email, profile_photo_url, active, created_at, approval_status, rejection_reason")
      .order("created_at", { ascending: false })

    if (filter !== "all") q = q.eq("approval_status", filter)

    const { data, error } = await q
    if (error) {
      addToast?.("error", "Failed to load organizations")
    } else {
      setOrgs(data || [])
    }
    setLoading(false)
  }, [filter, addToast])

  useEffect(() => { fetchOrgs() }, [fetchOrgs])

  const handleApprove = async (org) => {
    setActionState(prev => ({ ...prev, [org.id]: "approving" }))
    const { error } = await supabase
      .from("organizations")
      .update({ approval_status: "approved", rejection_reason: null })
      .eq("id", org.id)
    if (error) {
      addToast?.("error", `Failed to approve: ${error.message}`)
    } else {
      addToast?.("success", `${org.name} has been approved!`)
      await fetchOrgs()
    }
    setActionState(prev => ({ ...prev, [org.id]: null }))
  }

  const handleRejectConfirm = async (org, reason) => {
    setRejectTarget(null)
    setActionState(prev => ({ ...prev, [org.id]: "rejecting" }))
    const { error } = await supabase
      .from("organizations")
      .update({ approval_status: "rejected", rejection_reason: reason || null })
      .eq("id", org.id)
    if (error) {
      addToast?.("error", `Failed to reject: ${error.message}`)
    } else {
      addToast?.("success", `${org.name} application rejected.`)
      await fetchOrgs()
    }
    setActionState(prev => ({ ...prev, [org.id]: null }))
  }

  const filtered = orgs.filter(o => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return (
      o.name?.toLowerCase().includes(s) ||
      o.author_name?.toLowerCase().includes(s) ||
      o.contact_email?.toLowerCase().includes(s)
    )
  })

  const counts = {
    all:      orgs.length,
    pending:  orgs.filter(o => (o.approval_status ?? "pending") === "pending").length,
    approved: orgs.filter(o => o.approval_status === "approved").length,
    rejected: orgs.filter(o => o.approval_status === "rejected").length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4" style={{ color: P }} />
            Organization Applications
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>
            Review, approve, or reject organization registration requests
          </p>
        </div>
        <button
          onClick={fetchOrgs}
          className="p-2 rounded-xl transition-all duration-200"
          style={{ background: `${P}14`, border: `1px solid ${P}30`, color: P }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
          {(["pending", "approved", "rejected", "all"]).map(f => {
            const cfg = f === "all"
              ? { label: "All", color: P }
              : STATUS_CONFIG[f]
            const isActive = filter === f
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 capitalize"
                style={isActive
                  ? { background: cfg.color + "22", color: cfg.color, border: `1px solid ${cfg.color}40` }
                  : { background: "transparent", color: "rgba(255,255,255,0.4)", border: "1px solid transparent" }
                }
              >
                {f !== "all" && (
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: cfg.color }}
                  />
                )}
                {f}
                {counts[f] > 0 && (
                  <span
                    className="text-[10px] px-1.5 rounded-full font-bold"
                    style={{
                      background: isActive ? cfg.color + "30" : "rgba(255,255,255,0.08)",
                      color: isActive ? cfg.color : "rgba(255,255,255,0.4)",
                    }}
                  >
                    {counts[f]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "rgba(255,255,255,0.3)" }}
          />
          <Input
            placeholder="Search by name, author, or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 h-9 text-xs bg-black/30 text-white placeholder:text-white/20 rounded-xl"
            style={{ border: `1px solid ${P}25` }}
          />
        </div>
      </div>

      {/* Pending alert banner */}
      {counts.pending > 0 && filter !== "approved" && filter !== "rejected" && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#f59e0b" }}
          />
          <p className="text-xs" style={{ color: "#fbbf24" }}>
            <span className="font-bold">{counts.pending}</span> organization
            {counts.pending !== 1 ? "s" : ""} waiting for your review
          </p>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: P }} />
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Building2 className="w-8 h-8 mb-3" style={{ color: "rgba(255,255,255,0.2)" }} />
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
            {search ? "No organizations match your search" : `No ${filter === "all" ? "" : filter} organizations`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map(org => (
              <OrgCard
                key={org.id}
                org={org}
                onApprove={handleApprove}
                onReject={o => setRejectTarget(o)}
                approving={actionState[org.id] === "approving"}
                rejecting={actionState[org.id] === "rejecting"}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            org={rejectTarget}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}