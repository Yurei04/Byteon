"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"
import {
  Building2, CheckCircle, XCircle, Clock, Loader2,
  Mail, User, Calendar, Search, RefreshCw, ChevronDown,
  AlertCircle,
  ScrollText,
  BookOpenCheck,
  ShieldCheck,
  Info,
  ShieldAlert,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

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

// Approval checklist
const APPROVAL_CHECKLIST = [
  "Organization name is provided and valid",
  "Description and contact information are complete",
  "Organization is legitimate and technology-related",
  "Contact email is valid and corresponds to organization",
  "No duplicate organization account exists",
  "Name and content are appropriate and not misleading",
  "Organization has legitimate purpose (hackathons, blogs, resources)",
  "All registration information is verified",
]

// Common rejection reasons
const REJECTION_REASONS = [
  "Incomplete or missing organization information",
  "Duplicate organization account",
  "Not technology/hackathon related",
  "Invalid or unverifiable contact information",
  "Inappropriate or offensive organization name",
  "Misleading or suspicious information",
  "Unable to verify organization identity",
  "Other (specify in details)",
]

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

// ── Org card ──────────────────────────────────────────────────────────────────
function OrgCard({ org, onApprove, onReject, approving, rejecting, onOpenApproveDialog, onOpenRejectDialog }) {
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
          <button onClick={() => onOpenApproveDialog(org)} disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-60"
            style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.32)", color: "#22c55e" }}>
            {approving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <CheckCircle className="w-3.5 h-3.5" />}
            Approve
          </button>
          <button onClick={() => onOpenRejectDialog(org)} disabled={busy}
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

// ── Approve Dialog ──────────────────────────────────────────────────────────
function ApproveDialog({ org, open, onConfirm, onCancel }) {
  const [checks, setChecks] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setChecks({})
    }
  }, [open])

  const handleCheck = (index) => {
    setChecks(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const allChecked = APPROVAL_CHECKLIST.length > 0 && 
                     Object.values(checks).filter(Boolean).length === APPROVAL_CHECKLIST.length

  const handleSubmit = async () => {
    if (!allChecked) return
    setLoading(true)
    await onConfirm(org)
    setLoading(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <AlertDialogContent
        className="backdrop-blur-xl border shadow-2xl max-w-lg"
        style={{
          background: "var(--ora-modal-bg)",
          borderColor: "rgba(5,150,105,0.2)",
          boxShadow: "0 25px 50px rgba(5,150,105,0.1)",
        }}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.25)" }}>
              <ShieldCheck className="w-5 h-5" style={{ color: "#059669" }} />
            </div>
            <div>
              <AlertDialogTitle style={{ color: "var(--ora-modal-title)" }}>
                Approve Organization
              </AlertDialogTitle>
              <p className="text-xs mt-0.5" style={{ color: "var(--ora-modal-sub)" }}>
                {org?.name}
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.2)" }} className="rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: "#059669" }}>
              <CheckCircle className="w-3.5 h-3.5" />
              Pre-Approval Checklist
              <span className="ml-auto font-normal normal-case" style={{ color: "rgba(5,150,105,0.7)" }}>
                {Object.values(checks).filter(Boolean).length} / {APPROVAL_CHECKLIST.length}
              </span>
            </p>
            <div className="space-y-2.5">
              {APPROVAL_CHECKLIST.map((item, idx) => (
                <label key={idx} className="flex items-start gap-2.5 cursor-pointer group">
                  <div
                    className="mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: checks[idx] ? "#059669" : "rgba(5,150,105,0.1)",
                      border: `1px solid ${checks[idx] ? "#059669" : "rgba(5,150,105,0.3)"}`,
                    }}>
                    {checks[idx] && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className="text-xs leading-relaxed transition-colors"
                    style={{
                      color: checks[idx] ? "rgba(5,150,105,0.5)" : "var(--ora-text-muted)",
                      textDecoration: checks[idx] ? "line-through" : "none"
                    }}>
                    {item}
                  </span>
                  <input
                    type="checkbox"
                    checked={checks[idx] || false}
                    onChange={() => handleCheck(idx)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.15)" }} className="rounded-lg p-3 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--ora-text-faint)" }}>
              <Info className="w-3 h-3" />Admin Notice
            </p>
            <ul className="text-xs space-y-1 leading-relaxed" style={{ color: "var(--ora-text-faint)" }}>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span>
                Content becomes immediately visible to all platform users.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span>
                This action is permanently logged under your admin account.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 shrink-0">•</span>
                The organization will be notified of this approval.
              </li>
            </ul>
          </div>

          {!allChecked && (
            <p className="text-xs flex items-center gap-1.5" style={{ color: "#d97706" }}>
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Confirm all checklist items before approving.
            </p>
          )}
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <AlertDialogCancel
            className="cursor-pointer text-sm transition-all"
            style={{
              background: "var(--ora-modal-cancel-bg)",
              border: "1px solid var(--ora-modal-cancel-border)",
              color: "var(--ora-modal-cancel-text)",
            }}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={!allChecked || loading}
            className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: allChecked ? "linear-gradient(135deg, #059669, #0d9488)" : "rgba(5,150,105,0.3)",
              boxShadow: allChecked ? "0 4px 16px rgba(5,150,105,0.35)" : "none",
            }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Approve & Publish
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Reject Dialog ──────────────────────────────────────────────────────────
function RejectDialog({ org, open, onConfirm, onCancel }) {
  const [selectedReason, setSelectedReason] = useState("")
  const [details, setDetails] = useState("")
  const [confirmCheck, setConfirmCheck] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedReason("")
      setDetails("")
      setConfirmCheck(false)
    }
  }, [open])

  const handleSubmit = async () => {
    const reason = selectedReason === "Other (specify in details)" ? details : selectedReason
    if (!reason.trim() || !confirmCheck) return
    setLoading(true)
    await onConfirm(org, reason)
    setLoading(false)
  }

  const canSubmit = selectedReason && confirmCheck && (selectedReason !== "Other (specify in details)" || details.trim())

  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <AlertDialogContent
        className="backdrop-blur-xl border shadow-2xl max-w-lg"
        style={{
          background: "var(--ora-modal-bg)",
          borderColor: "rgba(239,68,68,0.2)",
          boxShadow: "0 25px 50px rgba(239,68,68,0.1)",
        }}>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <ShieldAlert className="w-5 h-5" style={{ color: "#ef4444" }} />
            </div>
            <div>
              <AlertDialogTitle style={{ color: "var(--ora-modal-title)" }}>
                Reject Application
              </AlertDialogTitle>
              <p className="text-xs mt-0.5" style={{ color: "var(--ora-modal-sub)" }}>
                {org?.name}
              </p>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--ora-modal-label)" }}>
              Rejection Reason
            </p>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label key={reason} className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg transition-colors hover:bg-opacity-50"
                  style={{
                    background: selectedReason === reason ? "rgba(239,68,68,0.1)" : "transparent"
                  }}>
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      borderColor: selectedReason === reason ? "#ef4444" : "rgba(239,68,68,0.3)",
                      background: selectedReason === reason ? "#ef4444" : "transparent"
                    }}>
                    {selectedReason === reason && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs" style={{ color: "var(--ora-text-secondary)" }}>
                    {reason}
                  </span>
                  <input
                    type="radio"
                    name="rejection-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="hidden"
                  />
                </label>
              ))}
            </div>
          </div>

          {selectedReason === "Other (specify in details)" && (
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--ora-modal-label)" }}>
                Details <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain the reason for rejection..."
                rows={3}
                className="w-full text-sm resize-none rounded-lg p-2.5 outline-none"
                style={{
                  background: "var(--ora-modal-textarea-bg)",
                  border: "1px solid var(--ora-modal-textarea-border)",
                  color: "var(--ora-modal-textarea-text)",
                }}
              />
            </div>
          )}

          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={confirmCheck}
              onChange={(e) => setConfirmCheck(e.target.checked)}
              className="mt-1 accent-red-500 cursor-pointer"
              id="reject-confirm"
            />
            <label htmlFor="reject-confirm" className="text-xs leading-snug cursor-pointer" style={{ color: "var(--ora-text-muted)" }}>
              I confirm that this organization violates platform standards or guidelines.
            </label>
          </div>

          <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }} className="rounded-lg p-3 space-y-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--ora-text-faint)" }}>
              Admin Notice
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--ora-text-faint)" }}>
              The organization will be notified with this rejection reason and can resubmit after addressing the issues.
            </p>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 mt-4">
          <AlertDialogCancel
            className="cursor-pointer text-sm transition-all"
            style={{
              background: "var(--ora-modal-cancel-bg)",
              border: "1px solid var(--ora-modal-cancel-border)",
              color: "var(--ora-modal-cancel-text)",
            }}>
            Cancel
          </AlertDialogCancel>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="cursor-pointer text-white border-0 gap-2 text-sm transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSubmit ? "linear-gradient(135deg, #ec4899, #c026d3)" : "rgba(239,68,68,0.3)",
              boxShadow: canSubmit ? "0 4px 16px rgba(192,38,211,0.4)" : "none",
            }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Confirm Rejection
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ── Guidelines Dialog ──────────────────────────────────────────────────────────
function GuidelinesDialog({ open, onClose, mode }) {
  const isApproval = mode === "approval"
  const sections   = isApproval ? APPROVAL_GUIDELINES : REJECTION_GUIDELINES

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-lg backdrop-blur-xl border shadow-2xl"
        style={{
          background: "var(--ora-modal-bg)",
          borderColor: isApproval ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)",
        }}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: isApproval ? "rgba(5,150,105,0.1)" : "rgba(239,68,68,0.1)",
                border: `1px solid ${isApproval ? "rgba(5,150,105,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}>
              {isApproval
                ? <BookOpenCheck className="w-4 h-4" style={{ color: "#059669" }} />
                : <ScrollText className="w-4 h-4" style={{ color: "#ef4444" }} />}
            </div>
            <div>
              <DialogTitle style={{ color: "var(--ora-modal-title)" }}>
                {isApproval ? "Approval Guidelines" : "Rejection Rules & Guidelines"}
              </DialogTitle>
              <p className="text-xs mt-0.5" style={{ color: "var(--ora-text-muted)" }}>
                Platform policy — read before acting on a submission
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-5">
            {sections.map((sec, i) => (
              <div key={i}>
                <p className={`text-[11px] font-bold uppercase tracking-widest mb-2 ${sec.color ?? ""}`}
                  style={{ color: isApproval ? "#059669" : "#ef4444" }}>
                  {sec.title}
                </p>
                <ul className="space-y-1.5">
                  {sec.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs leading-relaxed"
                      style={{ color: "var(--ora-text-muted)" }}>
                      <span className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: isApproval ? "rgba(5,150,105,0.6)" : "rgba(239,68,68,0.6)" }} />
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

// ── Main section ──────────────────────────────────────────────────────────────
export default function OrgRegistrationApprovals({ addToast }) {
  const [orgs, setOrgs]               = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState("pending")
  const [search, setSearch]           = useState("")
  const [actionState, setActionState] = useState({})

  const [approveDialog, setApproveDialog]     = useState(null)
  const [rejectDialog, setRejectDialog]       = useState(null)
  const [guidelinesMode, setGuidelinesMode]   = useState(null)

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
    else { 
      addToast?.("success", `${org.name} has been approved!`)
      await fetchOrgs() 
      setApproveDialog(null)
    }
    setActionState(prev => ({ ...prev, [org.id]: null }))
  }

  const handleReject = async (org, reason) => {
    setActionState(prev => ({ ...prev, [org.id]: "rejecting" }))
    const { error } = await supabase.from("organizations")
      .update({ approval_status: "rejected", rejection_reason: reason || null }).eq("id", org.id)
    if (error) addToast?.("error", `Failed to reject: ${error.message}`)
    else { 
      addToast?.("success", `${org.name} application rejected.`)
      await fetchOrgs()
      setRejectDialog(null)
    }
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

        {/* Guidelines buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setGuidelinesMode("approval")}
            className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ border: "1px solid rgba(5,150,105,0.25)", background: "rgba(5,150,105,0.06)", color: "rgba(112,25,118,0.60)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(5,150,105,0.12)"; e.currentTarget.style.borderColor = "rgba(5,150,105,0.4)"; e.currentTarget.style.color = "#059669" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(5,150,105,0.06)"; e.currentTarget.style.borderColor = "rgba(5,150,105,0.25)"; e.currentTarget.style.color = "rgba(112,25,118,0.60)" }}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />Approval Guide
          </button>
          <button
            onClick={() => setGuidelinesMode("rejection")}
            className="flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{ border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.06)", color: "rgba(112,25,118,0.60)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.12)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; e.currentTarget.style.color = "#ef4444" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.06)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.color = "rgba(112,25,118,0.60)" }}
          >
            <ScrollText className="w-3.5 h-3.5" />Rejection Rules
          </button>
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
                key={org.id} 
                org={org}
                onApprove={() => {}}
                onReject={() => {}}
                onOpenApproveDialog={() => setApproveDialog(org)}
                onOpenRejectDialog={() => setRejectDialog(org)}
                approving={actionState[org.id] === "approving"}
                rejecting={actionState[org.id] === "rejecting"}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogs */}
      <ApproveDialog
        org={approveDialog}
        open={!!approveDialog}
        onConfirm={handleApprove}
        onCancel={() => setApproveDialog(null)}
      />

      <RejectDialog
        org={rejectDialog}
        open={!!rejectDialog}
        onConfirm={handleReject}
        onCancel={() => setRejectDialog(null)}
      />

      <GuidelinesDialog
        open={!!guidelinesMode}
        onClose={() => setGuidelinesMode(null)}
        mode={guidelinesMode}
      />
    </div>
  )
}