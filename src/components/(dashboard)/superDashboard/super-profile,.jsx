"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/(auth)/authContext"
import { Button } from "@/components/ui/button"
import { Loader2, LogOut } from "lucide-react"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import SuperAdminProfileHeader from "./super-admin-profile-header"
import SuperAdminAboutSection  from "./super-admin-about"
import SuperAdminQuickStat     from "./super-admin-quick-stats"

export default function SuperProfile({ profile, session, stats }) {
  const { logout } = useAuth()
  const router = useRouter()

  const [showDialog, setShowDialog] = useState(false)
  const [loading, setLoading]       = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await logout()
      router.push("/")
    } catch (err) {
      console.error("Sign out error:", err)
      setLoading(false)
      setShowDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <SuperAdminProfileHeader profile={profile} session={session} />

      <div className="w-full">
        <SuperAdminAboutSection profile={profile} session={session} />
      </div>
    </div>
  )
}