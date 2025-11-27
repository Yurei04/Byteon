import Image from "next/image";
import Homepage from "./(layout)/homepage/page";
import HowToHackathon from "./(layout)/how-to-hackathon/page";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import AboutSection from "@/pages/about-page/about-page";
import AnnounceSection from "@/pages/announce-control-page/announce-section";
import ClientFooterLoader from "@/components/client-footer-loader";

export default function Home() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <NavBar />
      <Homepage />
      <AboutSection />
      <AnnounceSection />
      <ClientFooterLoader />
    </div>
  );
}
