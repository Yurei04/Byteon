import RequireAuth from "@/components/(auth)/requireAuth";
import OrgDashboardPage from "@/components/(dashboard)/orgDashboard/org-dashboard";

export default function AdminDashboardMain () {
    return (
        <div className="w-full min-h-screen">

                <OrgDashboardPage />

        </div>
    )
}