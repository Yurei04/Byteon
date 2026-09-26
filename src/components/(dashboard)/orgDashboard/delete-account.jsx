"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { AlertTriangle, X, Trash2, Loader2, AlertCircle, Info, ShieldAlert } from "lucide-react"

export default function DeleteAccountModal({
  organizationName,
  userId,
  onClose,
  uiT,
  isDark = true,
}) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting]   = useState(false)
  const [error, setError]             = useState(null)

  const requiredText = `delete ${organizationName}`
  const isMatch      = confirmText === requiredText

  // ── Adaptive tokens ──────────────────────────────────────────────────────
  const overlayBg  = isDark ? "rgba(0,0,0,0.82)"         : "rgba(15,23,42,0.55)"
  const modalBg    = isDark ? "#140a0a"                   : "#ffffff"
  const modalBorder= isDark ? "rgba(220,38,38,0.40)"      : "rgba(220,38,38,0.25)"
  const headingCol = isDark ? "#fca5a5"                   : "#991b1b"
  const subheadCol = isDark ? "rgba(252,165,165,0.75)"    : "#7f1d1d"
  const bodyCol    = isDark ? "rgba(255,255,255,0.80)"    : "#374151"   // ← readable in both
  const mutedCol   = isDark ? "rgba(255,255,255,0.45)"    : "#6b7280"
  const strongCol  = isDark ? "#fda4af"                   : "#b91c1c"

  // Warn box
  const warnBg     = isDark ? "rgba(127,17,17,0.28)"      : "#fef2f2"
  const warnBorder = isDark ? "rgba(239,68,68,0.35)"      : "#fecaca"
  const warnText   = isDark ? "rgba(252,165,165,0.85)"    : "#7f1d1d"
  const warnStrong = isDark ? "#fca5a5"                   : "#991b1b"

  // Info box
  const infoBg     = isDark ? "rgba(12,52,124,0.25)"      : "#eff6ff"
  const infoBorder = isDark ? "rgba(59,130,246,0.28)"     : "#bfdbfe"
  const infoText   = isDark ? "rgba(147,197,253,0.90)"    : "#1e40af"
  const infoStrong = isDark ? "#93c5fd"                   : "#1d4ed8"

  // Input area
  const inputAreaBg  = isDark ? "rgba(0,0,0,0.35)"        : "#f8fafc"
  const inputAreaBdr = isDark ? "rgba(239,68,68,0.20)"    : "rgba(220,38,38,0.20)"
  const inputBg      = isDark ? "rgba(255,255,255,0.05)"  : "#ffffff"
  const inputText    = isDark ? "#ffffff"                 : "#111827"
  const inputBorder  = isDark ? "rgba(239,68,68,0.30)"    : "rgba(220,38,38,0.30)"
  const codeBg       = isDark ? "rgba(127,17,17,0.50)"    : "#fee2e2"
  const codeText     = isDark ? "#fca5a5"                 : "#991b1b"

  // Cancel btn
  const cancelBg    = isDark ? "rgba(255,255,255,0.04)"   : "#f1f5f9"
  const cancelBdr   = isDark ? "rgba(239,68,68,0.25)"     : "rgba(220,38,38,0.30)"
  const cancelText  = isDark ? "#fca5a5"                  : "#7f1d1d"

  const handleDelete = async () => {
    if (!isMatch) { setError("Confirmation text does not match."); return }
    setIsDeleting(true)
    setError(null)
    try {
      for (const [table, col] of [
        ["announcements", "organization"],
        ["blogs",         "organization"],
        ["resource_hub",  "organization"],
      ]) {
        const { error: e } = await supabase.from(table).delete().eq(col, organizationName)
        if (e) throw e
      }
      const { error: orgErr } = await supabase.from("organizations").delete().eq("user_id", userId)
      if (orgErr) throw orgErr
      const { error: authErr } = await supabase.auth.admin.deleteUser(userId)
      if (authErr) await supabase.auth.signOut()
      alert("Your account has been successfully deleted.")
      router.push("/")
    } catch (err) {
      setError(`Failed to delete account: ${err.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: overlayBg, backdropFilter: "blur(6px)" }}
    >
      {/* ── Modal ── */}
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: modalBg,
          border:     `1px solid ${modalBorder}`,
          boxShadow:  isDark
            ? "0 24px 64px rgba(0,0,0,0.70), 0 0 0 1px rgba(239,68,68,0.12)"
            : "0 24px 64px rgba(15,23,42,0.18), 0 0 0 1px rgba(220,38,38,0.10)",
          transition: "background 0.25s ease",
        }}
      >

        {/* ── Top accent bar ── */}
        <div
          className="h-1 w-full"
          style={{ background: "linear-gradient(90deg, #dc2626, #b91c1c, #7f1d1d)" }}
        />

        {/* ── Header ── */}
        <div
          className="relative flex items-start gap-4 px-6 pt-6 pb-5"
          style={{ borderBottom: `1px solid ${isDark ? "rgba(239,68,68,0.15)" : "rgba(220,38,38,0.12)"}` }}
        >
          {/* Icon */}
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
            style={{
              background: isDark ? "rgba(220,38,38,0.18)" : "#fee2e2",
              border:     `1px solid ${isDark ? "rgba(239,68,68,0.35)" : "#fecaca"}`,
            }}
          >
            <ShieldAlert className="w-5 h-5" style={{ color: isDark ? "#fca5a5" : "#dc2626" }} />
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h2 className="text-base font-semibold leading-snug" style={{ color: headingCol }}>
              Delete Organization Account
            </h2>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: subheadCol }}>
              This will permanently delete <strong style={{ color: headingCol }}>{organizationName}</strong> and all its data. This cannot be undone.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-150 disabled:opacity-40"
            style={{ color: mutedCol }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5 space-y-4">

          {/* What gets deleted */}
          <div
            className="rounded-xl p-4 flex gap-3"
            style={{ background: warnBg, border: `1px solid ${warnBorder}` }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: warnStrong }} />
            <div>
              <p className="text-xs font-semibold mb-1.5" style={{ color: warnStrong }}>
                The following will be permanently deleted:
              </p>
              <ul className="space-y-1">
                {[
                  "Organization profile and all settings",
                  `All announcements by ${organizationName}`,
                  `All blogs by ${organizationName}`,
                  `All resources by ${organizationName}`,
                  "Login credentials and account access",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: warnText }}>
                    <span className="mt-1 w-1 h-1 rounded-full flex-shrink-0" style={{ background: isDark ? "#f87171" : "#ef4444" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Info notice */}
          <div
            className="rounded-xl px-4 py-3 flex gap-3 items-start"
            style={{ background: infoBg, border: `1px solid ${infoBorder}` }}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: infoStrong }} />
            <p className="text-xs leading-relaxed" style={{ color: infoText }}>
              <span className="font-semibold" style={{ color: infoStrong }}>Back up your data first. </span>
              There is no way to recover your account after deletion.
            </p>
          </div>

          {/* Confirmation input */}
          <div
            className="rounded-xl p-4 space-y-3"
            style={{ background: inputAreaBg, border: `1px solid ${inputAreaBdr}` }}
          >
            <p className="text-xs leading-relaxed" style={{ color: bodyCol }}>
              Type{" "}
              <code
                className="px-1.5 py-0.5 rounded font-mono text-xs"
                style={{ background: codeBg, color: codeText }}
              >
                {requiredText}
              </code>{" "}
              to confirm:
            </p>

            <div className="relative">
              <input
                value={confirmText}
                onChange={e => { setConfirmText(e.target.value); setError(null) }}
                placeholder={requiredText}
                disabled={isDeleting}
                autoFocus
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all duration-200"
                style={{
                  background:  inputBg,
                  border:      `1px solid ${isMatch ? "#4ade80" : inputBorder}`,
                  color:       inputText,
                  boxShadow:   isMatch ? "0 0 0 3px rgba(74,222,128,0.18)" : "none",
                  boxSizing:   "border-box",
                }}
                onFocus={e  => { if (!isMatch) e.target.style.borderColor = "rgba(239,68,68,0.65)" }}
                onBlur={e   => { if (!isMatch) e.target.style.borderColor = inputBorder }}
              />
              {/* Match checkmark */}
              {isMatch && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold"
                  style={{ color: "#4ade80" }}
                >
                  ✓
                </span>
              )}
            </div>

            {/* Progress hint */}
            {confirmText.length > 0 && !isMatch && (
              <p className="text-[11px]" style={{ color: isDark ? "rgba(252,165,165,0.60)" : "#b91c1c" }}>
                {requiredText.startsWith(confirmText)
                  ? `Keep going… ${requiredText.length - confirmText.length} characters left`
                  : "Doesn't match — check spelling and spacing"}
              </p>
            )}

            {error && (
              <div
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                style={{
                  background: isDark ? "rgba(239,68,68,0.15)" : "#fef2f2",
                  border:     `1px solid ${isDark ? "rgba(239,68,68,0.35)" : "#fecaca"}`,
                  color:      isDark ? "#fca5a5" : "#991b1b",
                }}
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div
          className="flex gap-3 px-6 pb-6"
          style={{ borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)"}`, paddingTop: 16 }}
        >
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: cancelBg, border: `1px solid ${cancelBdr}`, color: cancelText }}
            onMouseEnter={e => e.currentTarget.style.background = isDark ? "rgba(239,68,68,0.10)" : "#fee2e2"}
            onMouseLeave={e => e.currentTarget.style.background = cancelBg}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={!isMatch || isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
            style={{
              background: isMatch ? "#dc2626" : (isDark ? "rgba(220,38,38,0.35)" : "#fecaca"),
              color:      isMatch ? "#ffffff"  : (isDark ? "rgba(252,165,165,0.50)" : "#f87171"),
              border:     "none",
              boxShadow:  isMatch && !isDeleting ? "0 4px 14px rgba(220,38,38,0.38)" : "none",
              transform:  "translateY(0)",
              transition: "background 0.2s, box-shadow 0.2s, transform 0.15s",
            }}
            onMouseEnter={e => { if (isMatch && !isDeleting) { e.currentTarget.style.background = "#b91c1c"; e.currentTarget.style.transform = "translateY(-1px)" }}}
            onMouseLeave={e => { e.currentTarget.style.background = isMatch ? "#dc2626" : (isDark ? "rgba(220,38,38,0.35)" : "#fecaca"); e.currentTarget.style.transform = "translateY(0)" }}
          >
            {isDeleting
              ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</>
              : <><Trash2  className="w-4 h-4" />Delete Organization</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}