"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const tips = [
  {
    author: "Rishul Chanana",
    title: "Founder of Maximally",
    initials: "RC",
    tip: "Joining a hackathon isn't about being perfect — it's about showing up to learn, mess around, and build something imperfect in a space that should feel like a playground, not a performance.",
  },
  {
    author: "Ryan Tran",
    title: "3× Hackathon Winner",
    initials: "RT",
    tip: "Keep building every day even if you're unsure where to start, and don't forget to have fun instead of getting lost in the pressure to win.",
  },
  {
    author: "Arsh Gibran Tariq",
    title: "7× Hackathon Winner",
    initials: "AG",
    tip: "Treat hackathons as a chance to think for yourself, start small, have fun, and build something you'd actually use — because the real win is learning, not perfection.",
  },
  {
    author: "Juan Miguel Recondo",
    title: "Student Builder",
    initials: "JM",
    tip: "Start joining hackathons early — even if you feel unready — because the right tools and a willingness to learn on the go matter far more than perfect skills.",
  },
];

export default function TipPage() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => {
      setDirection(1);
      setCurrent(p => (p + 1) % tips.length);
    }, 6000);
    return () => clearInterval(id);
  }, [auto, current]);

  const go = (next) => {
    setAuto(false);
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  };

  const prev = () => go((current - 1 + tips.length) % tips.length);
  const next = () => go((current + 1) % tips.length);

  const tip = tips[current];

  return (
    <section
      className="relative w-full overflow-hidden py-24 px-6"
      style={{ background: "#05010f" }}
    >
      {/* Top separator */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(217,70,239,0.3), transparent)" }}
      />

      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(168,85,247,0.1) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto">

        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-3 mb-14"
        >
          <div className="h-px w-12" style={{ background: "rgba(217,70,239,0.3)" }} />
          <span
            className="text-xs font-semibold uppercase tracking-[0.2em]"
            style={{ color: "rgba(240,171,252,0.5)" }}
          >
            From the community
          </span>
          <div className="h-px w-12" style={{ background: "rgba(217,70,239,0.3)" }} />
        </motion.div>

        {/* Large quote */}
        <div className="relative min-h-[260px] flex items-center">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={{
                enter: d => ({ opacity: 0, x: d * 40, filter: "blur(4px)" }),
                center: { opacity: 1, x: 0, filter: "blur(0px)" },
                exit: d => ({ opacity: 0, x: d * -30, filter: "blur(4px)" }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              {/* Opening mark */}
              <span
                className="block font-black leading-none mb-4 select-none"
                style={{
                  fontSize: "5rem",
                  lineHeight: 1,
                  background: "linear-gradient(135deg, #e879f9, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  marginTop: "-1rem",
                }}
              >
                "
              </span>

              <p
                className="text-xl sm:text-2xl lg:text-3xl font-medium leading-snug"
                style={{
                  color: "rgba(255,255,255,0.88)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.45,
                }}
              >
                {tip.tip}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Author + controls row */}
        <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">

          {/* Author */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`author-${current}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3"
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(217,70,239,0.25), rgba(124,58,237,0.25))",
                  border: "1px solid rgba(217,70,239,0.35)",
                  color: "#f0abfc",
                }}
              >
                {tip.initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">{tip.author}</p>
                <p className="text-xs leading-tight" style={{ color: "rgba(240,171,252,0.45)" }}>
                  {tip.title}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4">

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {tips.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  aria-label={`Go to tip ${i + 1}`}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === current ? "20px" : "6px",
                    height: "6px",
                    background:
                      i === current
                        ? "linear-gradient(to right, #e879f9, #a855f7)"
                        : "rgba(217,70,239,0.25)",
                  }}
                />
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={prev}
                aria-label="Previous"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  border: "1px solid rgba(217,70,239,0.25)",
                  background: "rgba(217,70,239,0.05)",
                  color: "rgba(240,171,252,0.6)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(217,70,239,0.12)"
                  e.currentTarget.style.borderColor = "rgba(217,70,239,0.5)"
                  e.currentTarget.style.color = "#f0abfc"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(217,70,239,0.05)"
                  e.currentTarget.style.borderColor = "rgba(217,70,239,0.25)"
                  e.currentTarget.style.color = "rgba(240,171,252,0.6)"
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={next}
                aria-label="Next"
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
                style={{
                  border: "1px solid rgba(217,70,239,0.25)",
                  background: "rgba(217,70,239,0.05)",
                  color: "rgba(240,171,252,0.6)",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(217,70,239,0.12)"
                  e.currentTarget.style.borderColor = "rgba(217,70,239,0.5)"
                  e.currentTarget.style.color = "#f0abfc"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(217,70,239,0.05)"
                  e.currentTarget.style.borderColor = "rgba(217,70,239,0.25)"
                  e.currentTarget.style.color = "rgba(240,171,252,0.6)"
                }}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Auto-play progress bar */}
        {auto && (
          <motion.div
            className="mt-6 h-px rounded-full overflow-hidden"
            style={{ background: "rgba(217,70,239,0.12)" }}
          >
            <motion.div
              key={current}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 6, ease: "linear" }}
              style={{
                height: "100%",
                background: "linear-gradient(to right, #e879f9, #a855f7)",
              }}
            />
          </motion.div>
        )}

      </div>
    </section>
  );
}