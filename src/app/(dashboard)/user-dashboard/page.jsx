"use client"

import { withAuth } from "@/components/(auth)/withAuth" 
import UserDashboardPage from "@/components/(dashboard)/userDashboard/user-dashboard-page"

function Dashboard() {
  return (
    <div className="w-full min-h-screen">
      <UserDashboardPage />
    </div>
  )
}

export default withAuth(Dashboard, ["user"])