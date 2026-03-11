"use client"

import { withAuth } from "@/components/(auth)/withAuth" 
import UserDashboardPage from "@/pages/user-dashboard/user-dashboard-page"

function Dashboard() {
  return (
    <div className="w-full min-h-screen">
      <UserDashboardPage />
    </div>
  )
}

export default withAuth(Dashboard, ["user"])