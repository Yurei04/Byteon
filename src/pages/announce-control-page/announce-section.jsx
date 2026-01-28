"use client"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import AnnouncePublicCard from "@/components/(dashboard)/announce/announce-public-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SelectSeparator } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function AnnounceSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnnouncements() {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from("announcements")
          .select("*") // This includes the prizes JSONB field
          .order("created_at", { ascending: false })
          .limit(10); // Limit to 10 most recent for carousel performance

        if (error) {
          console.error("Error fetching announcements:", error);
          setError(error.message);
        } else {
          // Prizes are automatically parsed from JSONB to JavaScript arrays
          setAnnouncements(data || []);
          console.log("Loaded announcements with prizes:", data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Failed to load announcements");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnnouncements();
  }, []);

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

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center py-20">
            <div className="text-red-400 text-center">
              <p className="text-lg font-semibold mb-2">Failed to load announcements</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && announcements.length === 0 && (
          <div className="flex justify-center items-center py-20">
            <div className="text-fuchsia-300/70 text-center">
              <p className="text-lg">No announcements available at the moment.</p>
              <p className="text-sm mt-2">Check back soon for new hackathons!</p>
            </div>
          </div>
        )}

        {/* Carousel */}
        {!isLoading && !error && announcements.length > 0 && (
          <>
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
              <CarouselPrevious className="cursor-pointer" />
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
              <CarouselNext className="cursor-pointer" />
            </Carousel>

            <SelectSeparator className="h-0.5 bg-gradient-to-r from-transparent via-purple-500/70 to-transparent my-1 m-2" />
            
            <div className="flex justify-center items-center m-2">
              <Link href="/announce">
                <Button
                  size="lg"
                  className="cursor-pointer bg-fuchsia-700 hover:bg-fuchsia-600 text-white border border-fuchsia-600 transition-colors"
                >
                  Check More Out!
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </section>
  );
}