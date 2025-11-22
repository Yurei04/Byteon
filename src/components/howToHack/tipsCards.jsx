"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function TipsCard({ author, title, tip }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card
                className="
                bg-gradient-to-br from-black via-[#0b0014] to-[#1a001f]
                border border-fuchsia-700/40 
                shadow-[0_0_25px_rgba(255,0,255,0.25)]
                rounded-3xl p-5 w-[320px]
                backdrop-blur-xl
                "
            >
                <CardContent className="space-y-4">

                    {/* Title */}
                    <h2 className="text-xl font-bold text-fuchsia-300 tracking-wide">
                        {title}
                    </h2>

                    {/* Tip in quotes + italic */}
                    <p className="text-sm italic text-fuchsia-100/90 leading-relaxed">
                        “{tip}”
                    </p>

                    {/* Author with SVG */}
                    <div className="flex items-center gap-2 pt-2">
                        <User className="w-5 h-5 text-purple-300" />
                        <span className="text-sm text-purple-200 font-medium">
                            — {author}
                        </span>
                    </div>

                </CardContent>
            </Card>
        </motion.div>
    );
}
