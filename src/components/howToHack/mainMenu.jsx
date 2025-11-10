"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import GameSettings from "./gameSettings";
import { GameExit } from "./GameExit";
import LoadGame from "./loadGame";

const styling = ["w-52 py-6 bg-fuchsia-900/20 hover:bg-fuchsia-700 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 cursor-pointer transition-all duration-300"]

export default function MainMenu({
  onStartGame = () => {},
  onLoadGame = () => {},
  onSettings = () => {},
  onExit = () => {},
}) {
  return (
    <motion.div
      className="relative w-screen h-screen bg-black overflow-hidden flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Background glow or subtle effect */}
      <div className="absolute inset-0 bg-linear-to-b from-black via-gray-900 to-black opacity-80" />

      {/* Title */}
      <motion.h1
        className="relative z-10 text-6xl font-bold text-white tracking-widest drop-shadow-lg"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        BYTEON
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="relative z-10 text-gray-400 mt-2 text-sm uppercase tracking-[0.3em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        A Visual Novel Experience
      </motion.p>

      {/* Menu buttons */}
      <motion.div
        className="relative z-10 flex flex-col mt-10 space-y-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <Button
          className={styling}
          onClick={onStartGame}
        >
          Start Game
        </Button>

        <Button
          className={styling}
          onClick={onLoadGame}
        >
          Load Game
        </Button>

        <Button
          className={styling}
          onClick={onSettings}
        >
          Settings
        </Button>

        <Button
          className={styling}
          onClick={onExit}
        >
          Exit
        </Button>
      </motion.div>

      {onSettings ? (
        <GameSettings />
      ): onExit ? (
        <GameExit />
      ): (
        <LoadGame />
      )}

      {/* Footer credits */}
      <motion.div
        className="absolute bottom-4 text-xs text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        © 2025 Byteon Studios
      </motion.div>
    </motion.div>
  );
}
