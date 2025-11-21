"use client";
import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

export default function EndCredits({ onComplete }) {
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      // Automatically call onComplete after credits finish
      if (onComplete) {
        onComplete();
      }
    }, 45000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const stars = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        width: Math.random() * 3 + 1,
        height: Math.random() * 3 + 1,
        background:
          i % 3 === 0 ? "#d946ef" : i % 3 === 1 ? "#a855f7" : "#ffffff",
        duration: 2 + Math.random() * 3,
        delay: Math.random() * 2,
      })),
    []
  );

  const credits = [
    { type: "space" },
    { type: "space" },
    { type: "title", text: "Thank You For Playing" },
    { type: "space" },
    { type: "space" },

    { type: "section", text: "Development Team" },
    { type: "credit", role: "Developer & UI/UX design", name: "James Yuri Avila" },
    { type: "credit", role: "Story & Script writer", name: "Carl Jacob Chua" },
    { type: "credit", role: "Character Design & Audio", name: "Gunther Kaede Pineda" },

    { type: "space" },

    { type: "section", text: "Special Thanks" },
    { type: "name", text: "Our Amazing Hackathon Participants" },
    { type: "name", text: "The Open Source Community" },
    { type: "name", text: "All Playtesters and Beta Users" },
    { type: "space" },

    { type: "section", text: "Partners & Resources" },
    { type: "credit", role: "Partner", name: "Hack United" },
    { type: "credit", role: "Partner", name: "Maximally" },
    { type: "credit", role: "Partner", name: "Code Base" },
    { type: "credit", role: "Partner", name: "Medihacks" },

    { type: "space" },

    { type: "section", text: "Music & Sound" },
    { type: "name", text: "Audio sourced from royalty-free libraries" },
    { type: "name", text: "Sound effects from Freesound.org" },
    { type: "space" },

    { type: "section", text: "Additional Thanks" },
    { type: "name", text: "Coffee, for fueling late-night coding sessions" },
    { type: "name", text: "Stack Overflow, for solving impossible bugs" },
    { type: "name", text: "Our families and friends for their support" },
    { type: "space" },
    { type: "space" },

    { type: "title", text: "And Most Importantly..." },
    { type: "space" },
    { type: "giant", text: "YOU" },
    { type: "subtitle", text: "Thank you for playing our game!" },
    { type: "space" },
    { type: "space" },
    { type: "space" },
    { type: "space" },
    { type: "space" },
    { type: "space" },
    { type: "final", text: "THE END" },
    { type: "space" },
    { type: "space" },
    { type: "space" },
    { type: "space" },
  ];

  const handleReturnToMenu = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-black overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-purple-500/10 animate-pulse"
        style={{ animationDuration: "8s" }}
      />

      <div className="absolute inset-0 opacity-40">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: `${star.width}px`,
              height: `${star.height}px`,
              background: star.background,
            }}
            animate={{
              opacity: [0.1, 1, 0.1],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="w-full flex flex-col items-center text-white"
          initial={{ y: "100vh" }}
          animate={{ y: "-100%" }}
          transition={{
            duration: 45,
            ease: "linear",
          }}
        >
          {credits.map((item, index) => {
            if (item.type === "space") return <div key={index} className="h-12" />;

            if (item.type === "title") {
              return (
                <motion.h1
                  key={index}
                  className="text-4xl md:text-5xl font-extrabold mb-8 tracking-wide bg-gradient-to-r from-fuchsia-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1 }}
                >
                  {item.text}
                </motion.h1>
              );
            }

            if (item.type === "giant") {
              return (
                <motion.h1
                  key={index}
                  className="text-[6rem] md:text-[8rem] font-black leading-none tracking-tight bg-gradient-to-b from-fuchsia-300 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_60px_rgba(217,70,239,0.7)]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, type: "spring" }}
                >
                  {item.text}
                </motion.h1>
              );
            }

            if (item.type === "final") {
              return (
                <motion.h1
                  key={index}
                  className="text-5xl md:text-7xl font-semibold tracking-[0.3em] uppercase bg-gradient-to-b from-white to-purple-200 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2 }}
                >
                  {item.text}
                </motion.h1>
              );
            }

            if (item.type === "subtitle") {
              return (
                <motion.p
                  key={index}
                  className="text-xl md:text-2xl text-purple-300 font-extralight tracking-wide italic mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  {item.text}
                </motion.p>
              );
            }

            if (item.type === "section") {
              return (
                <motion.h2
                  key={index}
                  className="text-2xl md:text-3xl font-semibold text-fuchsia-300 tracking-wide mb-10 mt-16 drop-shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  {item.text}
                </motion.h2>
              );
            }

            if (item.type === "credit") {
              return (
                <motion.div
                  key={index}
                  className="text-center mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <p className="text-md md:text-xl text-purple-300 font-light tracking-wide">
                    {item.role}
                  </p>
                  <p className="text-xl md:text-2xl font-semibold text-white mt-1">
                    {item.name}
                  </p>
                </motion.div>
              );
            }

            if (item.type === "name") {
              return (
                <motion.p
                  key={index}
                  className="text-md md:text-xl text-purple-200 font-light tracking-wide mb-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  {item.text}
                </motion.p>
              );
            }

            return null;
          })}
        </motion.div>
      </div>

      {/* Skip Credits Button - Always visible */}
      {onComplete && (
        <motion.button
          className="fixed bottom-10 right-10 px-8 py-4 bg-gradient-to-r from-fuchsia-600/90 to-purple-600/90 hover:from-fuchsia-500 hover:to-purple-500 backdrop-blur-md rounded-2xl text-white font-bold transition-all z-50 border border-white/20 shadow-2xl shadow-fuchsia-500/30"
          onClick={handleReturnToMenu}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(217,70,239,0.6)" }}
          whileTap={{ scale: 0.95 }}
        >
          Skip Credits →
        </motion.button>
      )}
    </div>
  );
}