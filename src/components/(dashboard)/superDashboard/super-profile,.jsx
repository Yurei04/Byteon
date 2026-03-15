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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuperAdminAboutSection profile={profile} session={session} />
        <SuperAdminQuickStat stats={stats} />
      </div>

      {/* Sign Out */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowDialog(true)}
          variant="outline"
          className="border-red-500/40 text-red-300 hover:bg-red-500/20 hover:border-red-400 hover:text-red-200 transition-all gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent className="bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-200 flex items-center gap-2">
              <LogOut className="w-5 h-5" />Sign Out
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to sign out of the Super Admin panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={loading}
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              disabled={loading}
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white">
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Signing out...</>
                : <><LogOut className="w-4 h-4 mr-2" />Sign Out</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}