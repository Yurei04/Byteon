"use client"

import { SignupForm } from "@/components/(auth)/signup/signupForm"
import { GalleryVerticalEnd, Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function SignupPage() {
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    // Initialise from localStorage or default to dark
    const stored = localStorage.getItem("byteon-theme")
    const prefersDark = stored ? stored === "dark" : true
    setIsDark(prefersDark)
    document.documentElement.classList.toggle("dark", prefersDark)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("byteon-theme", next ? "dark" : "light")
  }

  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 relative"
      style={{ background: "rgb(var(--bg-base))" }}
    >
      {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(var(--surface-border) / 0.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Theme toggle — top-right corner */}
      <button
        onClick={toggleTheme}
        aria-label="Toggle light/dark mode"
        className="fixed top-4 right-4 z-50 flex items-center justify-center size-8 rounded-full border transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2"
        style={{
          background: "rgb(var(--surface-raised))",
          borderColor: "rgb(var(--surface-border) / 0.4)",
          color: "rgb(var(--text-secondary))",
        }}
      >
        {isDark
          ? <Sun className="size-3.5" />
          : <Moon className="size-3.5" />
        }
      </button>

      <div className="flex w-full max-w-md flex-col items-center gap-2">

        {/* Brand header */}
        <div className="flex flex-col items-center gap-1.5 text-center select-none">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-purple-600 shadow-md shadow-purple-900/60">
              <GalleryVerticalEnd className="size-4 text-white" />
            </div>
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: "rgb(var(--text-primary))" }}
            >
              Byte<span style={{ color: "rgb(var(--brand-400))" }}>on</span>
            </span>
          </div>
          <span
            className="text-xs tracking-widest uppercase font-medium"
            style={{ color: "rgb(var(--text-faint))" }}
          >
            Join the network
          </span>
        </div>

        {/* Form */}
        <div className="w-full">
          <SignupForm />
        </div>

      </div>
    </div>
  )
}