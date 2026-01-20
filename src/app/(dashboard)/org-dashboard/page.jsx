import RequireAuth from "@/components/(auth)/requireAuth";
import AdminDashboard from "@/components/(dashboard)/admin-dashboard";
import UserDashboard from "@/components/(dashboard)/user-dashboard";

export default function AdminDashboardMain () {
    return (
        <div className="w-full min-h-screen">
            <RequireAuth>
                <AdminDashboard />
            </RequireAuth>
            
        </div>
    )
}