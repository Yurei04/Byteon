"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import Sidebar from "@/components/navbar"

import AboutSection from "@/pages/about-page/about-page"
import TipPage from "@/pages/home-page/tipPage"
import ClientFooterLoader from "@/components/client-footer-loader"

import ResourceHubPage from "@/pages/resource-hub-page/resource-hub-page"
import AnnouncePage from "@/pages/announce-control-page/announce-page"
import HowToHackathon from "../how-to-hackathon/page"
import BlogPage from "@/pages/blog-page/blog-page"
import PartnersPage from "@/pages/partners-page/parnters-page"
import HomePage from "@/pages/home-page/home"

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.2 },
}

export default function HomeMain() {
  const [activeTab, setActiveTab] = useState("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Sidebar is 64px (4rem) collapsed, 224px (14rem) expanded
  const mainMargin = sidebarCollapsed ? "4.5rem" : "16rem"

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(prev => !prev)}
      />

      <main
        className="flex-1 w-full pb-20 md:pb-0 md:pt-10"
        style={{
          marginLeft: 0,
          // Only apply dynamic margin on md+ (sidebar is hidden on mobile)
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
        // Use a wrapper trick so CSS handles responsive margin
      >
        {/* Responsive margin shim — invisible, pushes content on md+ */}
        <style>{`
          @media (min-width: 768px) {
            .main-content {
              margin-left: ${mainMargin};
              transition: margin-left 0.3s cubic-bezier(0.4,0,0.2,1);
            }
          }
        `}</style>

        <div className="main-content">
          <AnimatePresence mode="wait">

            {activeTab === "home" && (
              <motion.div key="home" {...fade}>
                <HomePage />
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
        </div>
      </main>
    </div>
  )
}