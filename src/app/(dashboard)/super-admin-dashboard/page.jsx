"use client"

import { useAuth } from "@/components/(auth)/authContext";
import { withAuth } from "@/components/(auth)/withAuth";
import SuperAdminDashboardPage from "@/components/(dashboard)/superDashboard/super-admin-dashboard-page";

function SuperAdminDashboard() {
    return (
        <div className="w-full min-h-screen">
            <SuperAdminDashboardPage />
        </div>
    )
}

export default withAuth(SuperAdminDashboard, ["admin"])