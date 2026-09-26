"use client"

import { PartnersCard } from "../../components/partners/partners-card"
import { motion } from "framer-motion"

const data = [
  {
    name: "Hack United",
    image: "/images/HackUnited2.png",
    location: "USA",
    des: "Empowering the Next Generation of Tech Innovators",
    websiteLink: "https://www.hackunited.org/",
    tags: ["Tech", "Innovation"],
    colorTheme: "purple",
  },
  {
    name: "Gift of Computation",
    image: "/images/GOC_gift_of_computation.png",
    location: "Qatar & Kuwait",
    des: "Gift of Computation brings them together—giving builders a shared community to learn, grow, and create impact, regardless of where they study.",
    websiteLink: "https://discord.gg/byyMky7Y",
    tags: ["Tech", "Community", "Education"],
    colorTheme: "lightgray",
  },
  {
    name: "CS Base",
    image: "/images/CSBase_logo.png",
    location: "US",
    des: "CS Base provides a global ecosystem that enables elementary to high school students to specialize in modern computer science.",
    websiteLink: "https://www.csbase.org/",
    tags: ["Tech", "Innovation"],
    colorTheme: "blue",
  },
  {
    name: "Medihacks",
    image: "/images/meddi.png",
    location: "US",
    des: "Fostering innovation today for a healthier tomorrow.",
    websiteLink: "https://medihacks.org/",
    tags: ["Health", "Tech"],
    colorTheme: "pink",
  },
  {
    name: "Maximally",
    image: "/images/Maximallyc.png",
    location: "India",
    des: "A global innovation league that hosts high-stakes hackathons for ambitious builders. Built by hackers, for hackers.",
    websiteLink: null,
    tags: ["Innovation", "Hackathon"],
    colorTheme: "red",
  },
]

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

export default function PartnersPage() {
  return (
    <div
      className="relative w-full min-h-screen overflow-x-hidden"
      style={{ background: "rgb(var(--bg-base))" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 40% at 50% -5%, rgb(var(--brand-500) / 0.14) 0%, transparent 70%),
            linear-gradient(rgb(var(--surface-border) / 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgb(var(--surface-border) / 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "auto, 40px 40px, 40px 40px",
        }}
      />

      {/* Ambient glow left */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 500, height: 500,
          top: "5%", left: "-15%",
          background: "radial-gradient(circle, rgb(var(--brand-500) / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Ambient glow right */}
      <div
        className="fixed pointer-events-none z-0"
        style={{
          width: 400, height: 400,
          bottom: "10%", right: "-12%",
          background: "radial-gradient(circle, rgb(var(--accent-500) / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Page content */}
      <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pb-24 pt-28">

        {/* Hero */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Eyebrow pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-8"
            style={{
              border: "1px solid rgb(var(--brand-500) / 0.25)",
              background: "rgb(var(--brand-500) / 0.06)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: "rgb(var(--brand-400))",
                boxShadow: "0 0 6px rgb(var(--brand-400))",
              }}
            />
            <span
              className="text-[11px] font-medium tracking-[0.15em] uppercase"
              style={{ color: "rgb(var(--text-muted))" }}
            >
              Community Network
            </span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none mb-6"
            style={{
              backgroundImage: `linear-gradient(135deg, rgb(var(--brand-200)) 0%, rgb(var(--brand-400)) 40%, rgb(var(--accent-400)) 80%, rgb(var(--brand-300)) 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Our Partners
          </h1>

          {/* Gradient divider */}
          <div
            className="w-16 h-px mx-auto mb-6"
            style={{
              background: `linear-gradient(to right, transparent, rgb(var(--brand-500)), transparent)`,
            }}
          />

          <p
            className="max-w-md mx-auto text-base sm:text-lg font-light leading-relaxed"
            style={{ color: "rgb(var(--text-secondary))" }}
          >
            Empowering creators, coders, and innovators through community.
            Explore our partners and discover new opportunities.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="flex justify-center gap-10 sm:gap-16 mb-14 py-5 px-8 rounded-2xl backdrop-blur-sm"
          style={{
            border: "1px solid rgb(var(--surface-border) / 0.15)",
            background: "rgb(var(--surface-raised))",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {[
            { num: "5",  label: "Partners"      },
            { num: "4",  label: "Countries"     },
            { num: "∞",  label: "Opportunities" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  backgroundImage: `linear-gradient(135deg, rgb(var(--brand-400)), rgb(var(--accent-400)))`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.num}
              </div>
              <div
                className="text-[10px] uppercase tracking-widest mt-1 font-medium"
                style={{ color: "rgb(var(--text-faint))" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Cards */}
        <motion.div
          className="flex flex-col gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {data.map((partner, idx) => (
            <PartnersCard key={idx} {...partner} />
          ))}
        </motion.div>
      </div>
    </div>
  )
}