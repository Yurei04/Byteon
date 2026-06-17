"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/(auth)/authContext"

export default function ProtectedRoute({
  children,
  allowUser = false,
  allowOrg = false,
  allowSuperAdmin = false,
}) {
  const { loading, isLoggedIn, isUser, isOrgAdmin, isSuperAdmin } = useAuth()
  const router = useRouter()

  const allowed =
    (allowUser && isUser) ||
    (allowOrg && isOrgAdmin) ||
    (allowSuperAdmin && isSuperAdmin)

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) { router.replace("/log-in"); return }
    if (!allowed) router.replace("/")
  }, [loading, isLoggedIn, allowed, router])

  // Don't render or redirect until auth is fully resolved
  if (loading) return null
  if (!isLoggedIn) return null
  if (!allowed) return null

  return children
}