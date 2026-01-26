import RequireAuth from "@/components/(auth)/requireAuth";
import OrgDashboardPage from "@/pages/org-dashboard-page/org-dashboard-page";

export default function AdminDashboardMain () {
    return (
        <div className="w-full min-h-screen">
            <RequireAuth>
                <OrgDashboardPage />
            </RequireAuth>
        </div>
    )
}