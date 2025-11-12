"use client";

import { motion, AnimatePresence } from "framer-motion";
import React from "react";

/**
 * Simple fade-in/fade-out intro scene for each chapter. 
 * Props:
 * - visible: whether intro is shown
 * - title: text for chapter title (e.g. "Chapter 2: Building the Team")
 * - onFinish: callback when intro completes
*/

export default function ChapterIntro({ visible, title, onFinish }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="chapter-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          onAnimationComplete={() => {
            // Wait a short moment before finishing
            setTimeout(() => {
              if (onFinish) onFinish();
            }, 1000);
          }}
          className="fixed inset-0 flex flex-col items-center justify-center bg-black z-[100]"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-fuchsia-400 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            {title}
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
