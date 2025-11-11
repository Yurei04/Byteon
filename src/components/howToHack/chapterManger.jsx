"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import GameScreen from "./gameScreen";

/**
 * ChapterManager
 * ------------------------
 * This component:
 *  - Passes the normalized chapter data to GameScreen
 *  - Handles dialog & event progression
 *  - Triggers next chapter when finished
 *  - Shows fallback if no data
 *  - Provides debug logs and a Next Chapter button for testing
 */
export default function ChapterManager({ chapterData, onNextChapter }) {
  const [eventIndex, setEventIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState(0);
  const calledChapterEndRef = useRef(false);

  // Track chapter load
  useEffect(() => {
    if (!chapterData) {
      console.warn("[ChapterManager] No chapterData provided — waiting for fetch...");
      return;
    }

    console.group(`[ChapterManager] Loading chapter: ${chapterData.id || "unknown"}`);
    console.log("Title:", chapterData.title);
    console.log("Events found:", chapterData.events?.length ?? 0);
    console.log("Characters found:", chapterData.characters?.length ?? 0);
    console.groupEnd();

    // Reset progression safely
    const timeout = setTimeout(() => {
      console.log("[ChapterManager] Resetting event & dialog indices...");
      setEventIndex(0);
      setDialogIndex(0);
      calledChapterEndRef.current = false;
    }, 0);

    return () => clearTimeout(timeout);
  }, [chapterData]);

  // Memoized events
  const events = useMemo(() => chapterData?.events ?? [], [chapterData]);
  const currentEvent = events[eventIndex] ?? null;
  const dialogs = currentEvent?.dialogs ?? [];
  const currentDialog = dialogs[dialogIndex] ?? null;

  // Handle progression logic
  const handleNextDialog = () => {
    if (!events.length) {
      console.warn("[ChapterManager] No events found in current chapter.");
      return;
    }

    console.log(`[Progress] Event ${eventIndex + 1}/${events.length} | Dialog ${dialogIndex + 1}/${dialogs.length}`);

    // Go to next dialog
    if (dialogIndex + 1 < dialogs.length) {
      setDialogIndex((prev) => prev + 1);
      return;
    }

    // Go to next event
    if (eventIndex + 1 < events.length) {
      console.log(`[Progress] Moving to next event (${eventIndex + 2})`);
      setEventIndex((prev) => prev + 1);
      setDialogIndex(0);
      return;
    }

    // End of chapter
    if (!calledChapterEndRef.current) {
      calledChapterEndRef.current = true;
      console.log("[ChapterManager] Chapter complete! Triggering next chapter...");
      onNextChapter?.();
    }
  };

  // Handle missing data
  if (!chapterData || !events.length) {
    console.warn("[ChapterManager] Chapter data missing or empty.");
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-center text-white bg-black/80 p-6">
        <h1 className="text-3xl font-bold mb-4">No Scenes in this Chapter</h1>
        <p className="mb-2">Add events to this chapter JSON to play it.</p>
        <p className="text-sm text-gray-400">
          Expected structure: {"{ chapters: [ { events: [...] } ] }"}
        </p>
        <button
          onClick={() => {
            console.log("[Debug] Manually triggering next chapter...");
            onNextChapter?.();
          }}
          className="mt-4 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg"
        >
          Next Chapter
        </button>
      </div>
    );
  }

  // Main render
  return (
    <div className="relative w-full h-full">
      <GameScreen
        key={`${chapterData.id}-${eventIndex}-${dialogIndex}`}
        gameStart={true}
        data={chapterData}
        currentEvent={currentEvent}
        currentDialog={currentDialog}
        onNext={handleNextDialog}
        onChapterEnd={() => {
          if (!calledChapterEndRef.current) {
            calledChapterEndRef.current = true;
            console.log("[GameScreen] Chapter end triggered via onChapterEnd.");
            onNextChapter?.();
          }
        }}
      />

      {/* Debug button (always visible in bottom-right) */}
      <div className="absolute bottom-6 right-6 z-50">
        <button
          onClick={() => {
            console.log("[Debug Button] Forcing next chapter...");
            onNextChapter?.();
          }}
          className="px-4 py-2 bg-fuchsia-700 hover:bg-fuchsia-800 rounded-lg text-sm text-white shadow-md transition"
        >
          Next Chapter ▶
        </button>
      </div>
    </div>
  );
}
