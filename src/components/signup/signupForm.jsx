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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

export function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPass, setConfirmPass] = useState("")
  const [orgName, setOrgName] = useState("")
  const [mode, setMode] = useState("user")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPass) {
      setError("Passwords do not match")
      return
    }

    if (mode === "organization" && !orgName) {
      setError("Organization name is required")
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (mode === "organization") {
      const { error: orgError } = await supabase
        .from("organization")
        .insert({
          user_id: data.user.id,
          name: orgName,
          author_name: email,
        })

      if (orgError) {
        setError(orgError.message)
        setLoading(false)
        return
      }
    }

    setLoading(false)
    alert("Account created successfully")
  }

  return (
    <div className="flex flex-col gap-6 items-center">
      <Tabs
        defaultValue="user"
        onValueChange={setMode}
        className="w-full"
      >
        <div className="flex justify-center">
          <TabsList className="bg-purple-900/40 border border-purple-400/30">
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
          </TabsList>
        </div>

        {["user", "organization"].map((type) => (
          <TabsContent
            key={type}
            value={type}
            className="relative overflow-hidden rounded-lg bg-purple-950/40 border-2 border-purple-400/40 text-purple-50 backdrop-blur-xl shadow-2xl shadow-purple-500/30 transition-all duration-500 hover:border-purple-400/70 hover:shadow-purple-500/20 group"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(168,85,247,0.15), transparent 50%)",
              }}
            />

            <Card className="bg-transparent border-none shadow-none">
              <CardHeader className="text-center">
                <CardTitle className="text-xl">
                  {type === "user"
                    ? "Create your account"
                    : "Create your organization account"}
                </CardTitle>
                <CardDescription className="text-purple-200">
                  {type === "user"
                    ? "Enter your details below to create your account"
                    : "Organization details and admin account"}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSignUp}>
                  <FieldGroup>
                    {type === "organization" && (
                      <Field>
                        <FieldLabel>Organization Name</FieldLabel>
                        <Input
                          placeholder="My Organization"
                          onChange={(e) => setOrgName(e.target.value)}
                        />
                      </Field>
                    )}

                    <Field>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        type="email"
                        placeholder="m@example.com"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Field>

                    <Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel>Password</FieldLabel>
                          <Input
                            type="password"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel>Confirm Password</FieldLabel>
                          <Input
                            type="password"
                            onChange={(e) =>
                              setConfirmPass(e.target.value)
                            }
                            required
                          />
                        </Field>
                      </div>
                      <FieldDescription className="text-purple-300">
                        Must be at least 8 characters long.
                      </FieldDescription>
                    </Field>

                    {error && (
                      <FieldDescription className="text-red-400 text-center">
                        {error}
                      </FieldDescription>
                    )}

                    <Button type="submit" disabled={loading}>
                      {loading
                        ? "Creating..."
                        : type === "user"
                        ? "Create Account"
                        : "Create Organization"}
                    </Button>

                    <FieldDescription className="text-center text-purple-300">
                      Already have an account?{" "}
                      <a href="/log-in" className="underline">
                        Sign in
                      </a>
                    </FieldDescription>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

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
