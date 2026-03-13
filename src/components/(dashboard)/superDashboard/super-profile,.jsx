"use client"

import SuperAdminProfileHeader from "./super-admin-profile-header"
import SuperAdminAboutSection from "./super-admin-about"
import SuperAdminQuickStat from "./super-admin-quick-stats"

export default function SuperProfile({ profile, session, stats }) {
  return (
    <div className="space-y-6">
      <SuperAdminProfileHeader profile={profile} session={session} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SuperAdminAboutSection profile={profile} session={session} />
        <SuperAdminQuickStat stats={stats} />
      </div>
    </div>
  )
}