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
            author: "Rishul Chanana",
            title: "Founder of Maximally",
            tip: "Joining a hackathon isn’t about being perfect — it’s about showing up to learn, mess around, and build something imperfect in a space that should feel like a playground, not a performance."
        },
        {
            author: "Ryan Tran",
            title: "3x Hackathon Winner",
            tip: "Keep building every day even if you're unsure where to start, and don’t forget to have fun instead of getting lost in the pressure to win."
        },
        {
            author: "Arsh Gibran Tariq",
            title: "7x Hackathon Winner",
            tip: "Treat hackathons as a chance to think for yourself, start small, have fun, and build something you’d actually use—because the real win is learning, not perfection."
        },
        {
            author: "Juan Miguel Recondo",
            title: "Student",
            tip: "Start joining hackathons early—even if you feel unready—because the right tools and a willingness to learn on the go matter far more than perfect skills."
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
