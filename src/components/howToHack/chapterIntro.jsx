"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect, useRef } from "react";

/**
 * Simple fade-in/fade-out intro scene for each chapter. 
 * Props:
 * - visible: whether intro is shown
 * - title: text for chapter title (e.g. "Chapter 2: Building the Team")
 * - onStart: callback when player presses Start (begin chapter)
 * - onStay: callback when player presses Stay (return to main menu)
 *
 * IMPORTANT: This intro will not auto-dismiss. It will only disappear after
 * the player explicitly presses either Start or Stay.
*/

export default function ChapterIntro({ visible, title, onStart, onStay, onNextChapter }) {
  const [hasStarted, setHasStarted] = useState(false);

  const handleStart = () => {
    if (onStart) {
      onStart();
    }
    setHasStarted(true); 
  };

  const handleNext = () => {
    console.log("[Debug] Manually triggering next chapter...");
    onNextChapter?.();
  };

  const buttonHandler = hasStarted ? handleNext : handleStart;
  const buttonText = hasStarted ? "Next Chapter" : "Start Chapter";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chapter-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[100] p-6"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-fuchsia-400 drop-shadow-lg mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            {title}
          </motion.h1>

          <motion.p
            className="max-w-2xl text-center text-sm text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Press <strong>Start Chapter</strong> to continue into this chapter, or press <strong>Stay</strong> to return to the main menu.
          </motion.p>

          <div className="flex gap-4">
            <button
              onClick={() => {
                if (onStay) onStay();
              }}
              className="px-6 py-3 rounded-md bg-white/10 hover:bg-white/20"
            >
              Stay (Back to Menu)
            </button>

            <button
              onClick={buttonHandler}
              className="px-6 py-3 rounded-md bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
            >
              Start Chapter
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
