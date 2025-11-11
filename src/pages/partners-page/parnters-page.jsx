"use client"
import Threads from "@/components/Threads"
import { PartnersCard } from "../../components/partners/partners-card"

const fakeData = [
    {
        name: "Byteon",
        image: "/images/kaede.jpg",
        location: "Manila, Philippines",
        des: "A tech community empowering student developers.",
        websiteLink: "https://byteon.org",
        tags: ["education", "tech"]
    },
    {
        name: "Byteon",
        image: "/images/kaede.jpg",
        location: "Manila, Philippines",
        des: "A tech community empowering student developers.",
        websiteLink: "https://byteon.org",
        tags: ["education", "tech"]
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
        
            {fakeData.map((data, idx) => (
                <PartnersCard key={idx} {...data} />
            ))}
        </div>
    )
}