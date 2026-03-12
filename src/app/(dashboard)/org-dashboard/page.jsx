"use client"

import { withAuth } from "@/components/(auth)/withAuth" 
import OrgDashboardPage from "@/pages/org-dashboard/org-dashboard-page";

function AdminDashboardMain () {
    return (
        <div className="w-full min-h-screen">
            <OrgDashboardPage />
        </div>
    )
}

export default withAuth(AdminDashboardMain, ["org"])