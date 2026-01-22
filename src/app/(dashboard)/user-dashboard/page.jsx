import RequireAuth from "@/components/(auth)/requireAuth";
import UserDashboardPage from "@/pages/user-dashboard/user-dashboard-page";

export default function Dashboard () {
    return (
        <div className="w-full min-h-screen">
            <RequireAuth>
                <UserDashboardPage />
            </RequireAuth>
        </div>
    )
}