"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import {
  Building2, CheckCircle, XCircle, Clock, Loader2,
  Mail, User, Calendar, Search, RefreshCw, ChevronDown,
  AlertCircle,
} from "lucide-react"

const THEME_STYLES = `
  /* ── Light ── */
  :root {
    --ora-bg:            #fdf4ff;
    --ora-surface:       rgba(255,255,255,0.80);
    --ora-surface-deep:  rgba(253,244,255,0.60);
    --ora-border:        rgba(192,38,211,0.14);
    --ora-border-subtle: rgba(192,38,211,0.08);

    --ora-text-primary:   #1e0320;
    --ora-text-secondary: #701976;
    --ora-text-muted:     rgba(112,25,118,0.50);
    --ora-text-faint:     rgba(112,25,118,0.35);

    --ora-brand:          #c026d3;
    --ora-brand-soft:     rgba(192,38,211,0.10);
    --ora-brand-border:   rgba(192,38,211,0.25);

    --ora-tab-bg:         rgba(253,244,255,0.70);
    --ora-tab-border:     rgba(192,38,211,0.12);

    --ora-search-bg:      rgba(255,255,255,0.80);
    --ora-search-border:  rgba(192,38,211,0.20);
    --ora-search-text:    #1e0320;
    --ora-search-placeholder: rgba(161,27,176,0.35);

    --ora-card-bg:        rgba(255,255,255,0.75);
    --ora-meta-bg:        rgba(253,244,255,0.50);

    --ora-divider:        rgba(192,38,211,0.10);

    --ora-empty-bg:       rgba(253,244,255,0.50);
    --ora-empty-border:   rgba(192,38,211,0.12);
    --ora-empty-icon:     rgba(192,38,211,0.25);
    --ora-empty-text:     rgba(112,25,118,0.40);

    --ora-modal-bg:       rgba(255,255,255,0.96);
    --ora-modal-border:   rgba(239,68,68,0.25);
    --ora-modal-shadow:   0 32px 64px rgba(239,68,68,0.10);
    --ora-modal-title:    #1e0320;
    --ora-modal-sub:      rgba(112,25,118,0.50);
    --ora-modal-divider:  rgba(239,68,68,0.15);
    --ora-modal-label:    rgba(112,25,118,0.55);
    --ora-modal-hint:     rgba(112,25,118,0.35);
    --ora-modal-textarea-bg:     rgba(253,244,255,0.80);
    --ora-modal-textarea-border: rgba(239,68,68,0.20);
    --ora-modal-textarea-text:   #1e0320;
    --ora-modal-cancel-bg:       rgba(192,38,211,0.06);
    --ora-modal-cancel-border:   rgba(192,38,211,0.18);
    --ora-modal-cancel-text:     rgba(112,25,118,0.60);
  }

  /* ── Dark ── */
  .dark {
    --ora-bg:            #00091d;
    --ora-surface:       rgba(255,255,255,0.025);
    --ora-surface-deep:  rgba(0,0,0,0.20);
    --ora-border:        rgba(192,38,211,0.14);
    --ora-border-subtle: rgba(255,255,255,0.06);

    --ora-text-primary:   #ffffff;
    --ora-text-secondary: rgba(255,255,255,0.65);
    --ora-text-muted:     rgba(255,255,255,0.40);
    --ora-text-faint:     rgba(255,255,255,0.25);

    --ora-brand:          #c026d3;
    --ora-brand-soft:     rgba(192,38,211,0.12);
    --ora-brand-border:   rgba(192,38,211,0.28);

    --ora-tab-bg:         rgba(0,0,0,0.30);
    --ora-tab-border:     rgba(255,255,255,0.06);

    --ora-search-bg:      rgba(0,0,0,0.30);
    --ora-search-border:  rgba(192,38,211,0.22);
    --ora-search-text:    #ffffff;
    --ora-search-placeholder: rgba(255,255,255,0.20);

    --ora-card-bg:        rgba(255,255,255,0.025);
    --ora-meta-bg:        rgba(0,0,0,0.20);

    --ora-divider:        rgba(192,38,211,0.12);

    --ora-empty-bg:       rgba(255,255,255,0.02);
    --ora-empty-border:   rgba(255,255,255,0.06);
    --ora-empty-icon:     rgba(255,255,255,0.18);
    --ora-empty-text:     rgba(255,255,255,0.28);

    --ora-modal-bg:       #0d0018;
    --ora-modal-border:   rgba(239,68,68,0.30);
    --ora-modal-shadow:   0 32px 64px rgba(239,68,68,0.12);
    --ora-modal-title:    #ffffff;
    --ora-modal-sub:      rgba(255,255,255,0.40);
    --ora-modal-divider:  rgba(239,68,68,0.20);
    --ora-modal-label:    rgba(255,255,255,0.50);
    --ora-modal-hint:     rgba(255,255,255,0.28);
    --ora-modal-textarea-bg:     rgba(0,0,0,0.35);
    --ora-modal-textarea-border: rgba(239,68,68,0.25);
    --ora-modal-textarea-text:   #ffffff;
    --ora-modal-cancel-bg:       rgba(255,255,255,0.05);
    --ora-modal-cancel-border:   rgba(255,255,255,0.10);
    --ora-modal-cancel-text:     rgba(255,255,255,0.50);
  }
`

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.30)" },
  approved: { label: "Approved", color: "#22c55e", bg: "rgba(34,197,94,0.10)",  border: "rgba(34,197,94,0.30)"  },
  rejected: { label: "Rejected", color: "#ef4444", bg: "rgba(239,68,68,0.10)",  border: "rgba(239,68,68,0.30)"  },
}

