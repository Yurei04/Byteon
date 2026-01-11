"use client"

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

export default function GameDialogBox({
  chapterGameIndex,
  onNextChapter,
  text = "",
  character = "Narrator",
  chapter = "",
  onNext = () => {},
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef(null);

  // Reset and play typewriter sound once when text changes
  useEffect(() => {
    if (!text) {
      setDisplayedText("");
      setCurrentIndex(0);
      setIsTyping(false);
      return;
    }

    setDisplayedText("");
    setCurrentIndex(0);
    setIsTyping(true);

    // Play typewriter sound once for this dialogue
    if (typeof window !== 'undefined' && window.audioManager) {
      window.audioManager.playTypewriterOnce();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Stop typewriter sound when dialogue changes
      if (typeof window !== 'undefined' && window.audioManager) {
        window.audioManager.stopTypewriter();
      }
    };
  }, [text]);

  // Handle typing animation
  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      if (currentIndex >= text.length && isTyping) {
        setIsTyping(false);
        // Stop typewriter sound when typing finishes
        if (typeof window !== 'undefined' && window.audioManager) {
          window.audioManager.stopTypewriter();
        }
      }
      return;
    }

    const speed = 25;
    timeoutRef.current = setTimeout(() => {
      setDisplayedText(text.substring(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentIndex, isTyping, text]);

  const handleClick = () => {
    // Play click sound
    if (typeof window !== 'undefined' && window.audioManager) {
      window.audioManager.playClick();
    }

    if (isTyping) {
      // Skip typing animation
      setDisplayedText(text);
      setCurrentIndex(text.length);
      setIsTyping(false);
      
      // Stop typewriter sound immediately when skipping
      if (typeof window !== 'undefined' && window.audioManager) {
        window.audioManager.stopTypewriter();
      }
    } else {
      // Dialogue line is finished, move to next
      onNext();
    }
  };

  const buttonText = isTyping ? "Skip" : "Next";

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, duration: 0.5 }}
      className="w-full max-w-4xl max-h-1/3 border-2 border-fuchsia-500 bg-black/70 backdrop-blur-sm p-6 flex flex-col justify-between rounded-xl shadow-2xl"
    >
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

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleClick}
          className="px-6 py-2 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold transition duration-200 shadow-md shadow-fuchsia-900 cursor-pointer"
        >
          {buttonText}
        </button>
        
        {onNextChapter && (
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.audioManager) {
                window.audioManager.playClick();
              }
              console.log("[Debug] Manually triggering next chapter...");
              onNextChapter?.();
            }}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer text-xs"
          >
            [DEBUG] Next Chapter
          </button>
        )}
      </div>
    </motion.div>
  );
}