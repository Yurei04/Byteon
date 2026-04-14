"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import Sidebar from "@/components/navbar"

import Homepage from "./(layout)/homepage/page"
import AboutSection from "@/pages/about-page/about-page"
import TipPage from "@/pages/home-page/tipPage"
import ClientFooterLoader from "@/components/client-footer-loader"

import PartnersPage from "./(layout)/partners/page"
import ResourceHubPage from "@/pages/resource-hub-page/resource-hub-page"
import AnnouncePage from "./(layout)/announce/page"
import HowToHackathon from "./(layout)/how-to-hackathon/page" 
import BlogPage from "@/pages/blog-page/blog-page"

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="flex min-h-screen bg-[#0a0010]">
      {/* ✅ ONLY ONE SIDEBAR */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 w-full md:ml-16 xl:ml-60 pb-20 md:pb-0 pt-6 md:pt-10">
        <AnimatePresence mode="wait">

          {activeTab === "home" && (
            <motion.div key="home" {...fade}>
              <Homepage />
              <AboutSection />
              <TipPage />
              <ClientFooterLoader />
            </motion.div>
          )}

          {activeTab === "partners" && (
            <motion.div key="partners" {...fade}>
              <PartnersPage />
            </motion.div>
          )}

          {activeTab === "blog" && (
            <motion.div key="blog" {...fade}>
              <BlogPage />
            </motion.div>
          )}

          {activeTab === "resource" && (
            <motion.div key="resource" {...fade}>
              <ResourceHubPage />
            </motion.div>
          )}

          {activeTab === "hacks" && (
            <motion.div key="hacks" {...fade}>
              <AnnouncePage />
            </motion.div>
          )}

          {activeTab === "howto" && (
            <motion.div key="howto" {...fade}>
              <HowToHackathon />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}