"use client";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion";
import Autoplay from "embla-carousel-autoplay";
import AnnouncePublicCard from "@/components/(dashboard)/announce/announce-public-card";
import React, { useMemo, useState, useEffect, useRef } from "react";

/**
 * GameFlow Component - Fixed for Main Page Integration
 * Shows vertical scrollable timeline of chapter progression
 * Receives state from parent (HowToHackPage) which gets it from ChapterManager
 */

export default function GameFlow({
  chapterData,
  currentEventIndex = 0,  // Default to 0 if not provided
  currentDialogIndex = 0,  // Default to 0 if not provided
  isShowingMinigame = false
}) {
  const containerRef = useRef(null);
  const [announcements, setAnnounements] = useState([]);
  const events = useMemo(() => chapterData?.events ?? [], [chapterData]);

  // Auto-scroll to active element
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeEl = container.querySelector(".active-item");
    if (activeEl) {
      setTimeout(() => {
        activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [currentEventIndex, currentDialogIndex, isShowingMinigame]);



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

  // Show placeholder if no data or end 
  if (!chapterData || !events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full mt-4 text-gray-400 p-4">
        <div className="text-center mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 to-purple-500">
                Join Hackathons
              </span>
            </h1>

            <p className="text-fuchsia-200 max-w-2xl mx-auto text-md">
              Join Most recent Hackathons right now!
            </p>
          </div>
        <Carousel
          opts={{
            align: "center",
            axis: "y",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: false,
            }),
          ]}
          className="w-full flex  justify-center items-center h-full"
        >
          <CarouselContent className="flex">
            {announcements.map((item) => (
              <CarouselItem
                key={item.id}
                className="p-4 flex flex-col justify-center items-center"
              >
                <div className="w-full max-w-sm mx-auto">
                  <AnnouncePublicCard item={item} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-fuchsia-800 scrollbar-track-gray-900"
    >
      {/* Chapter Title & Progress */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm p-3 rounded-lg border border-fuchsia-500/30 mb-4">
        <h3 className="text-lg font-bold text-fuchsia-400">
          {chapterData?.title || "Chapter"}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          Event {currentEventIndex + 1} of {events.length}
        </p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
          <div 
            className="bg-fuchsia-500 h-2 rounded-full transition-all duration-500"
            style={{ 
              width: `${((currentEventIndex + 1) / events.length) * 100}%` 
            }}
          />
        </div>
      </div>

      {/* Events Timeline */}
      {events.map((event, eIdx) => {
        const dialogs = event?.dialogs ?? [];
        const hasMinigame = !!event?.minigame;
        const isCurrentEvent = eIdx === currentEventIndex;
        const isPastEvent = eIdx < currentEventIndex;
        const isFutureEvent = eIdx > currentEventIndex;

        return (
          <motion.div
            key={event?.id || eIdx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: eIdx * 0.05 }}
            className="relative"
          >
            {/* Event Container */}
            <div
              className={`rounded-lg border-2 p-3 transition-all ${
                isCurrentEvent
                  ? "border-fuchsia-500 bg-fuchsia-900/20"
                  : isPastEvent
                  ? "border-green-500/50 bg-green-900/10"
                  : "border-gray-700 bg-gray-900/50"
              }`}
            >
              {/* Event Header */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrentEvent
                      ? "bg-fuchsia-500 text-white"
                      : isPastEvent
                      ? "bg-green-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {eIdx + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    {event?.type === "choice" ? "Choice Event" : "Scene"}
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {event?.id || `Event ${eIdx + 1}`}
                  </p>
                </div>
                {isPastEvent && (
                  <div className="text-green-500 text-xs">✓ Complete</div>
                )}
              </div>

              {/* Dialogs */}
              {dialogs.length > 0 && (
                <div className="space-y-1 ml-8 mb-2">
                  {dialogs.map((dialog, dIdx) => {
                    const isCurrentDialog = isCurrentEvent && dIdx === currentDialogIndex;
                    const isPastDialog = isPastEvent || (isCurrentEvent && dIdx < currentDialogIndex);
                    const isFutureDialog = isFutureEvent || (isCurrentEvent && dIdx > currentDialogIndex);

                    return (
                      <div
                        key={dIdx}
                        className={`text-xs p-2 rounded border transition-all ${
                          isCurrentDialog
                            ? "active-item border-fuchsia-400 bg-fuchsia-500/20 text-white font-semibold"
                            : isPastDialog
                            ? "border-green-500/30 bg-green-900/10 text-green-300"
                            : "border-gray-700 bg-gray-800/50 text-gray-500"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`flex-shrink-0 ${
                              isCurrentDialog
                                ? "text-fuchsia-400"
                                : isPastDialog
                                ? "text-green-400"
                                : "text-gray-600"
                            }`}
                          >
                            {isCurrentDialog ? "▶" : isPastDialog ? "✓" : "○"}
                          </span>
                          <div className="flex-1">
                            <p className="font-semibold text-md opacity-70">
                              {dialog?.character || "Narrator"}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Choice Event */}
              {event?.type === "choice" && event?.choices && (
                <div className="ml-8 space-y-1">
                  <p className="text-xs text-gray-400 mb-1">
                    {event?.prompt || "Make a choice:"}
                  </p>
                  {event.choices.map((choice, idx) => (
                    <div
                      key={idx}
                      className={`text-xs p-2 rounded border ${
                        isCurrentEvent
                          ? "border-fuchsia-400/50 bg-fuchsia-900/10 text-fuchsia-300"
                          : "border-gray-700 bg-gray-800/30 text-gray-500"
                      }`}
                    >
                      • {choice.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Minigame Indicator */}
              {hasMinigame && (
                <div className="ml-8 mt-2">
                  <div
                    className={`text-xs p-2 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      isCurrentEvent && isShowingMinigame
                        ? "active-item border-yellow-500 bg-yellow-500/20 text-yellow-300 animate-pulse"
                        : isPastEvent
                        ? "border-green-500/50 bg-green-900/10 text-green-400"
                        : isCurrentEvent
                        ? "border-yellow-500/50 bg-yellow-900/10 text-yellow-400"
                        : "border-gray-700 bg-gray-800/50 text-gray-500"
                    }`}
                  >
                    <span className="text-lg">
                      {isPastEvent ? "✓" : isCurrentEvent && isShowingMinigame ? "🎮" : "🎯"}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold">
                        {event.minigame?.minigame_title || "Minigame"}
                      </p>
                      {isCurrentEvent && isShowingMinigame && (
                        <p className="text-[10px] opacity-70">Active Now</p>
                      )}
                      {isPastEvent && (
                        <p className="text-[10px] opacity-70">Completed</p>
                      )}
                      {isCurrentEvent && !isShowingMinigame && (
                        <p className="text-[10px] opacity-70">Coming Soon</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Connector Line */}
            {eIdx < events.length - 1 && (
              <div
                className={`w-0.5 h-4 ml-5 ${
                  isPastEvent ? "bg-green-500/50" : "bg-gray-700"
                }`}
              />
            )}
          </motion.div>
        );
      })}
    </div>
  );
}