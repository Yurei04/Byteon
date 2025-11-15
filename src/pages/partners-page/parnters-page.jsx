"use client"
import Threads from "@/components/Threads"
import { PartnersCard } from "../../components/partners/partners-card"

const data = [
    {
        name: "Hack United",
        image: "/images/hackunited2.png",
        location: "USA",
        des: "Empowering the Next Generation of Tech Innovators",
        websiteLink: "https://www.hackunited.org/",
        tags: ["tech", "innovation"]
    },
    {
        name: "Maximally",
        image: "/images/Maximallyc.png",
        location: "India",
        des: " global innovation league that hosts high-stakes hackathons for ambitious builders. Built by hackers, for hackers.",
        websiteLink: "https://maximally.in/",
        tags: ["Innovation", "Hackathon"]
    },
    {
        name: "CS Base",
        image: "/images/CSBase_logo.png",
        location: "US",
        des: "CS Base provides a global ecosystem that enables elementary to high school students to specialize in modern computer science.",
        websiteLink: "https://www.csbase.org/",
        tags: ["Tech", "innovation"]
    },
    {
        name: "Medihacks",
        image: "/images/meddi.png",
        location: "US",
        des: "Fostering innovation today for a healthier tommorow.",
        websiteLink: "https://medihacks.org/",
        tags: ["Health", "Tech"]
    },
]

export default function PartnersPage () {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center gap-8 p-8">
            <div className="pointer-events-none fixed inset-0 -z-20">
                <Threads
                amplitude={2}
                distance={0.7}
                enableMouseInteraction={false}
                />
            </div>

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
        
            <div className="flex flex-col gap-2 justify-evenly w-[80%] m-2">
                {data.map((data, idx) => (
                    <PartnersCard key={idx} {...data} />
                ))}
            </div>
        </div>
    )
}