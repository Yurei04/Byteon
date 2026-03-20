"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { persistCurrentSession } from "@/lib/restoreSession"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { TermsDialog } from "@/components/terms-and-condition/terms-and-condition-dialog"
import { PrivacyDialog } from "@/components/privacy-policies/privacy-policy-dialog"

export function LoginForm() {
  const router = useRouter()
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

      const { data: superData, error: superError } = await supabase
        .from("super_admins")
        .select("user_id, id, name, organization_id, created_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (superError) {
        setError(`Login error: ${superError.message}`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      if (superData) {
        await persistCurrentSession({ ...superData, role: "super_admin", table: "super_admins" }, "super_admin")
        try { sessionStorage.clear() } catch {}
        window.location.href = "/super-admin-dashboard"
        return
      }

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("user_id, id, name, author_name, description, profile_photo_url, profile_completed, active, suspension_reason, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (orgError) {
        setError(`Login error: ${orgError.message}`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      if (orgData) {
        if (orgData.active === false) {
          await supabase.auth.signOut()
          const url = `/account-suspended?reason=suspended${orgData.suspension_reason ? `&detail=${encodeURIComponent(orgData.suspension_reason)}` : ""}`
          window.location.href = url
          return
        }
        await persistCurrentSession({ ...orgData, role: "org_admin", table: "organizations" }, "org_admin")
        try { sessionStorage.clear() } catch {}
        window.location.href = "/org-dashboard"
        return
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id, id, name, age, affiliation, country, profile_photo_url, profile_completed, active, suspension_reason, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (userError) {
        setError(`Login error: ${userError.message}`)
        await supabase.auth.signOut()
        setLoading(false)
        return
      }
      if (userData) {
        if (userData.active === false) {
          await supabase.auth.signOut()
          const url = `/account-suspended?reason=suspended${userData.suspension_reason ? `&detail=${encodeURIComponent(userData.suspension_reason)}` : ""}`
          window.location.href = url
          return
        }
        await persistCurrentSession({ ...userData, role: "user", table: "users" }, "user")
        try { sessionStorage.clear() } catch {}
        window.location.href = "/user-dashboard"
        return
      }

      await supabase.auth.signOut()
      window.location.href = "/account-suspended?reason=deleted"

    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleLogin() }
  }

  const inputCls = "h-8 text-sm bg-purple-900/30 border-purple-500/40 focus:border-purple-400 placeholder:text-purple-500/60 text-purple-50 rounded-lg"
  const labelCls = "text-purple-200 text-xs font-medium"

  return (
    <div className="h-full w-full flex items-center justify-center overflow-hidden py-2">
      <div className="w-full max-w-md">
        <Card className="relative overflow-hidden bg-purple-950/50 border border-purple-500/30 text-purple-50 backdrop-blur-xl shadow-2xl shadow-purple-900/40 rounded-2xl">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />

          <CardHeader className="px-5 pt-4 pb-2 space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-purple-400/80 hover:text-purple-200 transition-colors group w-fit"
            >
              <ArrowLeft className="size-3 group-hover:-translate-x-0.5 transition-transform" />
              Back to home
            </Link>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">Welcome back</CardTitle>
              <CardDescription className="text-purple-300/70 text-xs mt-0.5">
                Sign in to your account to continue
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-5 pt-1">
            {justRegistered && (
              <div className="flex items-center gap-2 mb-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                <p className="text-emerald-300 text-xs">Account created! You can now sign in.</p>
              </div>
            )}

            <div onKeyDown={handleKeyDown}>
              <FieldGroup className="space-y-2.5">
                <Field>
                  <FieldLabel className={labelCls}>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    required
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between mb-1">
                    <FieldLabel className={labelCls}>Password</FieldLabel>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    required
                  />
                </Field>

                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                    <AlertCircle className="size-3.5 text-red-400 shrink-0" />
                    <p className="text-red-400 text-xs leading-snug">{error}</p>
                  </div>
                )}

                <Button
                  onClick={handleLogin}
                  disabled={loading}
                  className="cursor-pointer w-full h-9 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-lg shadow-purple-900/50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin size-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </span>
                  ) : "Sign in"}
                </Button>

                <p className="text-center text-purple-400/70 text-xs">
                  Don&apos;t have an account?{" "}
                  <a href="/sign-up" className="cursor-pointer text-purple-300 hover:text-white underline underline-offset-2 transition-colors">
                    Sign up
                  </a>
                </p>

                <p className="text-center text-purple-400/50 text-xs leading-relaxed px-2">
                  By continuing, you agree to our{" "}
                  <TermsDialog trigger={
                    <button type="button" className="cursor-pointer underline underline-offset-2 text-purple-400/70 hover:text-purple-200 transition-colors">Terms of Service</button>
                  } />{" "}and{" "}
                  <PrivacyDialog trigger={
                    <button type="button" className="cursor-pointer underline underline-offset-2 text-purple-400/70 hover:text-purple-200 transition-colors">Privacy Policy</button>
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