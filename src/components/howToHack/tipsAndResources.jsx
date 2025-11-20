"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

export default function TipsAndResources (

) {
    return (
        <motion.div
            className="bg-black overflow-hidden flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Title */}
            <motion.h1
                className="relative z-10 text-md mb-4 font-bold text-white tracking-widest drop-shadow-lg"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 1 }}
            >
                Tips and Tricks
            </motion.h1>

        </motion.div>
    )
}