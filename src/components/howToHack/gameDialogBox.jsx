// src/components/howToHack/gameDialogBox.jsx
"use client"
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function GameDialogBox ({
    text = "",
    character = "Narrator",
    chapter = "",
    onNext = () => {},
}) {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

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
            setDisplayedText(text);
            setIsTyping(false);
        } else {
            onNext();
        }
    };

    return (
        <div className="w-full h-full max-h-1/3 border border-white bg-black/60 p-4 flex flex-col justify-between rounded-md">
            <div>
                <div className="text-xs text-gray-400 mb-1">
                    {chapter} — {character}
                </div>
                <div
                    className="text-lg font-sans leading-relaxed text-white whitespace-pre-wrap cursor-pointer"
                    onClick={handleClick}
                >
                    {displayedText}
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
