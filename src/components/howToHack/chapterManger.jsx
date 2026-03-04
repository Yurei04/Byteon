"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import GameScreen from "./gameScreen";
import ChapterIntro from "./chapterIntro";
import EndCredits from "./endCredits";
import { unlockNextChapter } from "./chapterUtils";
// ── ADDED ──
import { useAchievement } from "../achievements/achievementContext";

// ── ADDED: one entry per chapter — edit titles/descriptions freely ──
const CHAPTER_ACHIEVEMENTS = {
  1: { achievementId: "first_steps",        title: "First Steps",        description: "Completed Chapter 1 of How to Hackathon.", rewardPoints: 10 },
  2: { achievementId: "chapter_2_complete", title: "Deeper In",          description: "Completed Chapter 2 of How to Hackathon.", rewardPoints: 10 },
  3: { achievementId: "chapter_3_complete", title: "Halfway There",      description: "Completed Chapter 3 of How to Hackathon.", rewardPoints: 10 },
  4: { achievementId: "chapter_4_complete", title: "Almost There",       description: "Completed Chapter 4 of How to Hackathon.", rewardPoints: 10 },
  5: { achievementId: "chapter_5_complete", title: "How to Hackathon",   description: "Completed all chapters. You're ready to hack!", rewardPoints: 20 },
};

