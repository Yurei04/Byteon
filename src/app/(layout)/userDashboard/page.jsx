import Footer from "@/components/footer";
import UserDashboardPage from "@/pages/user-dashboard/user-dashboard-page";


export default function userDashboard () {
    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <UserDashboardPage />
            <Footer />
        </div>
    )
}