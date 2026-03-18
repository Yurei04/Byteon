"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { clearAllAccounts } from "@/lib/accountManager"
import { ShieldOff, Trash2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

function AccountSuspendedContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const reason       = searchParams.get("reason") // "suspended" | "deleted"
  const detail       = searchParams.get("detail") // optional reason text

  const isDeleted = reason === "deleted"

  // Force sign-out on mount — clears the dangling Supabase session
  // and wipes the multi-account localStorage store
  useEffect(() => {
    const cleanup = async () => {
      try {
        const lsKeys = Object.keys(localStorage).filter(k => k.startsWith("sb-"))
        lsKeys.forEach(k => localStorage.removeItem(k))
        await supabase.auth.signOut({ scope: "local" })
      } catch {}
      try { sessionStorage.clear() } catch {}
      try { clearAllAccounts() } catch {}
    }
    cleanup()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className={`
          rounded-2xl border backdrop-blur-xl p-8 text-center shadow-2xl
          ${isDeleted
            ? "bg-red-950/40 border-red-500/30 shadow-red-900/30"
            : "bg-amber-950/40 border-amber-500/30 shadow-amber-900/30"}
        `}>

          {/* Icon */}
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border
            ${isDeleted
              ? "bg-red-500/20 border-red-500/30"
              : "bg-amber-500/20 border-amber-500/30"}
          `}>
            {isDeleted
              ? <Trash2    className="w-9 h-9 text-red-400" />
              : <ShieldOff className="w-9 h-9 text-amber-400" />}
          </div>

          {/* Title */}
          <h1 className={`text-2xl font-bold mb-2 ${isDeleted ? "text-red-200" : "text-amber-200"}`}>
            {isDeleted ? "Account Deleted" : "Account Suspended"}
          </h1>

          {/* Subtitle */}
          <p className="text-white/50 text-sm mb-6">
            {isDeleted
              ? "This account has been permanently removed from the platform."
              : "Your account has been temporarily suspended by an administrator."}
          </p>

          {/* Reason box */}
          <div className={`
            rounded-xl p-4 mb-6 flex items-start gap-3 text-left
            ${isDeleted
              ? "bg-red-900/20 border border-red-500/20"
              : "bg-amber-900/20 border border-amber-500/20"}
          `}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDeleted ? "text-red-400" : "text-amber-400"}`} />
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDeleted ? "text-red-400" : "text-amber-400"}`}>
                Reason
              </p>
              <p className="text-white/70 text-sm">
                {detail
                  ? decodeURIComponent(detail)
                  : isDeleted
                    ? "Your account and all associated data have been permanently deleted by an administrator."
                    : "Your account has been suspended. Please contact support if you believe this is a mistake."}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {!isDeleted && (
              <p className="text-white/40 text-xs">
                If you believe this is a mistake, please contact the platform administrator.
              </p>
            )}
            <Button
              onClick={() => router.push("/")}
              className={`w-full ${isDeleted
                ? "bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200"
                : "bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200"}`}
            >
              Return to Home
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}

// useSearchParams() requires a Suspense boundary in Next.js app router
export default function AccountSuspendedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-fuchsia-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-400/30 border-t-fuchsia-400 rounded-full animate-spin" />
      </div>
    }>
      <AccountSuspendedContent />
    </Suspense>
  )
}