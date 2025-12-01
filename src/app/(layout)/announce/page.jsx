import ClientFooterLoader from "@/components/client-footer-loader";
import NavBar from "@/components/navbar";
import AnnouncePage from "@/pages/announce-control-page/announce-page";

export default function Announce () {
    return (
        <div className="w-full max-h-lvh">
            <NavBar />
            <AnnouncePage />
            <ClientFooterLoader />
        </div>
    )
}