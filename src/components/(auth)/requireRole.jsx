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
    if (timerRef.current) clearTimeout(timerRef.current)

    // Still loading auth — wait
    if (loading) return

    // role is null means DB query still in flight — wait
    if (role === null && isLoggedIn) return

    if (!isLoggedIn) { router.push("/login"); return }

    if (!allowed) {
      // 1500ms grace period — gives authContext enough time to finish
      // a fresh DB query before treating a null/stale role as final
      timerRef.current = setTimeout(() => {
        router.push(redirectTo)
      }, 1500)
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [loading, isLoggedIn, allowed, role, router, redirectTo])

  // Don't render children while loading or role hasn't resolved yet
  if (loading || (isLoggedIn && role === null) || !allowed) return null

  return <>{children}</>
}