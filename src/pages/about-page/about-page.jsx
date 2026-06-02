"use client";

import { Separator } from "@/components/ui/separator";
import { Sparkles, Cpu, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

const aboutPoints = [
  {
    title: "What is Byteon?",
    icon: Sparkles,
    gradientFrom: "rgb(var(--brand-500))",
    gradientTo: "rgb(var(--accent-400))",
    glowColor: "rgb(var(--brand-500) / 0.15)",
    items: [
      "A student-driven tech platform built to unite creators, hackers, and innovators.",
      "Organizations can announce hackathons, publish blogs, and share resources in one place.",
      "Enjoy our interactive visual-novel experience that teaches real tech concepts in a fun way.",
    ],
  },
  {
    title: "Our Purpose",
    icon: Cpu,
    gradientFrom: "rgb(var(--accent-500))",
    gradientTo: "rgb(var(--accent-600))",
    glowColor: "rgb(var(--accent-500) / 0.15)",
    items: [
      "Build a space where students learn, grow, and showcase their projects and ideas.",
      "Empower beginners and advanced learners through accessible tools, stories, and experiences.",
      "Help organizations reach students while helping students discover opportunities that fit their goals.",
    ],
  },
  {
    title: "The Community",
    icon: UsersRound,
    gradientFrom: "rgb(var(--brand-400))",
    gradientTo: "rgb(var(--brand-600))",
    glowColor: "rgb(var(--brand-400) / 0.15)",
    items: [
      "A collective of developers, designers, researchers, and aspiring founders worldwide.",
      "Students can explore upcoming hackathons, join initiatives, and get inspired by real tech journeys.",
      "Whether joining events or playing our visual novel, Byteon is your gateway to tech.",
    ],
  },
];

function AboutCard({ title, icon: Icon, gradientFrom, gradientTo, glowColor, items, index }) {
  const gradient = `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, type: "spring", bounce: 0.2 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative flex-1 min-w-[260px] max-w-sm rounded-2xl backdrop-blur-xl p-6 overflow-hidden transition-all duration-300"
      style={{
        background: "rgb(var(--surface-raised))",
        border: "1px solid rgb(var(--surface-border) / 0.3)",
        boxShadow: `0 0 0 1px rgb(var(--brand-500) / 0.08), 0 4px 30px ${glowColor}`,
      }}
    >
      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}08, ${gradientTo}06)` }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
        style={{ background: gradient }}
      />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 shadow-lg"
        style={{ background: gradient }}
      >
        <Icon className="w-5 h-5" style={{ color: "rgb(var(--fg-on-brand, 255 255 255))" }} />
      </div>

      <h2
        className="text-lg font-bold mb-3 text-transparent bg-clip-text"
        style={{ backgroundImage: gradient }}
      >
        {title}
      </h2>

      <Separator
        className="mb-4"
        style={{ background: "rgb(var(--surface-border) / 0.4)" }}
      />

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-2.5 text-sm leading-relaxed"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: gradient }}
            />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <section
      id="aboutSection"
      className="relative w-full min-h-screen px-4 py-24 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "rgb(var(--bg-base))" }}
    >
      {/* Background orbs */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgb(var(--accent-500) / 0.07)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgb(var(--brand-600) / 0.08)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
        viewport={{ once: true, amount: 0.1 }}
        className="relative z-10 w-full max-w-6xl"
      >
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-3"
            style={{ color: "rgb(var(--brand-500))" }}
          >
            Who we are
          </motion.p>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-5">
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: `linear-gradient(to right, rgb(var(--brand-300)), rgb(var(--accent-400)), rgb(var(--brand-400)))`,
              }}
            >
              About Byteon
            </span>
          </h1>

          <p
            className="max-w-xl mx-auto text-base leading-relaxed"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            Empowering creators, coders, and innovators through community,
            learning, and meaningful opportunities.
          </p>
        </div>

        {/* Cards */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-6 items-stretch justify-center">
          {aboutPoints.map((p, i) => (
            <AboutCard key={i} {...p} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}