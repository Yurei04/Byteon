// src/components/howToHack/ChapterManager.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import GameScreen from "./gameScreen";

// Import your chapter files (adjust paths if needed).
// Each file is expected to follow your new format: { "chapters": [...], "characters": [...] }
import rawChapter1 from "@/public/data/chapter1.json";
import rawChapter2 from "@/public/data/chapter2.json";
import rawChapter3 from "@/public/data/chapter3.json";
import rawChapter4 from "@/public/data/chapter4.json";
import rawChapter5 from "@/public/data/chapter5.json";

const rawMap = {
  1: rawChapter1,
  2: rawChapter2,
  3: rawChapter3,
  4: rawChapter4,
  5: rawChapter5,
};

export default function ChapterManager({ startChapter = 1 }) {
  const [currentChapter, setCurrentChapter] = useState(startChapter);
  const [chapterData, setChapterData] = useState(null); // will hold a single chapter object, not the file wrapper
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  // Immediately clear previous data, then load the new chapter object from the imported file.
  useEffect(() => {
    setChapterData(null);

    const load = async () => {
      // Load the raw file
      const raw = rawMap[currentChapter] ?? null;

      // Defensive: the file might be empty or might have "chapters" array
      const hasChaptersArray = raw && Array.isArray(raw.chapters) && raw.chapters.length > 0;
      const chapterObj = hasChaptersArray ? raw.chapters[0] : null;

      // Attach characters array (if present in file root) for GameScreen convenience
      if (chapterObj) {
        // clone to avoid accidental mutation
        const data = { ...chapterObj, characters: raw.characters ?? [] };
        if (!mountedRef.current) return;
        setChapterData(data);
      } else {
        if (!mountedRef.current) return;
        setChapterData(null);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter]);

  const handleNextChapter = () => {
    setCurrentChapter((prev) => {
      const last = Object.keys(rawMap).length;
      if (prev < last) return prev + 1;
      console.log("All chapters completed");
      return prev;
    });
  };

  // If no data for current chapter -> show "No Data Collected" (no skip button)
  if (!chapterData) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen text-center text-white bg-black/80 p-6">
        <h1 className="text-3xl font-bold mb-4">No Data Collected</h1>
        <p className="mb-2">Chapter {currentChapter} data is empty.</p>
        <p className="text-sm text-gray-400">Waiting for content (or fill `/public/data/chapter{n}.json`).</p>
      </div>
    );
  }

  // key forces remount so GameScreen's internal indices reset cleanly
  return (
    <GameScreen
      key={currentChapter}
      data={chapterData}
      onChapterEnd={handleNextChapter}
    />
  );
}
