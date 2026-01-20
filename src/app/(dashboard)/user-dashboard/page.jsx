import RequireAuth from "@/components/(auth)/requireAuth";
import UserDashboard from "@/components/(dashboard)/user-dashboard";

export default function Dashboard () {
    return (
        <div className="w-full min-h-screen">
            <RequireAuth>
                <UserDashboard />
            </RequireAuth>
        </div>
    )
}