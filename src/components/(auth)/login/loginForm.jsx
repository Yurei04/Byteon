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
      // 1️⃣ Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) { setError(signInError.message); setLoading(false); return }

      const user = data?.user
      if (!user) { setError("Login failed. Please try again."); setLoading(false); return }

      // 2️⃣ Check super_admins FIRST — super admins are never suspended
      const { data: superData } = await supabase
        .from("super_admins")
        .select("user_id, id, name, organization_id, created_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (superData) {
        await persistCurrentSession(
          { ...superData, role: "super_admin", table: "super_admins" },
          "super_admin"
        )
        try { sessionStorage.clear() } catch {}
        router.push("/super-admin-dashboard")
        setLoading(false)
        return
      }

      // 3️⃣ Check organizations SECOND
      const { data: orgData } = await supabase
        .from("organizations")
        .select("user_id, id, name, author_name, description, profile_photo_url, profile_completed, active, suspension_reason, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (orgData) {
        // ✅ Block suspended org accounts before persisting session
        if (orgData.active === false) {
          await supabase.auth.signOut({ scope: "local" })
          const url = `/account-suspended?reason=suspended${orgData.suspension_reason ? `&detail=${encodeURIComponent(orgData.suspension_reason)}` : ""}`
          router.push(url)
          setLoading(false)
          return
        }

        await persistCurrentSession(
          { ...orgData, role: "org_admin", table: "organizations" },
          "org_admin"
        )
        try { sessionStorage.clear() } catch {}
        router.push("/org-dashboard")
        setLoading(false)
        return
      }

      // 4️⃣ Check users table LAST
      const { data: userData } = await supabase
        .from("users")
        .select("user_id, id, name, age, affiliation, country, profile_photo_url, profile_completed, active, suspension_reason, created_at, updated_at")
        .eq("user_id", user.id)
        .maybeSingle()

      if (userData) {
        // ✅ Block suspended user accounts before persisting session
        if (userData.active === false) {
          await supabase.auth.signOut({ scope: "local" })
          const url = `/account-suspended?reason=suspended${userData.suspension_reason ? `&detail=${encodeURIComponent(userData.suspension_reason)}` : ""}`
          router.push(url)
          setLoading(false)
          return
        }

        await persistCurrentSession(
          { ...userData, role: "user", table: "users" },
          "user"
        )
        try { sessionStorage.clear() } catch {}
        router.push("/user-dashboard")
        setLoading(false)
        return
      }

      // 5️⃣ Session exists but no profile row = account was deleted
      await supabase.auth.signOut({ scope: "local" })
      router.push("/account-suspended?reason=deleted")
      setLoading(false)

    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") { e.preventDefault(); handleLogin() }
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <div className="relative overflow-hidden rounded-lg bg-purple-950/40 border-2 border-purple-400/40 text-purple-50 backdrop-blur-xl shadow-2xl shadow-purple-500/30 transition-all duration-500 hover:border-purple-400/70 hover:shadow-purple-500/20 group w-full">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(168,85,247,0.15), transparent 50%)",
          }}
        />

        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Welcome back</CardTitle>
            <CardDescription className="text-purple-200">
              Sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            {justRegistered && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-900/30 border border-emerald-500/40 text-emerald-200 text-sm text-center">
                ✅ Account created! You can now sign in.
              </div>
            )}
            <div onKeyPress={handleKeyPress}>
              <FieldGroup>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>

                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Field>

                {error && (
                  <FieldDescription className="text-red-400 text-center">
                    {error}
                  </FieldDescription>
                )}

                <Button onClick={handleLogin} disabled={loading} className="w-full">
                  {loading ? "Signing in..." : "Sign in"}
                </Button>

                <FieldDescription className="text-center text-purple-300">
                  Don&apos;t have an account?{" "}
                  <a href="/sign-up" className="underline">Sign up</a>
                </FieldDescription>

                <FieldDescription className="text-center text-purple-300">
                  <a href="/forgot-password" className="underline">Forgot password?</a>
                </FieldDescription>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <FieldDescription className="text-center text-purple-300 px-6">
        By continuing, you agree to our{" "}
        <a className="underline" href="#">Terms of Service</a>{" "}
        and{" "}
        <a className="underline" href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}