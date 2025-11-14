"use client";

import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Cpu, UsersRound } from "lucide-react";
import { motion } from "framer-motion";

const aboutPoints = [
    {
        title: "What is Byteon?",
        icon: <Sparkles className="w-6 h-6 text-fuchsia-400" />,
        items: [
            "- Byteon is a tech community built for dreamers, builders, and innovators.",
            "- We empower students to turn ideas into real, scalable projects.",
        ],
    },
    {
        title: "Our Purpose",
        icon: <Cpu className="w-6 h-6 text-fuchsia-400" />,
        items: [
            "- Helping students master modern tech through collaboration & creation.",
            "- A home for coding, innovation, problem-solving, and big ideas.",
        ],
    },
    {
        title: "The Community",
        icon: <UsersRound className="w-6 h-6 text-fuchsia-400" />,
        items: [
            "- A growing network of developers, designers, and future founders.",
            "- Events, programs, and initiatives to boost your skills and confidence.",
        ],
    },
];

function AboutCard({ title, icon, items }) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="transition-all duration-300"
    >
      <Card className="bg-gradient-to-br from-fuchsia-900/30 to-purple-900/20 backdrop-blur-xl border border-fuchsia-700 shadow-xl rounded-3xl w-full sm:max-w-xs p-0">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 to-purple-400">
              {title}
            </h2>
          </div>

          <Separator className="bg-fuchsia-700 w-1/2" />

          <ul className="space-y-2 text-sm leading-relaxed text-fuchsia-100">
            {items.map((item, i) => (
              <li key={i} className="text-purple-200">
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AboutSection() {
  return (
    <section className="w-full min-h-screen px-4 py-20 flex flex-col items-center justify-center bg-gradient-to-b from-black to-purple-950/40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          type: "spring",
          bounce: 0.25,
          delay: 0.1,
        }}
        viewport={{ once: true, amount: 0.1 }}
        className="w-full max-w-7xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
              About Byteon
            </span>
          </h1>

          <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
            Empowering creators, coders, and innovators through community,
            learning, and meaningful opportunities.
          </p>
        </div>

        <div className="flex flex-col sm:flex-col md:flex-row flex-wrap gap-6 items-center justify-center">
          {aboutPoints.map((p, i) => (
            <AboutCard key={i} {...p} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
