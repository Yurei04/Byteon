"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import GameSettings from "./gameSettings";
import { GameExit } from "./GameExit";
import LoadGame from "./loadGame";
import Link from "next/link";

const styling = ["w-32 py-6 bg-fuchsia-900/20 hover:bg-fuchsia-700 shadow-lg backdrop-blur-lg border border-fuchsia-400/30 text-fuchsia-100 cursor-pointer transition-all duration-300"]


export default function GameControls (
  onStartGame = () => {},
  onLoadGame = () => {},
  onSettings = () => {},
  onExit = () => {},
) {
    return (
        <motion.div
            className="bg-black overflow-hidden flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
        >
            {/* Title */}
            <motion.h1
                className="relative z-10 text-md mb-4 font-bold text-white tracking-widest drop-shadow-lg"
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3, duration: 1 }}
            >
                Game Controls / Assist
            </motion.h1>

            {/* Menu buttons */}
            <motion.div
                className="relative grid grid-cols-2 z-10 gap-2 space-y-4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 4, duration: 1 }}
            >
                <Button
                className={styling}
                onClick={onStartGame}
                >
                    Pause Game
                </Button>

                <Button
                className={styling}
                onClick={onLoadGame}
                >
                    Save Game
                </Button>

                <Button
                className={styling}
                onClick={onSettings}
                >
                    Settings
                </Button>
                <Link href={"/"}>
                    <Button
                    className={styling}
                    >
                        Return Homepage
                    </Button>
                </Link>
            </motion.div>

        </motion.div>
    )
}