"use client"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import AnnouncePublicCard from "@/components/(dashboard)/announce/announce-public-card";
export default function AnnounceSection (


) {
    const [announcements, setAnnounements] = useState([]);

    useEffect(() => {
      async function fetchAnnouncements() {
        const { data, error } = await supabase
          .from("announcements")
          .select("*")
          .order("created_at", {ascending: false}
          )
          if(error) console.log("Error", error)
          else setAnnounements(data)
      }

      fetchAnnouncements()
    }, [])

    return (
      <section className="w-full min-h-screen px-4 py-20 flex flex-col items-center justify-center bg-gradient-to-b from-purple-950/40 to-black">
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
                Join Hackathons
              </span>
            </h1>

            <p className="text-fuchsia-200 max-w-2xl mx-auto text-lg">
              Join Most recent Hackathons right now!
            </p>
          </div>

          {/* Carousel */}
            <Carousel
                opts={{
                    align: "center",
                    loop: true,
                }}
                plugins={[
                    Autoplay({
                        delay: 3000,
                        stopOnInteraction: false,
                    }),
                ]}
                className="w-full flex justify-center items-center"
            >
              <CarouselPrevious className="cursor-pointer"/>
                <CarouselContent>
                  {announcements.map((item) => (
                    <CarouselItem 
                      key={item.id} 
                      className="p-4 flex justify-center"
                    >
                      <div className="w-full max-w-sm mx-auto">
                        <AnnouncePublicCard item={item} />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              <CarouselNext className="cursor-pointer"/>
            </Carousel>
        </motion.div>
      </section>
    )
}