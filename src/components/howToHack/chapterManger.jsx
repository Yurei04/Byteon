"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import GameScreen from "./gameScreen";
import ChapterIntro from "./chapterIntro";
import EndCredits from "./endCredits";

export default function ChapterManager({ chapterData, onNextChapter, onBackToMenu, chapterGameIndex }) {
  const [eventIndex, setEventIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showChapterIntro, setShowChapterIntro] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const calledChapterEndRef = useRef(false);

  // minigame state
  const [isShowingMinigame, setIsShowingMinigame] = useState(false);
  const [minigameJustCompleted, setMinigameJustCompleted] = useState(false);

  // Memoized events
  const events = useMemo(() => chapterData?.events ?? [], [chapterData]);
  const currentEvent = events[eventIndex] ?? null;
  const dialogs = currentEvent?.dialogs ?? [];
  const currentDialog = dialogs[dialogIndex] ?? null;

  // current minigame (if any)
  const currentMinigame = currentEvent?.minigame ?? null;

  // Whether all dialogs for the current event have been shown
  const allDialogsFinished = dialogIndex >= dialogs.length;

  // Reset chapter-level state when chapterData changes
  useEffect(() => {
    if (!chapterData) {
      console.warn("[ChapterManager] No chapterData provided — waiting for fetch...");
      setShowChapterIntro(false);
      setShowGame(false);
      setIsShowingMinigame(false);
      setMinigameJustCompleted(false);
      return;
    }

    console.group(`[ChapterManager] Loading chapter: ${chapterData.id || "unknown"}`);
    console.log("Title:", chapterData.title);
    console.log("Events found:", chapterData.events?.length ?? 0);
    console.log("Characters found:", chapterData.characters?.length ?? 0);
    console.groupEnd();

    // Reset state safely
    const timeout = setTimeout(() => {
      console.log("[ChapterManager] Resetting event & dialog indices...");
      setEventIndex(0);
      setDialogIndex(0);
      calledChapterEndRef.current = false;
      setIsShowingMinigame(false);
      setMinigameJustCompleted(false);
      // Show per-chapter intro for user to start or stay
      setShowGame(false);
      setShowChapterIntro(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [chapterData]);

  // Auto-start minigame when current event has a minigame and dialogs are finished
  useEffect(() => {
    if (!currentMinigame) {
      // No minigame in this event — ensure flag is false
      if (isShowingMinigame) setIsShowingMinigame(false);
      return;
    }

    // Don't retrigger if we just completed this minigame
    if (minigameJustCompleted) {
      return;
    }

    // If all dialogs finished and we are not already showing the minigame, show it
    if (allDialogsFinished && !isShowingMinigame) {
      console.log("[ChapterManager] Dialogs finished and minigame exists -> opening minigame UI");
      setIsShowingMinigame(true);
    }
  }, [currentMinigame, allDialogsFinished, isShowingMinigame, minigameJustCompleted]);

  // Handle progression logic (dialogs -> events -> chapter end)
  const handleNextDialog = () => {
    if (!events.length) {
      console.warn("[ChapterManager] No events found in current chapter.");
      return;
    }

    console.log(
      `[Progress] Event ${eventIndex + 1}/${events.length} | Dialog ${Math.min(dialogIndex + 1, dialogs.length)}/${dialogs.length}`
    );

    // If we're currently showing a minigame, ignore dialog progression
    if (isShowingMinigame) {
      console.log("[ChapterManager] In minigame mode — dialog progression paused.");
      return;
    }

    // 1) more dialogs in current event
    if (dialogIndex + 1 < dialogs.length) {
      setDialogIndex((prev) => prev + 1);
      return;
    }

    // If we've shown all dialogs for this event and a minigame exists and NOT completed, wait
    if (currentMinigame && !isShowingMinigame && !minigameJustCompleted) {
      console.log("[ChapterManager] Reached end of dialogs — starting minigame instead of advancing.");
      setIsShowingMinigame(true);
      return;
    }

    // 2) more events in chapter (sequential)
    if (eventIndex + 1 < events.length) {
      console.log(`[Progress] Moving to next event (${eventIndex + 2})`);
      setEventIndex((prev) => prev + 1);
      setDialogIndex(0);
      setIsShowingMinigame(false);
      setMinigameJustCompleted(false); // Reset for next event
      return;
    }

    // 3) no more events -> chapter finished
    if (!calledChapterEndRef.current) {
      calledChapterEndRef.current = true;
      console.log("[ChapterManager] Chapter complete! Triggering next chapter...");
      onNextChapter?.();
    }
  };

  // Handler for minigame completion
  const handleMinigameComplete = (payload) => {
    // Special "start" signal
    if (payload === "start") {
      if (!currentMinigame) {
        console.warn("[ChapterManager] Received start signal but no minigame present.");
        return;
      }
      if (!isShowingMinigame) {
        console.log("[ChapterManager] Opening minigame UI.");
        setIsShowingMinigame(true);
      }
      return;
    }

    // CRITICAL: Minigame completed!
    console.log("[ChapterManager] 🎮 Minigame completed! Result:", payload);
    
    // Log achievement/points
    if (payload && typeof payload === "object") {
      if (payload.passed) {
        console.log("✅ Player PASSED the minigame!");
        if (payload.achievement) {
          console.log(`🏆 Achievement unlocked: ${payload.achievement.title}`);
          console.log(`💰 Points awarded: ${payload.achievement.reward_points}`);
        }
      } else {
        console.log("❌ Player failed/skipped the minigame");
      }
    }

    // CRITICAL FIX: Close minigame and mark as completed
    console.log("[ChapterManager] Closing minigame UI...");
    setIsShowingMinigame(false);
    setMinigameJustCompleted(true); // Prevent retriggering
    
    // CRITICAL FIX: Advance to NEXT EVENT after short delay
    setTimeout(() => {
      console.log("[ChapterManager] Auto-advancing to next event after minigame...");
      
      // Move to next event
      if (eventIndex + 1 < events.length) {
        console.log(`[ChapterManager] ➡️ Moving to event ${eventIndex + 2}`);
        setEventIndex((prev) => prev + 1);
        setDialogIndex(0);
        setMinigameJustCompleted(false); // Reset for next potential minigame
      } else {
        // Chapter complete
        console.log("[ChapterManager] 🏁 Chapter complete after minigame!");
        if (!calledChapterEndRef.current) {
          calledChapterEndRef.current = true;
          onNextChapter?.();
        }
      }
    }, 300);
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
      {showChapterIntro ? (
        <ChapterIntro
          title={chapterData.title}
          visible={true}
          onStart={() => {
            setShowChapterIntro(false);
            setShowGame(true);
          }}
          onStay={() => {
            setShowChapterIntro(false);
            setShowGame(false);
            if (onBackToMenu) onBackToMenu();
          }}
        />
      ) : showGame ? (
        <GameScreen
          chapterGameIndex={chapterGameIndex}
          key={`${chapterData.id}-${eventIndex}-${dialogIndex}-${isShowingMinigame}`}
          gameStart={true}
          onNextChapter={onNextChapter}
          data={chapterData}
          currentEvent={currentEvent}
          // If we're in minigame mode we set currentDialog to null so GameScreen knows dialogs finished.
          currentDialog={isShowingMinigame ? null : currentDialog}
          // Pass minigame only when showing it to avoid confusion in GameScreen
          currentMinigame={isShowingMinigame ? currentMinigame : null}
          isShowingMinigame={isShowingMinigame}
          onNext={handleNextDialog}
          onMinigameComplete={handleMinigameComplete}
          onChapterEnd={() => {
            if (!calledChapterEndRef.current) {
              calledChapterEndRef.current = true;
              console.log("[GameScreen] Chapter end triggered via onChapterEnd.");
              onNextChapter?.();
            }
          }}
        />
      ) : showChapterIntro && onNextChapter ? (
        <ChapterIntro
          title={chapterData.title}
          visible={true}
          onStart={() => {
            setShowChapterIntro(false);
            setShowGame(true);
          }}
          onStay={() => {
            setShowChapterIntro(false);
            setShowGame(false);
            if (onBackToMenu) onBackToMenu();
          }}
        />
      ) : (
        <EndCredits />
      )}
    </div>
  );
}