"use client"

import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if(error) router.push("/log-in")
    if (!error) router.push("/homepage")
    else alert(error.message)
  
  }

  return (
    <form
      onSubmit={handleLogin}
      className="relative w-full h-full flex flex-col gap-6 mx-auto p-8 sm-p-4 rounded-lg 
        bg-purple-950/40 border-2 border-purple-400/40 text-purple-50 
        backdrop-blur-xl shadow-2xl shadow-purple-500/30 
        transition-all duration-500 hover:border-purple-400/70 hover:shadow-purple-500/20 
        overflow-hidden group"
    >
      <motion.div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at var(--mouse-x,50%) var(--mouse-y,50%), rgba(168,85,247,0.15), transparent 50%)",
        }}
      />

      <FieldGroup className="relative z-10 w-full h-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-purple-300 text-balance">
            Enter your email below to login to your account
          </p>
        </div>

        <Field className="w-full">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm text-purple-300 underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </Field>

        <Field>
          <FieldDescription className="text-center text-purple-300">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
