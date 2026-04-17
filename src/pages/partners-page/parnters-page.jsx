"use client"

import { PartnersCard } from "../../components/partners/partners-card"
import { motion } from "framer-motion"

const data = [
    {
        name: "Hack United",
        image: "/images/HackUnited2.png",
        location: "USA",
        des: "Empowering the Next Generation of Tech Innovators",
        websiteLink: "https://www.hackunited.org/",
        tags: ["Tech", "Innovation"],
        colorTheme: "purple"
    },
    {
        name: "CS Base",
        image: "/images/CSBase_logo.png",
        location: "US",
        des: "CS Base provides a global ecosystem that enables elementary to high school students to specialize in modern computer science.",
        websiteLink: "https://www.csbase.org/",
        tags: ["Tech", "Innovation"],
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
    {
        name: "KairoSync",
        image: "/images/KAIROSYNC.png",
        location: "Online",
        des: "Student Innovation & Enrichment Community.",
        websiteLink: null,
        tags: ["Innovation", "Tech"],
        colorTheme: "cyan"
    },
    {
        name: "Maximally",
        image: "/images/Maximallyc.png",
        location: "India",
        des: "A global innovation league that hosts high-stakes hackathons for ambitious builders. Built by hackers, for hackers.",
        websiteLink: null,
        tags: ["Innovation", "Hackathon"],
        colorTheme: "red"
    },
]

const containerVariants = {
    hidden: {},
    show: {
        transition: {
            staggerChildren: 0.1
        }
    }
}

export default function PartnersPage() {
    return (
        <div className="relative w-full min-h-screen bg-[#08020f] overflow-x-hidden">

            {/* Background grid */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 80% 40% at 50% -5%, rgba(217,70,239,0.18) 0%, transparent 70%),
                        linear-gradient(rgba(217,70,239,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(217,70,239,0.05) 1px, transparent 1px)
                    `,
                    backgroundSize: "auto, 40px 40px, 40px 40px"
                }}
            />

            {/* Ambient glow left */}
            <div
                className="fixed pointer-events-none z-0"
                style={{
                    width: 500, height: 500,
                    top: "5%", left: "-15%",
                    background: "radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)"
                }}
            />

            {/* Ambient glow right */}
            <div
                className="fixed pointer-events-none z-0"
                style={{
                    width: 400, height: 400,
                    bottom: "10%", right: "-12%",
                    background: "radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)"
                }}
            />

            {/* Page content */}
            <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pb-24 pt-28">

                {/* Hero */}
                <motion.div
                    className="text-center mb-16"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Eyebrow pill */}
                    <div className="inline-flex items-center gap-2 border border-fuchsia-500/25 bg-fuchsia-500/6 rounded-full px-4 py-1.5 mb-8">
                        <span
                            className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"
                            style={{ boxShadow: "0 0 6px #d946ef", animation: "pulse 2s ease-in-out infinite" }}
                        />
                        <span className="text-[11px] font-medium tracking-[0.15em] uppercase text-fuchsia-400">
                            Community Network
                        </span>
                    </div>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6"
                        style={{
                            background: "linear-gradient(135deg, #f0abfc 0%, #e879f9 40%, #f472b6 80%, #fb7185 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            fontFamily: "'Syne', sans-serif"
                        }}
                    >
                        Our Partners
                    </h1>

                    {/* Gradient divider */}
                    <div className="w-16 h-px mx-auto mb-6 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent" />

                    <p className="text-white/50 max-w-md mx-auto text-base sm:text-lg font-light leading-relaxed">
                        Empowering creators, coders, and innovators through community.
                        Explore our partners and discover new opportunities.
                    </p>
                </motion.div>

                {/* Stats row */}
                <motion.div
                    className="flex justify-center gap-10 sm:gap-16 mb-14 py-5 px-8 border border-fuchsia-500/10 bg-white/[0.02] rounded-2xl backdrop-blur-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    {[
                        { num: "5", label: "Partners" },
                        { num: "3", label: "Countries" },
                        { num: "∞", label: "Opportunities" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div
                                className="text-2xl sm:text-3xl font-bold"
                                style={{
                                    background: "linear-gradient(135deg, #e879f9, #f472b6)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}
                            >
                                {stat.num}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-white/30 mt-1 font-medium">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Cards */}
                <motion.div
                    className="flex flex-col gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                >
                    {data.map((partner, idx) => (
                        <PartnersCard key={idx} {...partner} />
                    ))}
                </motion.div>
            </div>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }
            `}</style>
        </div>
    )
}