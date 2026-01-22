"use client"

import OrganizationProfile from './org-profile'
import { useRouter } from 'next/navigation'

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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Organization Dashboard
          </h1>
          <p className="text-white/60">
            Manage your organization profile, achievements, and brand identity
          </p>
        </div>

        {/* Organization Profile Component */}
        <OrganizationProfile onSuccess={handleProfileSuccess} />
      </div>
    </div>
  )
}