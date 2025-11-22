"use client";

import React from "react";
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";

import TipsCard from "./tipsCards";

export default function TipsAndResources() {
    const tips = [
        {
            author: "Sumire",
            title: "Stay Calm",
            tip: "Always take a deep breath before responding to intense situations."
        },
        {
            author: "HexenCore",
            title: "Efficiency",
            tip: "Short, clear instructions are always more effective."
        },
        {
            author: "AI Ops",
            title: "Focus",
            tip: "Work on one task at a time to avoid being overwhelmed."
        },
        {
            author: "AI Guide",
            title: "Consistency",
            tip: "Small daily habits create long-term success."
        }
    ];

    return (
        <motion.div
            className="bg-black py-20 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Title */}
            <motion.h1
                className="text-4xl font-extrabold mb-12 
                bg-gradient-to-r from-fuchsia-400 to-purple-400 
                bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(255,0,255,0.45)]"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 1 }}
            >
                Tips & Tricks
            </motion.h1>

            {/* Carousel */}
            <Carousel
                opts={{
                    align: "center",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 3000,
                        stopOnInteraction: false,
                    }),
                ]}
                className="w-full max-w-md"
            >
                <CarouselContent>
                    {tips.map((item, index) => (
                        <CarouselItem key={index} className="flex justify-center">
                            <TipsCard
                                author={item.author}
                                title={item.title}
                                tip={item.tip}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </motion.div>
    );
}
