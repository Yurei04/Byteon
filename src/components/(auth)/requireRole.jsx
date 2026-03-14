// components/(auth)/requireRole.jsx
"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/(auth)/authContext"

export default function RequireRole({ children, roles = [], redirectTo = "/unauthorized" }) {
  const { role, loading, isLoggedIn } = useAuth()
  const router   = useRouter()
  const timerRef = useRef(null)

  const allowed = roles.length === 0 || roles.includes(role)

  useEffect(() => {
    // Cancel any pending redirect when role changes
    if (timerRef.current) clearTimeout(timerRef.current)

    if (loading) return
    if (!isLoggedIn) { router.push("/login"); return }

    if (!allowed) {
      // 500ms grace period — lets authContext finish the fresh DB query
      // before treating a stale cached role as the final answer
      timerRef.current = setTimeout(() => {
        router.push(redirectTo)
      }, 500)
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [loading, isLoggedIn, allowed, router, redirectTo])

  if (loading || !allowed) return null

  return <>{children}</>
}