import ClientFooterLoader from "@/components/client-footer-loader";
import NavBar from "@/components/navbar";
import ResourceHubPage from "@/pages/resource-hub-page/resource-hub-page";

export default function ResourceHub () {
    return (
        <div className="w-full min-h-screen overflow-x-hidden">
            <NavBar />
            <ResourceHubPage />
            <ClientFooterLoader />
        </div>
    )
}