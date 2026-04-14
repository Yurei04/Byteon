"use client"
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap, Trophy, Users } from "lucide-react";

const stats = [
  { icon: <Zap className="w-4 h-4" />, label: "Hackathons" },
  { icon: <Trophy className="w-4 h-4" />, label: "Builders" },
  { icon: <Users className="w-4 h-4" />, label: "Partners" },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden ">

      {/* Layered gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(168,85,247,0.25),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_80%_60%,rgba(217,70,239,0.12),transparent)]" />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(217,70,239,0.5) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Animated glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-600/20 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 container mx-auto px-6 sm:px-10 lg:px-16 flex flex-col-reverse lg:flex-row items-center justify-center gap-12 lg:gap-20 py-20">

        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-xl text-center lg:text-left space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-fuchsia-500/40 bg-fuchsia-950/50 text-fuchsia-300 text-xs font-medium tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse" />
            Now accepting hackathon partners
          </motion.div>

          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-none tracking-tighter">
              <span className="text-white">Byte</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400">
                on
              </span>
            </h1>
            <h2 className="mt-4 text-xl sm:text-2xl font-semibold text-fuchsia-200/80 tracking-tight">
              Create It, To Win It
            </h2>
            <p className="mt-4 text-sm sm:text-base text-fuchsia-300/60 leading-relaxed max-w-md mx-auto lg:mx-0">
              Learn, play, and grow — Byteon blends interactive storytelling with real
              opportunities like hackathons and student programs.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <Link href="/super-admin-dashboard">
              <Button
                size="lg"
                className="cursor-pointer bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white border-0 shadow-[0_0_20px_rgba(217,70,239,0.4)] hover:shadow-[0_0_28px_rgba(217,70,239,0.6)] transition-all duration-300 font-semibold"
              >
                Partner With Us
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="cursor-pointer border border-fuchsia-500/50 text-fuchsia-300 bg-transparent hover:bg-fuchsia-900/30 hover:border-fuchsia-400 hover:text-fuchsia-100 transition-all duration-300"
              >
                Join Us
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="flex gap-6 justify-center lg:justify-start pt-2">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex flex items-center lg:items-start gap-2"
              >
                <div className="flex items-center gap-1.5 text-fuchsia-400 mb-0.5">
                  {s.icon}
                </div>
                <span className="text-xs text-fuchsia-400/60 uppercase tracking-widest">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Logo / Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative flex-shrink-0"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-fuchsia-500/30"
            style={{ margin: "-12px" }}
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-purple-400/20"
            style={{ margin: "-24px" }}
          />

          <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full border-2 border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-950 to-purple-950 shadow-[0_0_40px_rgba(217,70,239,0.35),inset_0_0_40px_rgba(168,85,247,0.1)] overflow-hidden">
            <Image
              src="/images/logoByteon.png"
              alt="Byteon Logo"
              fill
              loading="eager"
              className="object-cover"
              fetchPriority="high"
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}