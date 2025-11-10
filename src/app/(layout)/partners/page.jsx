import Footer from "@/components/footer";
import NavBar from "@/components/navbar";
import PartnersPage from "@/pages/partners-page/parnters-page";

export default function Partners () {
    return (
        <div className="w-full min-h-screen">
            <NavBar />
            <PartnersPage />
            <Footer />
        </div>
    )
}