"use client"

import { Button } from "@/components/ui/button"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { persistCurrentSession } from "@/lib/restoreSession"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { TermsDialog } from "@/components/terms-and-condition/terms-and-condition-dialog"
import { PrivacyDialog } from "@/components/privacy-policies/privacy-policy-dialog"

const AUTH_CACHE_KEY = "auth_cache"
function clearProfileCache() {
  try { sessionStorage.removeItem(AUTH_CACHE_KEY) } catch {}
}

export function LoginForm() {
  const searchParams = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search)
    : null
  const justRegistered = searchParams?.get("registered") === "true"

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  const handleLogin = async () => {
    setError(null)
    if (!email.trim()) { setError("Email is required"); return }
    if (!password)     { setError("Password is required"); return }

    setLoading(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError) { setError(signInError.message); setLoading(false); return }

      const user = data?.user
      if (!user) { setError("Login failed. Please try again."); setLoading(false); return }

      // ── Super admin ──────────────────────────────────────────────────────
      const { data: superData, error: superError } = await supabase
        .from("super_admins")
        .select("user_id, id, name, organization_id, created_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (superError) {
        setError(`Login error: ${superError.message}`)
        await supabase.auth.signOut({ scope: "local" })
        setLoading(false)
        return
      }
      if (superData) {
        await persistCurrentSession(
          { ...superData, role: "super_admin", table: "super_admins" },
          "super_admin"
        )
        clearProfileCache()
        window.location.href = "/super-admin-dashboard"
        return
      }

      // ── Organization ─────────────────────────────────────────────────────
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select(`
          user_id, id, name, author_name, description, profile_photo_url,
          profile_completed, active, suspension_reason,
          approval_status, rejection_reason, created_at, updated_at
        `)
        .eq("user_id", user.id)
        .maybeSingle()

      if (orgError) {
        setError(`Login error: ${orgError.message}`)
        await supabase.auth.signOut({ scope: "local" })
        setLoading(false)
        return
      }
      if (orgData) {
        if (orgData.active === false) {
          await supabase.auth.signOut({ scope: "local" })
          const url = `/account-suspended?reason=suspended${
            orgData.suspension_reason
              ? `&detail=${encodeURIComponent(orgData.suspension_reason)}`
              : ""
          }`
          window.location.href = url
          return
        }
        await persistCurrentSession(
          { ...orgData, role: "org_admin", table: "organizations" },
          "org_admin"
        )
        clearProfileCache()
        window.location.href = "/org-dashboard"
        return
      }

      // ── Regular user ─────────────────────────────────────────────────────
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select(`
          user_id, id, name, age, affiliation, country,
          profile_photo_url, profile_completed, active,
          suspension_reason, created_at, updated_at
        `)
        .eq("user_id", user.id)
        .maybeSingle()

      if (userError) {
        setError(`Login error: ${userError.message}`)
        await supabase.auth.signOut({ scope: "local" })
        setLoading(false)
        return
      }
      if (userData) {
        if (userData.active === false) {
          await supabase.auth.signOut({ scope: "local" })
          const url = `/account-suspended?reason=suspended${
            userData.suspension_reason
              ? `&detail=${encodeURIComponent(userData.suspension_reason)}`
              : ""
          }`
          window.location.href = url
          return
        }
        await persistCurrentSession(
          { ...userData, role: "user", table: "users" },
          "user"
        )
        clearProfileCache()
        window.location.href = "/user-dashboard"
        return
      }

      // ── No profile found ──────────────────────────────────────────────────
      await supabase.auth.signOut({ scope: "local" })
      window.location.href = "/account-suspended?reason=deleted"

    } catch (err) {
      console.error("[LoginForm] Unexpected error:", err)
      setError(err.message || "Unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleLogin() }
  }

  const inputStyle = {
    background:   "rgb(var(--surface-raised))",
    borderColor:  "rgb(var(--surface-border) / 0.5)",
    color:        "rgb(var(--text-primary))",
  }

  const linkStyle = { color: "rgb(var(--text-faint))" }

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden py-2">
      <div className="w-full max-w-md">
        <Card
          className="relative overflow-hidden backdrop-blur-xl shadow-2xl rounded-2xl"
          style={{
            background: "rgb(var(--surface-raised))",
            border:     "1px solid rgb(var(--surface-border) / 0.3)",
            color:      "rgb(var(--text-primary))",
          }}
        >
          {/* Top accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(to right, transparent, rgb(var(--brand-400) / 0.5), transparent)`,
            }}
          />

          <CardHeader className="px-5 pt-4 pb-2 space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs transition-colors group w-fit"
              style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--text-primary))")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-faint))")}
            >
              <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
            <div>
              <CardTitle
                className="text-base font-semibold tracking-tight"
                style={{ color: "rgb(var(--text-primary))" }}
              >
                Welcome back
              </CardTitle>
              <CardDescription
                className="text-xs mt-0.5"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                Sign in to your account to continue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5 pt-1">
            {/* Success banner */}
            {justRegistered && (
              <div className="flex items-center gap-2 mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                <p className="text-emerald-600 dark:text-emerald-400 text-xs">
                  Account created! You can now sign in.
                </p>
              </div>
            )}

            <div onKeyDown={handleKeyDown}>
              <FieldGroup className="space-y-2.5">

                <Field>
                  <FieldLabel
                    className="text-xs font-medium"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    Email
                  </FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-8 text-sm rounded-lg"
                    style={inputStyle}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel
                    className="text-xs font-medium"
                    style={{ color: "rgb(var(--text-secondary))" }}
                  >
                    Password
                  </FieldLabel>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-8 text-sm rounded-lg"
                    style={inputStyle}
                    required
                  />
                </Field>

                {/* Error banner */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    <AlertCircle className="size-3.5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-xs leading-snug">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="cursor-pointer w-full h-9 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, rgb(var(--brand-600)), rgb(var(--accent-600)))`,
                    color:      "rgb(var(--fg-on-brand, 255 255 255))",
                    boxShadow:  "0 2px 16px rgb(var(--brand-500) / 0.25)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 24px rgb(var(--brand-500) / 0.4)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 2px 16px rgb(var(--brand-500) / 0.25)")}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </>
                  ) : "Sign in"}
                </button>

                {/* Sign up link */}
                <p className="text-center text-xs" style={{ color: "rgb(var(--text-faint))" }}>
                  Don&apos;t have an account?{" "}
                  <a
                    href="/sign-up"
                    className="underline underline-offset-2 transition-colors"
                    style={{ color: "rgb(var(--text-secondary))" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--text-primary))")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-secondary))")}
                  >
                    Sign up
                  </a>
                </p>

                {/* Legal footer */}
                <p
                  className="text-center text-xs leading-relaxed px-2"
                  style={{ color: "rgb(var(--text-faint))" }}
                >
                  By continuing, you agree to our{" "}
                  <TermsDialog trigger={
                    <button
                      type="button"
                      className="underline underline-offset-2 transition-colors"
                      style={{ color: "rgb(var(--text-muted))" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--text-primary))")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-muted))")}
                    >
                      Terms of Service
                    </button>
                  } />{" "}and{" "}
                  <PrivacyDialog trigger={
                    <button
                      type="button"
                      className="underline underline-offset-2 transition-colors"
                      style={{ color: "rgb(var(--text-muted))" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgb(var(--text-primary))")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgb(var(--text-muted))")}
                    >
                      Privacy Policy
                    </button>
                  } />.
                </p>

              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}