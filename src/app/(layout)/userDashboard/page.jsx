import Footer from "@/components/footer";
import UserDashboardPage from "@/components/(dashboard)/userDashboard/user-dashboard-page";
import ClientFooterLoader from "@/components/client-footer-loader";

export default function userDashboard () {
    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <UserDashboardPage />
            <ClientFooterLoader />
        </div>
    )
}