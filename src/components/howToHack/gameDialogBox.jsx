// src/components/howToHack/gameDialogBox.jsx
"use client"
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";

export default function GameDialogBox ({
    onNextChapter,
    text = "",
    character = "Narrator",
    chapter = "",
    onNext = () => {},
}) {
    const [displayedText, setDisplayedText] = useState("");
    // isTyping is true while the text is animating
    const [isTyping, setIsTyping] = useState(false); 
    // isFinished is true when all characters are displayed (animation stopped)
    const isFinished = displayedText.length === text.length && !isTyping; 
    
    useEffect(() => {
        if (!text) {
            setDisplayedText("");
            setIsTyping(false);
            return;
        }

        setDisplayedText("");
        setIsTyping(true);

        let i = 0;
        const speed = 25;
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text]);

    const handleClick = () => {
        if (isTyping) {
            // Skip typing animation
            setDisplayedText(text);
            setIsTyping(false);
        } else {
            // Dialogue line is finished, move to the next line or trigger chapter end
            onNext(); 
        }
    };

    const buttonText = isTyping ? "Skip" : (isFinished ? "Next" : "Next");

    return (
        <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, duration: 0.5 }}
            className="w-full max-w-4xl max-h-1/3 border-2 border-fuchsia-500 bg-black/70 backdrop-blur-sm p-6 flex flex-col justify-between rounded-xl shadow-2xl"
        >
            {onNextChapter ? (
                <div>
                    <button
                    onClick={() => {
                        console.log("[Debug] Manually triggering next chapter...");
                        onNextChapter?.();
                    }}
                    className="mt-4 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg"
                    >
                    Next Chapter
                    </button>
                </div>
            ) : (
                <>
                <div className="flex flex-col">
                    <div className="text-sm font-mono text-fuchsia-300 mb-2">
                        {chapter} — <span className="text-white font-bold">{character}</span>
                    </div>
                    <div
                        className="text-md md:text-sm font-sans leading-relaxed text-gray-100 whitespace-pre-wrap cursor-pointer min-h-[100px]"
                        onClick={handleClick}
                    >
                        {displayedText}
                        {isTyping && <span className="animate-pulse text-fuchsia-400">|</span>}
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleClick}
                        // Replaced external Button with standard HTML button and Tailwind classes
                        className="px-6 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold transition duration-200 shadow-md shadow-fuchsia-900"
                    >
                        {buttonText}
                    </button>
                </div>
            </>
                
            )}
        </motion.div>
    );
}
