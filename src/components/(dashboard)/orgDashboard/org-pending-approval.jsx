"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Clock, XCircle, CheckCircle, LogOut, Mail, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// ─── OrgPendingApproval ───────────────────────────────────────────────────────
// Shown in place of the org dashboard when approval_status is not "approved".
// Props:
//   profile       – the organizations row (from authContext)
//   onLogout      – async fn to sign out
// ─────────────────────────────────────────────────────────────────────────────
export default function OrgPendingApproval({ profile, onLogout }) {
  const router   = useRouter()
  const [checking, setChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState(null)

  const status = profile?.approval_status ?? "pending"

  // Poll approval status every 30 s so the page auto-advances on approval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!profile?.user_id) return
      const { data } = await supabase
        .from("organizations")
        .select("approval_status")
        .eq("user_id", profile.user_id)
        .single()
      if (data?.approval_status === "approved") {
        // Force a full reload so authContext re-hydrates with the new status
        window.location.reload()
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [profile?.user_id])

  const handleManualCheck = async () => {
    if (!profile?.user_id) return
    setChecking(true)
    const { data } = await supabase
      .from("organizations")
      .select("approval_status")
      .eq("user_id", profile.user_id)
      .single()
    setLastChecked(new Date().toLocaleTimeString())
    if (data?.approval_status === "approved") {
      window.location.reload()
    }
    setChecking(false)
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut({ scope: "local" })
    } catch {}
    router.push("/log-in")
    if (onLogout) onLogout()
  }

  const P = "#c026d3"
  const S = "#a855f7"

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "#09050f",
        backgroundImage: `
          radial-gradient(#ffffff10 1px, transparent 1px),
          radial-gradient(circle at 20% 20%, ${P}25 0%, transparent 45%),
          radial-gradient(circle at 80% 80%, ${S}18 0%, transparent 45%)
        `,
        backgroundSize: "24px 24px, auto, auto",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: "rgba(10,5,20,0.85)",
            border: `1px solid ${status === "rejected" ? "rgba(239,68,68,0.3)" : `${P}30`}`,
            backdropFilter: "blur(24px)",
            boxShadow: `0 32px 80px ${status === "rejected" ? "rgba(239,68,68,0.12)" : `${P}18`}`,
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background:
                status === "rejected"
                  ? "linear-gradient(to right, transparent, rgba(239,68,68,0.6), transparent)"
                  : `linear-gradient(to right, transparent, ${P}60, ${S}40, transparent)`,
            }}
          />

          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none"
            style={{
              background:
                status === "rejected"
                  ? "radial-gradient(ellipse, rgba(239,68,68,0.12) 0%, transparent 70%)"
                  : `radial-gradient(ellipse, ${P}18 0%, transparent 70%)`,
            }}
          />

          {/* Icon */}
          <div className="relative flex flex-col items-center text-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={
                status === "rejected"
                  ? {
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      boxShadow: "0 0 30px rgba(239,68,68,0.15)",
                    }
                  : {
                      background: `${P}18`,
                      border: `1px solid ${P}35`,
                      boxShadow: `0 0 30px ${P}18`,
                    }
              }
            >
              {status === "rejected" ? (
                <XCircle className="w-9 h-9" style={{ color: "#f87171" }} />
              ) : (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="w-9 h-9" style={{ color: P }} />
                </motion.div>
              )}
            </div>

            {/* Heading */}
            <h1 className="text-2xl font-bold text-white mb-2">
              {status === "rejected"
                ? "Application Not Approved"
                : "Awaiting Approval"}
            </h1>

            <p
              className="text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {status === "rejected" ? (
                <>
                  Your organization application for{" "}
                  <span className="text-red-300 font-semibold">
                    {profile?.name || "your organization"}
                  </span>{" "}
                  was not approved.
                  {profile?.rejection_reason && (
                    <>
                      {" "}
                      Reason:{" "}
                      <span className="text-red-300/80 italic">
                        &ldquo;{profile.rejection_reason}&rdquo;
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  Your organization{" "}
                  <span className="font-semibold" style={{ color: P }}>
                    {profile?.name || ""}
                  </span>{" "}
                  has been registered and is waiting for a super admin to review
                  and approve your account. This usually takes less than 24 hours.
                </>
              )}
            </p>

            {/* Status pill */}
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-8"
              style={
                status === "rejected"
                  ? {
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      color: "#f87171",
                    }
                  : {
                      background: `${P}15`,
                      border: `1px solid ${P}30`,
                      color: P,
                    }
              }
            >
              {status === "rejected" ? (
                <>
                  <XCircle className="w-4 h-4" />
                  Not Approved
                </>
              ) : (
                <>
                  <motion.span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ background: P }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  Pending Review
                </>
              )}
            </div>

            {/* Info boxes */}
            {status === "pending" && (
              <div className="w-full space-y-3 mb-8">
                {[
                  {
                    icon: <CheckCircle className="w-4 h-4" />,
                    color: "#22c55e",
                    title: "Account registered",
                    sub: "Your credentials have been saved",
                  },
                  {
                    icon: (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{ display: "inline-flex" }}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.span>
                    ),
                    color: "#f59e0b",
                    title: "Awaiting admin review",
                    sub: "A super admin will review your application",
                  },
                  {
                    icon: <CheckCircle className="w-4 h-4" />,
                    color: "rgba(255,255,255,0.25)",
                    title: "Dashboard access granted",
                    sub: "You'll be notified once approved",
                  },
                ].map(({ icon, color, title, sub }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <span
                      className="w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center"
                      style={{ background: `${color}18`, color }}
                    >
                      {icon}
                    </span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: i < 1 ? "#fff" : "rgba(255,255,255,0.55)" }}>
                        {title}
                      </p>
                      <p className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                        {sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected: contact info */}
            {status === "rejected" && (
              <div
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl text-left mb-8"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                <Mail className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  If you believe this is a mistake, please contact the platform
                  administrator to discuss your application.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              {status === "pending" && (
                <button
                  onClick={handleManualCheck}
                  disabled={checking}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg, ${P}30, ${S}22)`,
                    border: `1px solid ${P}40`,
                    color: "#ffffff",
                  }}
                >
                  <motion.span
                    animate={checking ? { rotate: 360 } : {}}
                    transition={{ duration: 0.8, repeat: checking ? Infinity : 0, ease: "linear" }}
                    style={{ display: "inline-flex" }}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.span>
                  {checking ? "Checking…" : "Check status"}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>

            {lastChecked && (
              <p className="text-[11px] mt-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                Last checked at {lastChecked}
              </p>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
          This page refreshes automatically every 30 seconds
        </p>
      </motion.div>
    </div>
  )
}