"use client"
import { supabase } from "@/lib/supabase";
import { useRouter  } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) router.push("/")
    else alert(error.message)
  };

  return (
    <form className="w-full h-full flex flex-col gap-6 mx-auto p-8 sm-p-4 rounded-lg bg-purple-950/40 border-purple-400/40 hover:border-purple-400/70 hover:shadow-purple-500/20 shadow-2xl backdrop-blur-xl border-2 text-purple-50 transition-all duration-500 hover:shadow-2xl shadow-purple-500/30 relative overflow-hidden group">
      <motion.div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
              background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(168, 85, 247, 0.15), transparent 50%)`
          }}
      />
      <FieldGroup className="w-full h-full">
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email below to login to your account
          </p>
        </div>
        <Field className="w-full">
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input 
            className="w-full"  
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            onChange={(e) => setEmail(e.targert.value)}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input 
            className=""
            id="password" 
            type="password" 
            required 
            onChange={(e => setPassword(e.target.value))}
          />
        </Field>
        <Field>
          <Button 
            className="cursor-pointer" 
            type="submit"
            onClick={handleLogin}
          >
            Login
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link 
            className=""
            href="/sign-up"
            > 
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
