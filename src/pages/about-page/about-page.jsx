"use client";

import { Separator } from "@/components/ui/separator";
import { Sparkles, Cpu, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

const aboutPoints = [
  {
    title: "What is Byteon?",
    icon: Sparkles,
    color: "from-fuchsia-500 to-pink-500",
    glow: "rgba(217,70,239,0.2)",
    items: [
      "A student-driven tech platform built to unite creators, hackers, and innovators.",
      "Organizations can announce hackathons, publish blogs, and share resources in one place.",
      "Enjoy our interactive visual-novel experience that teaches real tech concepts in a fun way.",
    ],
  },
  {
    title: "Our Purpose",
    icon: Cpu,
    color: "from-purple-500 to-violet-500",
    glow: "rgba(139,92,246,0.2)",
    items: [
      "Build a space where students learn, grow, and showcase their projects and ideas.",
      "Empower beginners and advanced learners through accessible tools, stories, and experiences.",
      "Help organizations reach students while helping students discover opportunities that fit their goals.",
    ],
  },
  {
    title: "The Community",
    icon: UsersRound,
    color: "from-pink-500 to-rose-500",
    glow: "rgba(244,114,182,0.2)",
    items: [
      "A collective of developers, designers, researchers, and aspiring founders worldwide.",
      "Students can explore upcoming hackathons, join initiatives, and get inspired by real tech journeys.",
      "Whether joining events or playing our visual novel, Byteon is your gateway to tech.",
    ],
  },
];

function AboutCard({ title, icon: Icon, color, glow, items, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.12, type: "spring", bounce: 0.2 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="group relative flex-1 min-w-[260px] max-w-sm rounded-2xl border border-fuchsia-800/40 bg-gradient-to-br from-fuchsia-950/60 via-purple-950/50 to-black/60 backdrop-blur-xl p-6 overflow-hidden transition-all duration-300"
      style={{ boxShadow: `0 0 0 1px rgba(168,85,247,0.1), 0 4px 30px ${glow}` }}
    >
      {/* Hover glow overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />

      {/* Top accent line */}
      <div className={`absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r ${color} rounded-full`} />

      {/* Icon */}
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      <h2 className={`text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r ${color} mb-3`}>
        {title}
      </h2>

      <Separator className="bg-fuchsia-700/30 mb-4" />

      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-fuchsia-200/75 leading-relaxed">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-gradient-to-br ${color}`} />
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
      style={{ background: "linear-gradient(to bottom, #000000, #0d0118, #000000)" }}
    >
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-fuchsia-900/15 rounded-full blur-3xl pointer-events-none" />

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
            className="text-fuchsia-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3"
          >
            Who we are
          </motion.p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter mb-5">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-pink-300 to-purple-400">
              About Byteon
            </span>
          </h1>
          <p className="text-fuchsia-300/60 max-w-xl mx-auto text-base leading-relaxed">
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