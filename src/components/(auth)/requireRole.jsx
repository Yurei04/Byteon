// components/(auth)/requireRole.jsx
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/(auth)/authContext"   // ← same path

export default function RequireRole({ children, roles = [], redirectTo = "/unauthorized" }) {
  const { role, loading, isLoggedIn } = useAuth()
  const router = useRouter()

  const allowed = roles.length === 0 || roles.includes(role)

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) { router.push("/login"); return }
    if (!allowed)    router.push(redirectTo)
  }, [loading, isLoggedIn, allowed, router, redirectTo])

  if (loading || !allowed) return null

  return <>{children}</>
}