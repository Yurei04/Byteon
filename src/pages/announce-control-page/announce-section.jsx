"use client"

import { supabase } from "@/lib/supabase"
import { buildTheme } from "@/lib/blog-color"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import AnnouncePublicCard from "@/components/(dashboard)/announce/announce-public-card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Sparkles } from "lucide-react"

const COLOR_CACHE     = new Map()
const DEFAULT_PRIMARY   = "#c026d3"
const DEFAULT_SECONDARY = "#db2777"

export default function AnnounceSection() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)

  useEffect(() => {
    async function fetchAnnouncements() {
      setLoading(true)
      setError(null)

      // ── 1. Fetch announcements ───────────────────────────────────────────
      const { data, error: fetchErr } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchErr) {
        console.error("Error fetching announcements:", fetchErr)
        setError(fetchErr.message)
        setLoading(false)
        return
      }

      if (!data?.length) {
        setAnnouncements([])
        setLoading(false)
        return
      }

      // ── 2. Collect unique org names ──────────────────────────────────────
      const orgNames = [...new Set(data.map((a) => a.organization).filter(Boolean))]
      const uncached  = orgNames.filter((n) => !COLOR_CACHE.has(n))

      // ── 3. Fetch & cache missing org colors ──────────────────────────────
      if (uncached.length) {
        const { data: orgData, error: orgErr } = await supabase
          .from("organizations")
          .select("name, primary_color, secondary_color")
          .in("name", uncached)

        if (orgErr) console.error("Error fetching org colors:", orgErr)

        ;(orgData || []).forEach((org) => {
          COLOR_CACHE.set(
            org.name,
            buildTheme(
              org.primary_color   ?? DEFAULT_PRIMARY,
              org.secondary_color ?? DEFAULT_SECONDARY,
            ),
          )
        })
      }

      // ── 4. Enrich announcements with their org theme ─────────────────────
      const enriched = data.map((item) => ({
        ...item,
        _theme:
          item.organization && COLOR_CACHE.has(item.organization)
            ? COLOR_CACHE.get(item.organization)
            : buildTheme(DEFAULT_PRIMARY, DEFAULT_SECONDARY),
      }))

      setAnnouncements(enriched)
      setLoading(false)
    }

    fetchAnnouncements()
  }, [])

  return (
    <section className="relative w-full overflow-hidden py-24 px-4 flex flex-col items-center bg-gradient-to-b from-purple-950/40 to-black">

      {/* subtle radial glow behind the heading */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div className="mt-12 w-[600px] h-[300px] rounded-full bg-fuchsia-700/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.2 }}
        viewport={{ once: true, amount: 0.1 }}
        className="relative z-10 w-full max-w-7xl flex flex-col items-center"
      >

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-fuchsia-700/40 bg-fuchsia-950/30 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />
          <span className="text-xs font-medium text-fuchsia-300 tracking-wide uppercase">
            Live &amp; Upcoming
          </span>
        </div>

        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-4 leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-400 to-indigo-400">
            Join Hackathons
          </span>
        </h2>

        <p className="text-fuchsia-200/70 text-base sm:text-lg text-center max-w-xl mb-14">
          Discover competitions from organizations worldwide — find one that matches your skills and register today.
        </p>

        {/* ── LOADING ────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400" />
          </div>
        )}

        {/* ── ERROR ──────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex justify-center items-center py-24">
            <div className="text-center px-6 py-8 rounded-2xl border border-red-800/40 bg-red-950/20">
              <p className="text-red-400 font-semibold text-lg mb-1">Failed to load announcements</p>
              <p className="text-red-400/60 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* ── EMPTY ──────────────────────────────────────────────────────── */}
        {!loading && !error && announcements.length === 0 && (
          <div className="flex justify-center items-center py-24">
            <div className="text-center">
              <p className="text-fuchsia-300/70 text-lg">No hackathons available right now.</p>
              <p className="text-fuchsia-400/40 text-sm mt-2">Check back soon — new ones are added regularly!</p>
            </div>
          </div>
        )}

        {/* ── CAROUSEL ───────────────────────────────────────────────────── */}
        {!loading && !error && announcements.length > 0 && (
          <>
            <div className="w-full relative">
              <Carousel
                opts={{ align: "center", loop: true }}
                plugins={[Autoplay({ delay: 3200, stopOnInteraction: false })]}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {announcements.map((item) => (
                    <CarouselItem
                      key={item.id}
                      className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <div className="h-full p-1">
                        <AnnouncePublicCard item={item} theme={item._theme} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="
                  -left-4 sm:-left-6
                  bg-fuchsia-950/60 border-fuchsia-700/50 text-fuchsia-300
                  hover:bg-fuchsia-800/70 hover:text-white
                  backdrop-blur-sm transition-all
                " />
                <CarouselNext className="
                  -right-4 sm:-right-6
                  bg-fuchsia-950/60 border-fuchsia-700/50 text-fuchsia-300
                  hover:bg-fuchsia-800/70 hover:text-white
                  backdrop-blur-sm transition-all
                " />
              </Carousel>
            </div>

            {/* subtle divider */}
            <div className="w-full max-w-md my-10 h-px bg-gradient-to-r from-transparent via-fuchsia-600/40 to-transparent" />

            {/* CTA */}
            <Link href="/announce">
              <Button
                size="lg"
                className="
                  group cursor-pointer gap-2
                  bg-fuchsia-700 hover:bg-fuchsia-600
                  text-white border border-fuchsia-500/60
                  shadow-lg shadow-fuchsia-900/40
                  transition-all duration-200
                "
              >
                Browse All Hackathons
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </>
        )}
      </motion.div>
    </section>
  )
}