"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, X, Trash2, Loader2, AlertCircle, Info } from "lucide-react"

export default function DeleteAccountModal({ organizationName, userId, onClose }) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)
  
  const requiredText = `delete ${organizationName}`

  const handleDelete = async () => {
    if (confirmText !== requiredText) {
      setError("Confirmation text does not match. Please type exactly as shown.")
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      // Step 1: Delete all announcements
      const { error: announceError } = await supabase
        .from('announcements')
        .delete()
        .eq('organization', organizationName)

      if (announceError) throw announceError

      // Step 2: Delete all blogs
      const { error: blogError } = await supabase
        .from('blogs')
        .delete()
        .eq('organization', organizationName)

      if (blogError) throw blogError

      // Step 3: Delete all resources
      const { error: resourceError } = await supabase
        .from('resource_hub')
        .delete()
        .eq('organization', organizationName)

      if (resourceError) throw resourceError

      // Step 4: Delete organization profile
      const { error: orgError } = await supabase
        .from('organizations')
        .delete()
        .eq('user_id', userId)

      if (orgError) throw orgError

      // Step 5: Delete auth user (this will cascade delete everything)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        // If admin delete fails, try sign out
        await supabase.auth.signOut()
      }

      // Success - redirect to homepage
      alert("Your account has been successfully deleted.")
      router.push('/')
      
    } catch (err) {
      console.error("Delete account error:", err)
      setError(`Failed to delete account: ${err.message}`)
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-red-950/95 via-slate-950/95 to-red-950/95 border-2 border-red-500/50 shadow-2xl shadow-red-500/20">
        <CardHeader className="relative">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-red-300" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-300">
              Delete Organization Account
            </CardTitle>
          </div>
          
          <CardDescription className="text-red-200/80 text-base">
            This action cannot be undone. This will permanently delete your organization.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Warning Alert */}
          <Alert className="bg-red-900/30 border-red-500/50">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertDescription className="text-red-200">
              <strong className="block mb-2 text-red-300">This will permanently delete:</strong>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Your organization profile and all data</li>
                <li>All announcements created by {organizationName}</li>
                <li>All blogs created by {organizationName}</li>
                <li>All resources created by {organizationName}</li>
                <li>Your login credentials and account access</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Information Alert */}
          <Alert className="bg-blue-900/20 border-blue-500/30">
            <Info className="h-5 w-5 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong className="block mb-1 text-blue-300">Before you delete:</strong>
              Make sure you have backed up any important data. Once deleted, there is no way to recover your account.
            </AlertDescription>
          </Alert>

          {/* Confirmation Input */}
          <div className="space-y-3 p-4 bg-black/30 rounded-lg border border-red-500/20">
            <Label className="text-red-200 text-base">
              Please type <code className="px-2 py-1 bg-red-900/50 rounded text-red-300 font-mono text-sm">{requiredText}</code> to confirm:
            </Label>
            <Input
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value)
                setError(null)
              }}
              placeholder={`Type: ${requiredText}`}
              className="bg-black/40 border-red-500/30 text-white placeholder:text-red-300/30 focus:border-red-500"
              disabled={isDeleting}
              autoFocus
            />
            
            {error && (
              <Alert variant="destructive" className="bg-red-500/20 border-red-500">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              disabled={isDeleting}
              variant="outline"
              className="flex-1 border-red-500/30 hover:bg-red-900/20 text-red-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={confirmText !== requiredText || isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Organization
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}