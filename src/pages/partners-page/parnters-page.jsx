"use client"
import Threads from "@/components/Threads"
import { PartnersCard } from "../../components/partners/partners-card"

const data = [
    {
        name: "Hack United",
        image: "/images/HackUnited2.png",
        location: "USA",
        des: "Empowering the Next Generation of Tech Innovators",
        websiteLink: "https://www.hackunited.org/",
        tags: ["tech", "innovation"],
        colorTheme: "purple"
    },
    {
        name: "Maximally",
        image: "/images/Maximallyc.png",
        location: "India",
        des: "A global innovation league that hosts high-stakes hackathons for ambitious builders. Built by hackers, for hackers.",
        websiteLink: "https://maximally.in/",
        tags: ["Innovation", "Hackathon"],
        colorTheme: "red"
    },
    {
        name: "CS Base",
        image: "/images/CSBase_logo.png",
        location: "US",
        des: "CS Base provides a global ecosystem that enables elementary to high school students to specialize in modern computer science.",
        websiteLink: "https://www.csbase.org/",
        tags: ["Tech", "innovation"],
        colorTheme: "blue"
    },
    {
        name: "Medihacks",
        image: "/images/meddi.png",
        location: "US",
        des: "Fostering innovation today for a healthier tomorrow.",
        websiteLink: "https://medihacks.org/",
        tags: ["Health", "Tech"],
        colorTheme: "pink"
    },
]

export default function PartnersPage() {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-8 p-8">
            <div className="text-center mt-24">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
                        Our Partners
                    </span>
                </h1>

                <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
                    Empowering creators, coders, and innovators through community,
                    learning, and meaningful opportunities.
                </p>
            </div>
        
            <div className="flex flex-col gap-6 justify-evenly w-[80%] m-2">
                {data.map((partner, idx) => (
                    <PartnersCard key={idx} {...partner} />
                ))}
            </div>
        </div>
    )
}