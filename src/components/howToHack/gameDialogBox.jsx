"use client"
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function GameDialogBox ({
    text = "",
    character = "Narrator",
    chapter = 1,
    onNext = () => {},
}) {
    const [displayedText, setDisplayedText] = useState(""); // typewriter progress
    const [isTyping, setIsTyping] = useState(false); // typing flag

    // typewriter effect logic
    useEffect(() => {
        if (!text) {
            setDisplayedText("");
            return;
        }

        setDisplayedText("");
        setIsTyping(true);

        let i = 0;
        const speed = 25; // ⚙️ typing speed (ms per character)
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

    // skip typing instantly on click 
    const handleClick = () => {
        if (isTyping) {
            // instantly reveal full text
            setDisplayedText(text);
            setIsTyping(false);
        } else {
            onNext();
        }
    };

    return (
        <div className="w-full h-full max-h-1/3 border border-white bg-black/60 p-4 flex flex-col justify-between">
            <div>
                <div className="text-xs text-gray-400 mb-1">
                    Chapter {chapter} — {character}
                </div>
                <div
                    className="text-lg font-sans leading-relaxed whitespace-pre-wrap cursor-pointer"
                    onClick={handleClick}
                >
                    {displayedText}
                    {/* blinking cursor while typing */}
                    {isTyping && <span className="animate-pulse">|</span>}
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                <Button onClick={handleClick}>
                    {isTyping ? "Skip" : "Next"}
                </Button>
            </div>
        </div>
    );
}
