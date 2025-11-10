"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import GameScreen from "./gameScreen";

/**
 * ChapterManager
 * ------------------------
 * This component receives one normalized chapter object
 * from HowToHackPage and handles:
 *  - Passing it to GameScreen for rendering
 *  - Detecting end of chapter (calls onNextChapter)
 *  - Gracefully handling empty data
 *
 * Expected structure of `chapterData`:
 * {
 *   id: "chapter2",
 *   title: "Building the Team",
 *   events: [
 *     { id: "scene1", dialogs: [...] },
 *     { id: "scene2", dialogs: [...] },
 *     ...
 *   ],
 *   characters: [...]
 * }
 */
export default function ChapterManager({ chapterData, onNextChapter }) {
  const [eventIndex, setEventIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState(0);
  const calledChapterEndRef = useRef(false);

  // ✅ Reset indices when new chapter data arrives
  useEffect(() => {
    if (!chapterData) return;
    const timeout = setTimeout(() => {
      setEventIndex(0);
      setDialogIndex(0);
      calledChapterEndRef.current = false;
    }, 0);
    return () => clearTimeout(timeout);
  }, [chapterData]);

  // ✅ Memoize events so ESLint stops complaining about dependencies
  const events = useMemo(() => {
    return chapterData?.events ?? [];
  }, [chapterData]);

  const currentEvent = events[eventIndex] ?? null;
  const dialogs = currentEvent?.dialogs ?? [];
  const currentDialog = dialogs[dialogIndex] ?? null;

  // ✅ Handle progression logic
  const handleNextDialog = () => {
    if (!events.length) return;

    // Go to next dialog
    if (dialogIndex + 1 < dialogs.length) {
      setDialogIndex((prev) => prev + 1);
      return;
    }

    // Go to next event
    if (eventIndex + 1 < events.length) {
      setEventIndex((prev) => prev + 1);
      setDialogIndex(0);
      return;
    }

    // End of chapter — call next chapter once
    if (!calledChapterEndRef.current) {
      calledChapterEndRef.current = true;
      onNextChapter?.();
    }
  };

  // ✅ Handle case where chapterData or events are empty
  if (!chapterData || !events.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-center text-white bg-black/80 p-6">
        <h1 className="text-3xl font-bold mb-4">No Scenes in this Chapter</h1>
        <p className="mb-2">Add events to this chapter JSON to play it.</p>
        <p className="text-sm text-gray-400">
          Expected structure: {"{ chapters: [ { events: [...] } ] }"}
        </p>
      </div>
    );
  }

  // ✅ Render the current dialog and event
  return (
    <GameScreen
      key={`${chapterData.id}-${eventIndex}-${dialogIndex}`}
      gameStart={true}
      data={chapterData}
      currentEvent={currentEvent}
      currentDialog={currentDialog}
      onNext={handleNextDialog}
      onChapterEnd={onNextChapter}
    />
  );
}
