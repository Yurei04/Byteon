"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/*
    Game Intro Scene
    - Plays once at startup
    - Typewriter effect for each line
    - Fades out after complete
*/

export default function GameIntroScene({ onFinish = () => {} }) {
    // List of intro lines (you can customize freely)
    const introLines = [
        "Initializing Byteon System...",
        "Loading neural directives...",
        "Decrypting mission protocols...",
        "Welcome, Operator.",
    ];

    const [currentLine, setCurrentLine] = useState(0);
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const [showIntro, setShowIntro] = useState(true);

    // Typewriter logic for each line
    useEffect(() => {
        if (currentLine >= introLines.length) {
            // all lines done → fade out
            setTimeout(() => {
                setShowIntro(false);
                onFinish(); // tell parent to start main game
            }, 1200);
            return;
        }

        const line = introLines[currentLine];
        let i = 0;
        setDisplayedText("");
        setIsTyping(true);

        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + line.charAt(i));
            i++;
            if (i >= line.length) {
                clearInterval(interval);
                setIsTyping(false);
                // move to next line after short pause
                setTimeout(() => setCurrentLine((prev) => prev + 1), 1000);
            }
        }, 50); // typing speed (ms per char)

        return () => clearInterval(interval);
    }, [currentLine]);

    return (
        <AnimatePresence>
            {showIntro && (
                <motion.div
                    className="fixed inset-0 bg-black flex items-center justify-center text-purple-300 text-2xl font-mono"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="text-center">
                        <div className="mb-4">{displayedText}</div>
                        {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
