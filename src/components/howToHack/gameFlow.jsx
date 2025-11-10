"use client";

import React from "react";
import { motion } from "framer-motion";

export default function GameFlow (
    currentChapter, currentScenario, currentEvent
) {
    return (
         <motion.div
            className="bg-black overflow-hidden flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
        >
            {/* Title */}
            <motion.h1
                className="relative z-10 text-xl mb-4 font-bold text-white tracking-widest drop-shadow-lg"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 1 }}
            >
                Game Flow
            </motion.h1>

            {/* Menu buttons */}
            <motion.div
                className="relative grid grid-cols-2 z-10 gap-2 space-y-4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4, duration: 1 }}
            >
                
            </motion.div>

        </motion.div>
    )
}