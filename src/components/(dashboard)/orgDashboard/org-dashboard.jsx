"use client"
import { ReturnButton } from "@/components/return"
import OrganizationProfile from './org-profile'
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
/**
 * Organization Dashboard Page
 * Displays the organization's profile, achievements, and brand settings
 */
export default function OrgDashboardPage() {
  const router = useRouter()

  const handleProfileSuccess = () => {
    console.log('Organization profile updated successfully!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex justify-between max-w-7xl mx-auto mb-6 p-2"
      >
        <div className="p-2">
          <ReturnButton />
        </div>

        <div className="w-full bg-gradient-to-r from-fuchsia-900/40 to-purple-900/40 backdrop-blur-lg border border-fuchsia-500/30 py-3 px-3 rounded-lg shadow-lg shadow-fuchsia-500/10">
          <p className="text-fuchsia-200 text-sm text-center flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            ⚠️ This Page is currently in Beta Testing 
          </p>
        </div>
      </motion.div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Organization Profile Component */}
        <OrganizationProfile onSuccess={handleProfileSuccess} />
      </div>
    </div>
  )
}