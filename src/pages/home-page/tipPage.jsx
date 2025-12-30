"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Lightbulb, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TipPage() {
    const tips = [
        {
            author: "Rishul Chanana",
            title: "Founder of Maximally",
            tip: "Joining a hackathon isn't about being perfect — it's about showing up to learn, mess around, and build something imperfect in a space that should feel like a playground, not a performance.",
            color: "from-fuchsia-500 to-purple-500"
        },
        {
            author: "Ryan Tran",
            title: "3x Hackathon Winner",
            tip: "Keep building every day even if you're unsure where to start, and don't forget to have fun instead of getting lost in the pressure to win.",
            color: "from-purple-500 to-pink-500"
        },
        {
            author: "Arsh Gibran Tariq",
            title: "7x Hackathon Winner",
            tip: "Treat hackathons as a chance to think for yourself, start small, have fun, and build something you'd actually use—because the real win is learning, not perfection.",
            color: "from-pink-500 to-rose-500"
        },
        {
            author: "Juan Miguel Recondo",
            title: "Student",
            tip: "Start joining hackathons early—even if you feel unready—because the right tools and a willingness to learn on the go matter far more than perfect skills.",
            color: "from-violet-500 to-fuchsia-500"
        }
    ];

    const [currentTip, setCurrentTip] = useState(0);

    const nextTip = () => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
    };

    const prevTip = () => {
        setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
    };

    return (
        <section className="relative min-h-screen w-full bg-gradient-to-br from-black via-purple-950/30 to-black py-16 px-6 sm:px-10 lg:px-16 flex items-center justify-center overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-20 left-10 w-72 h-72 bg-fuchsia-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                />
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
                            Tips & Wisdom
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base text-fuchsia-300/70 max-w-xl mx-auto">
                        Learn from experienced hackers and innovators
                    </p>
                </motion.div>

                {/* Main Tip Card */}
                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTip}
                            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
                            transition={{ duration: 0.5 }}
                            className="relative bg-gradient-to-br from-fuchsia-950/40 via-purple-950/40 to-pink-950/40 
                                       border border-fuchsia-500/30 rounded-2xl p-6 sm:p-8
                                       backdrop-blur-md shadow-[0_0_30px_rgba(217,70,239,0.2)]
                                       hover:shadow-[0_0_40px_rgba(217,70,239,0.3)] transition-shadow duration-500"
                        >
                            {/* Quote Icon */}
                            <Quote className="absolute top-4 left-4 w-8 h-8 text-fuchsia-500/20" />
                            
                            {/* Tip Content */}
                            <div className="relative z-10 space-y-6">
                                <p className="text-base sm:text-lg text-fuchsia-100 leading-relaxed">
                                    "{tips[currentTip].tip}"
                                </p>

                                {/* Author Info */}
                                <div className="flex items-center gap-3 pt-4 border-t border-fuchsia-500/20">
                                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tips[currentTip].color} 
                                                    flex items-center justify-center text-lg font-bold text-white shadow-lg`}>
                                        {tips[currentTip].author.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-fuchsia-200">
                                            {tips[currentTip].author}
                                        </h3>
                                        <p className="text-xs text-fuchsia-400/70">
                                            {tips[currentTip].title}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative gradient overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${tips[currentTip].color} 
                                           opacity-5 rounded-3xl pointer-events-none`} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between mt-6 gap-4">
                        <Button
                            onClick={prevTip}
                            variant="outline"
                            size="default"
                            className="border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-500/20 
                                     hover:border-fuchsia-400 transition-all duration-300 group"
                        >
                            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                            Previous
                        </Button>

                        {/* Progress Indicator */}
                        <div className="flex items-center gap-2">
                            {tips.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTip(index)}
                                    className={`transition-all duration-300 rounded-full ${
                                        index === currentTip
                                            ? "w-8 h-2 bg-gradient-to-r from-fuchsia-500 to-purple-500"
                                            : "w-2 h-2 bg-fuchsia-600/30 hover:bg-fuchsia-500/50 hover:scale-125"
                                    }`}
                                    aria-label={`Go to tip ${index + 1}`}
                                />
                            ))}
                        </div>

                        <Button
                            onClick={nextTip}
                            variant="outline"
                            size="default"
                            className="border-fuchsia-500/50 text-fuchsia-300 hover:bg-fuchsia-500/20 
                                     hover:border-fuchsia-400 transition-all duration-300 group"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    {/* Counter */}
                    <p className="text-center mt-4 text-fuchsia-400/50 text-xs">
                        {currentTip + 1} of {tips.length}
                    </p>
                </div>
            </div>
        </section>
    );
}