export default function ChapterManager({ 
  chapterData, 
  onNextChapter, 
  onBackToMenu, 
  chapterGameIndex,
  onStateChange,
  userId, // ── ADDED ──
}) {
  // ── ADDED ──
  const { grantAchievement } = useAchievement();

  const [eventIndex, setEventIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState(0);
  const [showChapterIntro, setShowChapterIntro] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const calledChapterEndRef = useRef(false);
  const [endGame, setEndGame] = useState(false);

  // Minigame state
  const [isShowingMinigame, setIsShowingMinigame] = useState(false);
  const [minigameJustCompleted, setMinigameJustCompleted] = useState(false);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialShownForEvent, setTutorialShownForEvent] = useState(new Set());

  // Memoized events
  const events = useMemo(() => chapterData?.events ?? [], [chapterData]);
  const currentEvent = events[eventIndex] ?? null;
  const dialogs = currentEvent?.dialogs ?? [];
  const currentDialog = dialogs[dialogIndex] ?? null;

  // Current minigame (if any)
  const currentMinigame = currentEvent?.minigame ?? null;

  // Whether all dialogs for the current event have been shown
  const allDialogsFinished = dialogIndex >= dialogs.length;

  // Notify parent of state changes
  useEffect(() => {
    if (onStateChange && showGame) {
      onStateChange({
        eventIndex,
        dialogIndex,
        isShowingMinigame,
        showTutorial
      });
    }
  }, [eventIndex, dialogIndex, isShowingMinigame, showTutorial, showGame, onStateChange]);

  // Reset chapter-level state when chapterData changes
  useEffect(() => {
    if (!chapterData) {
      console.warn("[ChapterManager] No chapterData provided — waiting for fetch...");

      queueMicrotask(() => {
        setShowChapterIntro(false);
        setShowGame(false);
        setIsShowingMinigame(false);
        setMinigameJustCompleted(false);
        setShowTutorial(false);
        setTutorialShownForEvent(new Set());
      });

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

      queueMicrotask(() => {
        setEventIndex(0);
        setDialogIndex(0);
        calledChapterEndRef.current = false;
        setIsShowingMinigame(false);
        setMinigameJustCompleted(false);
        setShowGame(false);
        setShowChapterIntro(true);
        setShowTutorial(false);
        setTutorialShownForEvent(new Set());
      });
    }, 0);

    return () => clearTimeout(timeout);
  }, [chapterData]);

  // Handle tutorial completion
  const handleTutorialComplete = () => {
    console.log("[ChapterManager] ✅ Tutorial completed");
    const eventKey = `${chapterData?.id}-${eventIndex}`;
    setTutorialShownForEvent(prev => new Set([...prev, eventKey]));
    setShowTutorial(false);
    
    // Start the actual minigame after tutorial
    setTimeout(() => {
      console.log("[ChapterManager] 🎮 Starting minigame after tutorial");
      setIsShowingMinigame(true);
    }, 100);
  };

  // ✨ NEW: Function to mark chapter as completed and unlock next chapter
  const handleChapterComplete = async () => {
    if (calledChapterEndRef.current) {
      return; // Already called
    }
    
    calledChapterEndRef.current = true;
    console.log(`[ChapterManager] 🎉 Chapter ${chapterGameIndex} complete!`);
    
    // Update database to unlock next chapter
    try {
      const result = await unlockNextChapter(chapterGameIndex);
      
      if (result.success) {
        console.log(`[ChapterManager]  ${result.message}`);
        console.log(`[ChapterManager] Chapter ${chapterGameIndex} marked as completed`);
        console.log(`[ChapterManager] Chapter ${chapterGameIndex + 1} is now unlocked`);
      } else {
        console.error(`[ChapterManager]  Failed to unlock next chapter:`, result.message);
      }
    } catch (error) {
      console.error("[ChapterManager]  Error updating chapter progress:", error);
    }

    // ── ADDED: grant chapter achievement when dialogs run out ──
    if (userId) {
      const ach = CHAPTER_ACHIEVEMENTS[chapterGameIndex];
      if (ach) {
        await grantAchievement({
          userId,
          achievementId: ach.achievementId,
          title: ach.title,
          description: ach.description,
          rewardPoints: ach.rewardPoints,
        });
      }
    }
    // ── END ADDED ──
    
    // Handle final chapter vs regular chapter
    if (chapterGameIndex === 5) {
      console.log("[ChapterManager] Final chapter complete! Showing end credits...");
      setEndGame(true);
      setShowGame(false);
    } else {
      console.log(`[ChapterManager] Moving to chapter ${chapterGameIndex + 1}`);
      onNextChapter?.();
    }
  };

  // Handle progression logic (dialogs -> events -> chapter end)
  const handleNextDialog = () => {
    if (!events.length) {
      console.warn("[ChapterManager] No events found in current chapter.");
      return;
    }

    console.log(
      `[Progress] Event ${eventIndex + 1}/${events.length} | Dialog ${Math.min(dialogIndex + 1, dialogs.length)}/${dialogs.length}`
    );

    // If we're currently showing a tutorial or minigame, ignore dialog progression
    if (showTutorial || isShowingMinigame) {
      console.log("[ChapterManager] In tutorial/minigame mode — dialog progression paused.");
      return;
    }

    // 1) More dialogs in current event
    if (dialogIndex + 1 < dialogs.length) {
      console.log("[ChapterManager] Advancing to next dialog");
      setDialogIndex((prev) => prev + 1);
      return;
    }

    // 2) All dialogs finished - check for minigame
    const eventKey = `${chapterData?.id}-${eventIndex}`;
    if (currentMinigame && !minigameJustCompleted) {
      console.log("[ChapterManager] All dialogs finished, minigame detected");
      
      // Check if tutorial has been shown for this event
      if (!tutorialShownForEvent.has(eventKey)) {
        console.log("[ChapterManager] 📚 Showing tutorial for minigame");
        setShowTutorial(true);
        return;
      } else {
        console.log("[ChapterManager] 🎮 Tutorial already shown, starting minigame directly");
        setIsShowingMinigame(true);
        return;
      }
    }

    // 3) More events in chapter
    if (eventIndex + 1 < events.length) {
      console.log(`[Progress] Moving to next event (${eventIndex + 2})`);
      setEventIndex((prev) => prev + 1);
      setDialogIndex(0);
      setIsShowingMinigame(false);
      setMinigameJustCompleted(false);
      setShowTutorial(false);
      return;
    }

    // 4) Chapter complete - call the new function
    handleChapterComplete();
  };

  // Handler for minigame completion
  const handleMinigameComplete = (payload) => {
    // Special "start" signal - ignore this, we handle it via tutorial now
    if (payload === "start") {
      console.log("[ChapterManager] Ignoring auto-start signal (using tutorial flow)");
      return;
    }

    console.log("[ChapterManager] 🎮 Minigame completed! Result:", payload);
    
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
    setMinigameJustCompleted(true);

    setTimeout(() => {
      console.log("[ChapterManager] Auto-advancing to next event after minigame...");
      
      if (eventIndex + 1 < events.length) {
        console.log(`[ChapterManager] ➡️ Moving to event ${eventIndex + 2}`);
        setEventIndex((prev) => prev + 1);
        setDialogIndex(0);
        setMinigameJustCompleted(false);
        setShowTutorial(false);
      } else {
        console.log("[ChapterManager] 🏁 Chapter complete after minigame!");
        handleChapterComplete();
      }
    }, 300);
  };

  // Handle missing data
  if (!chapterData || !events.length) {
    console.warn("[ChapterManager] Chapter data missing or empty.");
    return <EndCredits />;
  }

  if (chapterGameIndex === 6) {
    return <EndCredits />;
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
          key={`${chapterData.id}-${eventIndex}-${dialogIndex}-${isShowingMinigame}-${showTutorial}`}
          gameStart={true}
          onNextChapter={handleChapterComplete}
          data={chapterData}
          currentEvent={currentEvent}
          currentDialog={showTutorial || isShowingMinigame ? null : currentDialog}
          currentMinigame={(showTutorial || isShowingMinigame) ? currentMinigame : null}
          isShowingMinigame={isShowingMinigame}
          tutorial={showTutorial}
          onTutorialComplete={handleTutorialComplete}
          onNext={handleNextDialog}
          onMinigameComplete={handleMinigameComplete}
          onChapterEnd={handleChapterComplete}
        />
      ) : endGame ? (
        <EndCredits onComplete={() => {
          onBackToMenu();
        }} />
      ) : (
        <div>Error in game loading...</div>
      )}
    </div>
  );
}