"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { clearAllAccounts } from "@/lib/accountManager"
import { ShieldOff, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

function AccountSuspendedContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  // URL params are the fallback — primary source is DB
  const reasonParam = searchParams.get("reason") // "suspended" | "deleted"
  const detailParam = searchParams.get("detail") // pre-encoded reason text (optional)

  const [resolvedReason, setResolvedReason] = useState(detailParam ? decodeURIComponent(detailParam) : null)
  const [isDeleted, setIsDeleted]           = useState(reasonParam === "deleted")
  const [fetching, setFetching]             = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        // ── 1. Get current session BEFORE signing out ────────────────────────
        const { data: { session } } = await supabase.auth.getSession()
        const authId = session?.user?.id

        if (authId) {
          // ── 2. Check users table first ────────────────────────────────────
          const { data: userRow } = await supabase
            .from("users")
            .select("active, suspension_reason")
            .eq("user_id", authId)
            .maybeSingle()

          if (userRow) {
            const deleted = userRow.active === null // truly removed row edge-case
            setIsDeleted(reasonParam === "deleted" || deleted)
            if (userRow.suspension_reason) {
              setResolvedReason(userRow.suspension_reason)
            }
          } else {
            // ── 3. Fall back to organizations table ──────────────────────────
            const { data: orgRow } = await supabase
              .from("organizations")
              .select("active, suspension_reason")
              .eq("user_id", authId)
              .maybeSingle()

            if (orgRow?.suspension_reason) {
              setResolvedReason(orgRow.suspension_reason)
            }

            if (reasonParam === "deleted") setIsDeleted(true)
          }
        }
      } catch (err) {
        console.error("[AccountSuspendedPage] fetch error:", err)
      } finally {
        setFetching(false)
      }

      // ── 4. Sign out AFTER reading the reason ──────────────────────────────
      try {
        const lsKeys = Object.keys(localStorage).filter(k => k.startsWith("sb-"))
        lsKeys.forEach(k => localStorage.removeItem(k))
        await supabase.auth.signOut({ scope: "local" })
      } catch {}
      try { sessionStorage.clear() } catch {}
      try { clearAllAccounts() } catch {}
    }

    init()
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading state while we fetch the reason ────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-fuchsia-400/50" />
      </div>
    )
  }

  // ── Default reason copy ────────────────────────────────────────────────────
  const defaultReason = isDeleted
    ? "Your account and all associated data have been permanently deleted by an administrator."
    : "Your account has been suspended. Please contact support if you believe this is a mistake."

  const displayReason = resolvedReason || defaultReason

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className={`
          rounded-2xl border backdrop-blur-xl p-8 text-center shadow-2xl
          ${isDeleted
            ? "bg-red-950/40 border-red-500/30 shadow-red-900/30"
            : "bg-amber-950/40 border-amber-500/30 shadow-amber-900/30"}
        `}>

          {/* ── Icon ── */}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border
            ${isDeleted
              ? "bg-red-500/20 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
              : "bg-amber-500/20 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]"}
          `}>
            {isDeleted
              ? <Trash2    className="w-9 h-9 text-red-400"   />
              : <ShieldOff className="w-9 h-9 text-amber-400" />}
          </div>

          {/* ── Title ── */}
          <h1 className={`text-2xl font-bold mb-2 ${isDeleted ? "text-red-200" : "text-amber-200"}`}>
            {isDeleted ? "Account Deleted" : "Account Suspended"}
          </h1>

          {/* ── Subtitle ── */}
          <p className="text-white/50 text-sm mb-6">
            {isDeleted
              ? "This account has been permanently removed from the platform."
              : "Your account has been temporarily suspended by an administrator."}
          </p>

          {/* ── Reason box ── */}
          <div className={`
            rounded-xl p-4 mb-6 flex items-start gap-3 text-left
            ${isDeleted
              ? "bg-red-900/20 border border-red-500/20"
              : "bg-amber-900/20 border border-amber-500/20"}
          `}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDeleted ? "text-red-400" : "text-amber-400"}`} />
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDeleted ? "text-red-400" : "text-amber-400"}`}>
                Reason
              </p>
              <p className="text-white/75 text-sm leading-relaxed">
                {displayReason}
              </p>
            </div>
          </div>

          {/* ── Contact note (suspension only) ── */}
          {!isDeleted && (
            <p className="text-white/35 text-xs mb-4 leading-relaxed">
              If you believe this is a mistake, please contact the platform administrator for assistance.
            </p>
          )}

          {/* ── CTA ── */}
          <Button
            onClick={() => router.push("/")}
            className={`w-full transition-all duration-200 active:scale-[0.98] ${
              isDeleted
                ? "bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 hover:shadow-lg hover:shadow-red-900/30"
                : "bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 hover:shadow-lg hover:shadow-amber-900/30"
            }`}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function AccountSuspendedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400/40" />
      </div>
    }>
      <AccountSuspendedContent />
    </Suspense>
  )
}