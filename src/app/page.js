import Image from "next/image";
import Homepage from "./(layout)/homepage/page";
import HowToHackathon from "./(layout)/how-to-hackathon/page";

export default function Home() {
  return (
    <div className="w-full min-h-screen overflow-x-hidden">
      <HowToHackathon />
    </div>
  );
}
