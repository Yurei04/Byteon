import NavBar from "@/components/navbar";
import AboutSection from "@/pages/about-page/about-page";
import Home from "@/pages/home-page/home";

export default function Homepage () {
    return (
        <div className="flex flex-col items-center justify-center overflow-x-hidden">
            <Home />
            <AboutSection />
        </div>
    )
}