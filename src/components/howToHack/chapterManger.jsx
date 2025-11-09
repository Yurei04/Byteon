"use client";

import React, { useState, useEffect, useRef } from "react";
import GameScreen from "./GameScreen";

import chapter1 from "@/public/data/chapter1.json";
import chapter2 from "@/public/data/chapter2.json";
import chapter3 from "@/public/data/chapter3.json";
import chapter4 from "@/public/data/chapter4.json";
import chapter5 from "@/public/data/chapter5.json";

const chapters = {
  1: chapter1,
  2: chapter2,
  3: chapter3,
  4: chapter4,
  5: chapter5,
};

export default function ChapterManager() {
  const [currentChapter, setCurrentChapter] = useState(1);
  const [chapterData, setChapterData] = useState(null);
  const mountedRef = useRef(true);

  // ensure mountedRef is updated on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Clear previous data immediately, then load new data
  useEffect(() => {
    // Clear immediately so UI doesn't still show old chapter content
    setChapterData(null);

    // async loader to avoid the "setState synchronously in effect" lint
    const load = async () => {
      // small micro-delay is optional but can help avoid render interleaving
      // await new Promise((r) => setTimeout(r, 0));

      const data = chapters[currentChapter] ?? null;

      // defensive: if loaded data is empty object or has no meaningful content, treat as null
      const hasData = data && Object.keys(data).length > 0;
      if (!mountedRef.current) return;
      setChapterData(hasData ? data : null);
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapter]);

  // Called by GameScreen (or your top-level game logic) when the chapter is finished
  const handleNextChapter = () => {
    setCurrentChapter((prev) => {
      if (prev < 5) return prev + 1;
      // last chapter reached — keep current or handle end-of-game here
      console.log("All chapters completed");
      return prev;
    });
  };

  // If chapter data is empty, show "No Data Collected" screen (no skip button)
  if (!chapterData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center text-white bg-black">
        <h1 className="text-3xl font-bold mb-4">No Data Collected</h1>
        <p className="mb-6">Chapter {currentChapter} data is empty.</p>
      </div>
    );
  }

  // Key ensures remount of GameScreen when chapter changes
  return (
    <GameScreen
      key={currentChapter}
      data={chapterData}
      onChapterEnd={handleNextChapter} // GameScreen must call this when chapter truly ends
    />
  );
}
