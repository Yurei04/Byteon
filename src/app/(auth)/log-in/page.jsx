"use client"

import { LoginForm } from "@/components/(auth)/login/loginForm"
import { GalleryVerticalEnd } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        {/* Dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgb(var(--surface-border) / 0.3) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      
      <div className="flex w-full max-w-md flex-col items-center gap-2">

        {/* Brand header */}
        <div className="flex flex-col items-center gap-1.5 text-center select-none">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-purple-600 shadow-md shadow-purple-900/60">
              <GalleryVerticalEnd className="size-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Byte<span className="text-purple-400">on</span>
            </span>
          </div>
          <span className="text-xs text-purple-300/50 tracking-widest uppercase font-medium">
            Welcome back
          </span>
        </div>

        {/* Form */}
        <div className="w-full">
          <LoginForm />
        </div>

      </div>
    </div>
  )
}