import ClientFooterLoader from "@/components/client-footer-loader";
import DashboardCenter from "@/pages/announce-control-page/org-dashboard";

export default function Announement () {
    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <DashboardCenter />
            <ClientFooterLoader />
        </div>
    )
}