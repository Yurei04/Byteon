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

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async () => {
    setError(null)

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!password) {
      setError("Password is required")
      return
    }

    setLoading(true)

    try {
      // 1️⃣ Sign in with Supabase Auth
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      const user = data?.user
      if (!user) {
        setError("Login failed. Please try again.")
        setLoading(false)
        return
      }

      // 2️⃣ Check if user exists in users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (userError && userError.code !== 'PGRST116') {
        console.error("Error checking users table:", userError)
      }

      if (userData) {
        // User found - redirect to user dashboard
        console.log("User account found, redirecting to user dashboard")
        router.push("/user-dashboard")
        setLoading(false)
        return
      }

      // 3️⃣ Check if user exists in organizations table
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle()

      if (orgError && orgError.code !== 'PGRST116') {
        console.error("Error checking organizations table:", orgError)
      }

      if (orgData) {
        // Organization found - redirect to org dashboard
        console.log("Organization account found, redirecting to org dashboard")
        router.push("/org-dashboard")
        setLoading(false)
        return
      }

      // 4️⃣ No profile found in either table
      setError("Profile not found. Please complete your signup.")
      await supabase.auth.signOut()
      setLoading(false)

    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Unexpected error occurred")
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleLogin()
    }
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
                  <a href="/sign-up" className="underline">
                    Sign up
                  </a>
                </FieldDescription>

                <FieldDescription className="text-center text-purple-300">
                  <a href="/forgot-password" className="underline">
                    Forgot password?
                  </a>
                </FieldDescription>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>
      </div>

      <FieldDescription className="text-center text-purple-300 px-6">
        By continuing, you agree to our{" "}
        <a className="underline" href="#">
          Terms of Service
        </a>{" "}
        and{" "}
        <a className="underline" href="#">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}