// ── Reject modal ──────────────────────────────────────────────────────────────
function RejectModal({ org, onConfirm, onCancel }) {
  const [reason, setReason]   = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    await onConfirm(org, reason.trim())
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{
          background: "var(--ora-modal-bg)",
          border:     "1px solid var(--ora-modal-border)",
          boxShadow:  "var(--ora-modal-shadow)",
        }}>
        {/* shine */}
        <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
          style={{ background: "linear-gradient(to right, transparent, rgba(239,68,68,0.55), transparent)" }} />

        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.28)" }}>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: "var(--ora-modal-title)" }}>
              Reject Application
            </h3>
            <p className="text-xs" style={{ color: "var(--ora-modal-sub)" }}>{org.name}</p>
          </div>
        </div>

        <div className="h-px my-4" style={{ background: "var(--ora-modal-divider)" }} />

        <label className="block text-xs font-medium mb-2" style={{ color: "var(--ora-modal-label)" }}>
          Rejection reason{" "}
          <span style={{ color: "var(--ora-modal-hint)" }}>(optional — visible to the org)</span>
        </label>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Insufficient information provided, duplicate account…"
          rows={3}
          className="w-full text-sm resize-none rounded-xl px-3 py-2.5 outline-none transition-all duration-200"
          style={{
            background:  "var(--ora-modal-textarea-bg)",
            border:      "1px solid var(--ora-modal-textarea-border)",
            color:       "var(--ora-modal-textarea-text)",
          }}
          onFocus={e => e.target.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.15)"}
          onBlur={e  => e.target.style.boxShadow = "none"}
        />

        <div className="flex gap-3 mt-4">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              background: "var(--ora-modal-cancel-bg)",
              border:     "1px solid var(--ora-modal-cancel-border)",
              color:      "var(--ora-modal-cancel-text)",
            }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-60"
            style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.38)", color: "#fca5a5" }}>
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <XCircle className="w-4 h-4" />}
            Confirm Rejection
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Org card ──────────────────────────────────────────────────────────────────
function OrgCard({ org, onApprove, onReject, approving, rejecting }) {
  const [expanded, setExpanded] = useState(false)
  const cfg  = STATUS_CONFIG[org.approval_status] ?? STATUS_CONFIG.pending
  const busy = approving || rejecting

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl overflow-hidden transition-colors duration-200"
      style={{ background: "var(--ora-card-bg)", border: `1px solid ${cfg.border}` }}>

      {/* Header row */}
      <div className="flex items-center gap-4 p-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: "var(--ora-brand-soft)", border: "1px solid var(--ora-brand-border)" }}>
          {org.profile_photo_url
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={org.profile_photo_url} alt={org.name} className="w-full h-full object-cover" />
            : <Building2 className="w-5 h-5" style={{ color: "var(--ora-brand)" }} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold truncate" style={{ color: "var(--ora-text-primary)" }}>
              {org.name || "Unnamed Org"}
            </p>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--ora-text-muted)" }}>
            @{org.author_name || "—"} · Registered{" "}
            {org.created_at
              ? new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
              : "Unknown"}
          </p>
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
          style={{ color: "var(--ora-text-muted)", background: "var(--ora-brand-soft)" }}>
          <ChevronDown className="w-4 h-4 transition-transform duration-200"
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
        </button>
      </div>

      {/* Expanded details */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="overflow-hidden">
            <div className="px-4 pb-4 space-y-3">
              <div className="h-px" style={{ background: "var(--ora-divider)" }} />

              {org.description && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1 font-semibold"
                    style={{ color: "var(--ora-brand)" }}>Description</p>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ora-text-secondary)" }}>
                    {org.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: <Mail className="w-3.5 h-3.5" />,     label: "Email",      value: org.contact_email || "—" },
                  { icon: <User className="w-3.5 h-3.5" />,     label: "Author",     value: org.author_name   || "—" },
                  { icon: <Calendar className="w-3.5 h-3.5" />, label: "Registered", value: org.created_at ? new Date(org.created_at).toLocaleDateString() : "—" },
                  { icon: <Building2 className="w-3.5 h-3.5" />,label: "Active",     value: org.active ? "Yes" : "No" },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-start gap-2 px-3 py-2 rounded-lg"
                    style={{ background: "var(--ora-meta-bg)" }}>
                    <span className="mt-0.5 flex-shrink-0" style={{ color: "var(--ora-brand)" }}>{icon}</span>
                    <div>
                      <p className="text-[10px]" style={{ color: "var(--ora-text-faint)" }}>{label}</p>
                      <p className="text-xs font-medium" style={{ color: "var(--ora-text-secondary)" }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {org.approval_status === "rejected" && org.rejection_reason && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.20)" }}>
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-red-400 mb-0.5">Rejection reason</p>
                    <p className="text-xs" style={{ color: "var(--ora-text-secondary)" }}>{org.rejection_reason}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      {org.approval_status === "pending" && (
        <div className="flex gap-2 px-4 pb-4 pt-1"
          style={{ borderTop: expanded ? "1px solid var(--ora-divider)" : "none" }}>
          <button onClick={() => onApprove(org)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.32)", color: "#22c55e" }}>
            {approving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <CheckCircle className="w-3.5 h-3.5" />}
            Approve
          </button>
          <button onClick={() => onReject(org)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60"
            style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.28)", color: "#f87171" }}>
            {rejecting
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <XCircle className="w-3.5 h-3.5" />}
            Reject
          </button>
        </div>
      )}
    </motion.div>
  )
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function OrgRegistrationApprovals({ addToast }) {
  const [orgs, setOrgs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState("pending")
  const [search, setSearch]           = useState("")
  const [rejectTarget, setRejectTarget] = useState(null)
  const [actionState, setActionState] = useState({})

  const fetchOrgs = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from("organizations")
      .select("id, user_id, name, description, author_name, contact_email, profile_photo_url, active, created_at, approval_status, rejection_reason")
      .order("created_at", { ascending: false })
    if (filter !== "all") q = q.eq("approval_status", filter)
    const { data, error } = await q
    if (error) addToast?.("error", "Failed to load organizations")
    else setOrgs(data || [])
    setLoading(false)
  }, [filter, addToast])

  useEffect(() => { fetchOrgs() }, [fetchOrgs])

  const handleApprove = async (org) => {
    setActionState(prev => ({ ...prev, [org.id]: "approving" }))
    const { error } = await supabase.from("organizations")
      .update({ approval_status: "approved", rejection_reason: null }).eq("id", org.id)
    if (error) addToast?.("error", `Failed to approve: ${error.message}`)
    else { addToast?.("success", `${org.name} has been approved!`); await fetchOrgs() }
    setActionState(prev => ({ ...prev, [org.id]: null }))
  }

  const handleRejectConfirm = async (org, reason) => {
    setRejectTarget(null)
    setActionState(prev => ({ ...prev, [org.id]: "rejecting" }))
    const { error } = await supabase.from("organizations")
      .update({ approval_status: "rejected", rejection_reason: reason || null }).eq("id", org.id)
    if (error) addToast?.("error", `Failed to reject: ${error.message}`)
    else { addToast?.("success", `${org.name} application rejected.`); await fetchOrgs() }
    setActionState(prev => ({ ...prev, [org.id]: null }))
  }

  const filtered = orgs.filter(o => {
    if (!search.trim()) return true
    const s = search.toLowerCase()
    return o.name?.toLowerCase().includes(s) ||
      o.author_name?.toLowerCase().includes(s) ||
      o.contact_email?.toLowerCase().includes(s)
  })

  const counts = {
    all:      orgs.length,
    pending:  orgs.filter(o => (o.approval_status ?? "pending") === "pending").length,
    approved: orgs.filter(o => o.approval_status === "approved").length,
    rejected: orgs.filter(o => o.approval_status === "rejected").length,
  }

  return (
    <div>
      <style>{THEME_STYLES}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2"
            style={{ color: "var(--ora-text-primary)" }}>
            <Building2 className="w-4 h-4" style={{ color: "var(--ora-brand)" }} />
            Organization Applications
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--ora-text-muted)" }}>
            Review, approve, or reject organization registration requests
          </p>
        </div>
        <button onClick={fetchOrgs}
          className="p-2 rounded-xl transition-all duration-200"
          style={{ background: "var(--ora-brand-soft)", border: "1px solid var(--ora-brand-border)", color: "var(--ora-brand)" }}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ background: "var(--ora-tab-bg)", border: "1px solid var(--ora-tab-border)" }}>
          {(["pending", "approved", "rejected", "all"]).map(f => {
            const cfg      = f === "all" ? { label: "All", color: "var(--ora-brand)" } : STATUS_CONFIG[f]
            const isActive = filter === f
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 capitalize"
                style={isActive
                  ? { background: `${cfg.color}20`, color: cfg.color, border: `1px solid ${cfg.color}40` }
                  : { background: "transparent", color: "var(--ora-text-muted)", border: "1px solid transparent" }}>
                {f !== "all" && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
                )}
                {f}
                {counts[f] > 0 && (
                  <span className="text-[10px] px-1.5 rounded-full font-bold"
                    style={{
                      background: isActive ? `${cfg.color}28` : "var(--ora-brand-soft)",
                      color:      isActive ? cfg.color : "var(--ora-text-muted)",
                    }}>
                    {counts[f]}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--ora-search-placeholder)" }} />
          <input
            placeholder="Search by name, author, or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 h-9 rounded-xl text-xs outline-none transition-all"
            style={{
              background:  "var(--ora-search-bg)",
              border:      "1px solid var(--ora-search-border)",
              color:       "var(--ora-search-text)",
            }}
          />
        </div>
      </div>

      {/* Pending alert banner */}
      {counts.pending > 0 && filter !== "approved" && filter !== "rejected" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-4"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: "#f59e0b" }} />
          <p className="text-xs" style={{ color: "#f59e0b" }}>
            <span className="font-bold">{counts.pending}</span> organization
            {counts.pending !== 1 ? "s" : ""} waiting for your review
          </p>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ora-brand)" }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl"
          style={{ background: "var(--ora-empty-bg)", border: "1px solid var(--ora-empty-border)" }}>
          <Building2 className="w-8 h-8 mb-3" style={{ color: "var(--ora-empty-icon)" }} />
          <p className="text-sm" style={{ color: "var(--ora-empty-text)" }}>
            {search ? "No organizations match your search" : `No ${filter === "all" ? "" : filter} organizations`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map(org => (
              <OrgCard
                key={org.id} org={org}
                onApprove={handleApprove}
                onReject={o => setRejectTarget(o)}
                approving={actionState[org.id] === "approving"}
                rejecting={actionState[org.id] === "rejecting"}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

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