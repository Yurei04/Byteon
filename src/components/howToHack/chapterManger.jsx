"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import GameScreen from "./gameScreen";
import ChapterIntro from "./chapterIntro";
import EndCredits from "./endCredits";

/**
 * ChapterManager - Exposes State to Parent
 * Now calls onStateChange callback to update parent with current progress
 */
export default function ChapterManager({ 
  chapterData, 
  onNextChapter, 
  onBackToMenu, 
  chapterGameIndex,
  onStateChange  // NEW: Callback to update parent with current state
}) {
  const [eventIndex, setEventIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showChapterIntro, setShowChapterIntro] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const calledChapterEndRef = useRef(false);
  const [endGame, setEndGame] = useState(false);

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

  // NEW: Notify parent of state changes
  useEffect(() => {
    if (onStateChange && showGame) {
      onStateChange({
        eventIndex,
        dialogIndex,
        isShowingMinigame
      });
    }
  }, [eventIndex, dialogIndex, isShowingMinigame, showGame, onStateChange]);

  // Reset chapter-level state when chapterData changes
useEffect(() => {
  if (!chapterData) {
    console.warn("[ChapterManager] No chapterData provided — waiting for fetch...");

    queueMicrotask(() => {
      setShowChapterIntro(false);
      setShowGame(false);
      setIsShowingMinigame(false);
      setMinigameJustCompleted(false);
    });

    return;
  }

  console.group(`[ChapterManager] Loading chapter: ${chapterData.id || "unknown"}`);
  console.log("Title:", chapterData.title);
  console.log("Events found:", chapterData.events?.length ?? 0);
  console.log("Characters found:", chapterData.characters?.length ?? 0);
  console.groupEnd();

  // Reset state safely (React-19 compliant)
  const timeout = setTimeout(() => {
    console.log("[ChapterManager] Resetting event & dialog indices...");

    queueMicrotask(() => {
      setEventIndex(0);
      setDialogIndex(0);
      calledChapterEndRef.current = false;
      setIsShowingMinigame(false);
      setMinigameJustCompleted(false);
      setShowGame(false);
      setShowChapterIntro(true);
    });
  }, 0);

  return () => clearTimeout(timeout);
}, [chapterData]);


  // Auto-start minigame when current event has a minigame and dialogs are finished
  useEffect(() => {
    if (!currentMinigame) {
      if (isShowingMinigame) {
        queueMicrotask(() => setIsShowingMinigame(false));
      }
      return;
    }

    if (minigameJustCompleted) return;

    if (allDialogsFinished && !isShowingMinigame) {
      queueMicrotask(() => setIsShowingMinigame(true));
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


    if (!calledChapterEndRef.current) {
      calledChapterEndRef.current = true;
      console.log("[ChapterManager] Chapter complete! Triggering next chapter...");
      
      // Check if this is the last chapter (chapter 5, index 4)
      if (chapterGameIndex === 4) {
        console.log("[ChapterManager] Final chapter complete! Showing end credits...");
        setEndGame(true);
        setShowGame(false);
      } else {
        onNextChapter?.();
      }
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
    
    // Log achievement/points  // WILL ADD AFTER LOGIN IN DONE
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

    console.log("[ChapterManager] Closing minigame UI...");
    setIsShowingMinigame(false);
    setMinigameJustCompleted(true); // Prevent retriggering

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
      <EndCredits/>
    );
  }

  if (chapterGameIndex === 6) {
    <EndCredits />
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
          currentDialog={isShowingMinigame ? null : currentDialog}
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
      )  : endGame ? (
        <EndCredits onComplete={() => {
          onBackToMenu()
        }} />
      
      ) : (
        <div>
          erorr in game loading...
        </div>
      )}
    </div>
  );
}