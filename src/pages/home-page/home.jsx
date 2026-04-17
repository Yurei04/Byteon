"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowUpRight, Zap, Trophy, Users, ChevronRight } from "lucide-react"

const stats = [
  { icon: Zap,   value: "50+",  label: "Hackathons" },
  { icon: Trophy, value: "2k+", label: "Builders"   },
  { icon: Users,  value: "30+", label: "Partners"   },
]

const features = [
  "Hackathon Alerts",
  "Student Programs",
  "Resource Hub",
  "Community Blog",
  "Live Events",
  "Partner Network",
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay },
})

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05010f]">

      {/* ── Background: fine dot grid ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Single centered glow ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(217,70,239,0.18) 0%, transparent 70%)",
        }}
      />

      {/* ── Thin top border accent ───────────────────── */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuchsia-500/60 to-transparent" />

      {/* ══════════ HERO ══════════════════════════════ */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-28 pb-16 sm:pt-36 sm:pb-20">

        {/* Status pill */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium tracking-wide"
            style={{
              background: "rgba(217,70,239,0.08)",
              border: "1px solid rgba(217,70,239,0.25)",
              color: "#e879f9",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"
              style={{ boxShadow: "0 0 6px #e879f9" }}
            />
            Now accepting hackathon partners
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.08)}
          className="font-black leading-none tracking-tighter text-white"
          style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)", letterSpacing: "-0.04em" }}
        >
          Build.{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #f0abfc 0%, #e879f9 40%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Compete.
          </span>{" "}
          Win.
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          {...fadeUp(0.16)}
          className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed"
          style={{ color: "rgba(240,171,252,0.55)" }}
        >
          Byteon blends interactive storytelling with real opportunities — hackathons,
          student programs, and a community built to launch careers.
        </motion.p>

        {/* CTA row */}
        <motion.div
          {...fadeUp(0.24)}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/super-admin-dashboard">
            <button
              className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #c026d3, #7c3aed)",
                boxShadow: "0 0 24px rgba(192,38,211,0.35)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 36px rgba(192,38,211,0.55)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(192,38,211,0.35)")}
            >
              Partner with us
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </Link>

          <Link href="/">
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{
                border: "1px solid rgba(217,70,239,0.3)",
                color: "rgba(240,171,252,0.85)",
                background: "transparent",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(217,70,239,0.08)"
                e.currentTarget.style.borderColor = "rgba(217,70,239,0.6)"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.borderColor = "rgba(217,70,239,0.3)"
              }}
            >
              Join the community
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          {...fadeUp(0.32)}
          className="mt-12 flex items-center gap-10 sm:gap-14"
        >
          {stats.map(({ icon: Icon, value, label }, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className="text-2xl sm:text-3xl font-black tracking-tight text-white"
                style={{ letterSpacing: "-0.03em" }}
              >
                {value}
              </span>
              <span className="flex items-center gap-1 text-xs uppercase tracking-widest" style={{ color: "rgba(240,171,252,0.4)" }}>
                <Icon className="w-3 h-3" />
                {label}
              </span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════ LOGO CARD ════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex justify-center px-6 pb-16"
      >
        <div
          className="relative w-full max-w-md rounded-2xl overflow-hidden"
          style={{
            border: "1px solid rgba(217,70,239,0.2)",
            background: "linear-gradient(135deg, rgba(217,70,239,0.06) 0%, rgba(124,58,237,0.06) 100%)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Card inner top strip */}
          <div
            className="h-px w-full"
            style={{ background: "linear-gradient(to right, transparent, rgba(217,70,239,0.5), transparent)" }}
          />

          <div className="flex items-center gap-6 p-6">
            {/* Logo */}
            <div
              className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden"
              style={{
                border: "1px solid rgba(217,70,239,0.35)",
                background: "linear-gradient(135deg, #2e0040, #1a0030)",
              }}
            >
              <Image
                src="/images/logoByteon.png"
                alt="Byteon Logo"
                fill
                loading="eager"
                className="object-cover"
                fetchPriority="high"
              />
            </div>

            {/* Card text */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg tracking-tight">Byteon</p>
              <p className="text-sm mt-0.5" style={{ color: "rgba(240,171,252,0.5)" }}>
                Create It, To Win It
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"
                  style={{ boxShadow: "0 0 5px #e879f9" }}
                />
                <span className="text-xs" style={{ color: "rgba(240,171,252,0.45)" }}>
                  Live platform · always open
                </span>
              </div>
            </div>

            {/* Arrow */}
            <Link href="/">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  border: "1px solid rgba(217,70,239,0.3)",
                  background: "rgba(217,70,239,0.08)",
                }}
              >
                <ArrowUpRight className="w-4 h-4" style={{ color: "#e879f9" }} />
              </div>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ══════════ FEATURE TICKER ═══════════════════ */}
      <div
        className="relative z-10 border-y overflow-hidden py-3"
        style={{ borderColor: "rgba(217,70,239,0.12)" }}
      >
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap"
        >
          {[...features, ...features].map((f, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-3 px-6 text-xs font-medium uppercase tracking-[0.15em]"
              style={{ color: "rgba(240,171,252,0.35)" }}
            >
              <span
                className="w-1 h-1 rounded-full bg-fuchsia-500/50 flex-shrink-0"
              />
              {f}
            </span>
          ))}
        </motion.div>
      </div>

    </div>
  )
}