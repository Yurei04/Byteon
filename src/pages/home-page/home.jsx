"use client"
import Threads from "@/components/Threads";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home () {
    return (
        <div className="relative min-h-screen w-full flex bg-linear-to-tr from-purple-950/50 via-fuchsia-900/20 to-black/70 items-center justify-center overflow-x-hidden">
            <div className="container mx-auto px-6 sm:px-10 lg:px-16 flex flex-col-reverse lg:flex-row items-center justify-center gap-10 lg:gap-16">
                {/* Text Section */}
                <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl text-center lg:text-left"
                >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-fuchsia-400 to-purple-400">
                    Byteon
                    </span>
                </h1>

                <h2 className="mt-4 text-xl sm:text-2xl lg:text-3xl font-medium text-fuchsia-200">
                    Create It, To Win It
                </h2>

                <p className="mt-3 text-sm sm:text-base text-fuchsia-300/80">
                    Where beginners become builders — your gateway to hackathons, growth, and real-world impact.
                </p>

                <div className="mt-6 flex flex-wrap gap-4 justify-center lg:justify-start">
                    <Link href="/orgDashboard">
                        <Button
                            size="lg"
                            className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 transition-colors"
                        >
                         Partner With Us!
                        </Button>
                    </Link>
                    <Link href="/userDashboard">
                    <Button
                        variant="outline"
                        size="lg"
                        className="cursor-pointer border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-800/40 hover:text-fuchsia-100 transition-colors"
                    >
                        Join Us!
                    </Button>
                    </Link>
                </div>
                </motion.div>

                {/* Image Section */}
                <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full border-4 border-fuchsia-600 bg-[#0a0013] shadow-[0_0_25px_rgba(244,114,182,0.4)] overflow-hidden"
                >
                <Image
                    src="/images/logoByteon.png"
                    alt="Byteon Logo"
                    fill
                    className="object-cover"
                    fetchPriority="high"
                />
                </motion.div>
            </div>
        </div>
    )
}