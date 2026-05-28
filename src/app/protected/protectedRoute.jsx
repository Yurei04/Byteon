// components/protected/ProtectedRoute.jsx

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
  const {
    loading,
    isLoggedIn,
    isUser,
    isOrgAdmin,
    isSuperAdmin,
  } = useAuth()

  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // not logged in
    if (!isLoggedIn) {
      router.replace("/log-in")
      return
    }

    const allowed =
      (allowUser && isUser) ||
      (allowOrg && isOrgAdmin) ||
      (allowSuperAdmin && isSuperAdmin)

    if (!allowed) {
      router.replace("/")
    }
  }, [
    loading,
    isLoggedIn,
    isUser,
    isOrgAdmin,
    isSuperAdmin,
    allowUser,
    allowOrg,
    allowSuperAdmin,
    router,
  ])

  if (loading) return null

  if (!isLoggedIn) return null

  const allowed =
    (allowUser && isUser) ||
    (allowOrg && isOrgAdmin) ||
    (allowSuperAdmin && isSuperAdmin)

  if (!allowed) return null

  return children
}