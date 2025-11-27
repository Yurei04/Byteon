import Footer from "@/components/footer";
import UserDashboardPage from "@/pages/user-dashboard/user-dashboard-page";
import dynamic from 'next/dynamic';

export default function userDashboard () {
    const Footer = dynamic(() => import('../components/Footer'), {
        ssr: false,
    });
    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <UserDashboardPage />
            <Footer />
        </div>
    )
}