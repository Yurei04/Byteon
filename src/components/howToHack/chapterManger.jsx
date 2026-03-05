"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import GameScreen from "./gameScreen";
import ChapterIntro from "./chapterIntro";
import EndCredits from "./endCredits";
import { unlockNextChapter } from "./chapterUtils";
// ── ADDED ──
import { useAchievement } from "../achievements/achievementContext";

// ── ADDED: chapter completion achievements (fires when dialogs run out) ──
const CHAPTER_ACHIEVEMENTS = {
  1: { achievementId: "first_steps",                   title: "First Steps",                    description: "Completed Chapter 1: The Invitation.",           rewardPoints: 10 },
  2: { achievementId: "teamwork_makes_the_dream_work", title: "Teamwork Makes the Dream Work",  description: "Completed Chapter 2: Building the Team.",         rewardPoints: 10 },
  3: { achievementId: "innovation_spark",              title: "Innovation Spark",               description: "Completed Chapter 3: The Idea Sprint.",           rewardPoints: 10 },
  4: { achievementId: "first_hacker_medal",            title: "First Hacker Medal",             description: "Completed Chapter 4: Pitch Day.",                 rewardPoints: 10 },
  5: { achievementId: "from_rookie_to_hacker",         title: "From Rookie to Hacker",          description: "Completed the Epilogue: The First Hackathon.",    rewardPoints: 10 },
};

// ── ADDED: full visual novel completion (granted alongside the epilogue chapter achievement) ──
const NOVEL_COMPLETE_ACHIEVEMENT = {
  achievementId: "how_to_hack_complete",
  title: "How to Hack: Complete",
  description: "Finished the entire How to Hackathon visual novel. You're ready to hack!",
  rewardPoints: 50,
};

// ── ADDED: minigame achievements keyed by minigame_title.
//    Covers games that have no achievement block in their JSON.
//    Games that DO have a JSON block will use payload.achievement first (takes priority). ──
const MINIGAME_ACHIEVEMENTS = {
  "Hackathon Myth Buster": { achievementId: "hackathon_myth_buster", title: "Hackathon Myth Buster", description: "Busted every common hackathon myth. Confidence boosted!",              rewardPoints: 10 },
  "Team Builder":          { achievementId: "team_player",           title: "Team Player",           description: "Matched all roles correctly in the Team Builder challenge.",           rewardPoints: 15 },
  "Task Distribution":     { achievementId: "task_distributor",      title: "Task Distributor",      description: "Assigned every task to the right role. Clear roles, clean execution.", rewardPoints: 10 },
  "SDG Impact Builder — Scenario Solver": { achievementId: "sdg_scenario_master", title: "SDG Scenario Master", description: "Perfectly matched all problem-solution-SDG scenarios.",   rewardPoints: 15 },
  "Bug Response":          { achievementId: "bug_buster",            title: "Bug Buster",            description: "Debugged every scenario correctly. No bug survives your watch!",      rewardPoints: 10 },
  "Recording Ready":       { achievementId: "recording_ready",       title: "Recording Ready",       description: "Answered every pitch recording question perfectly.",                  rewardPoints: 10 },
  "Pitch Perfect":         { achievementId: "pitch_perfect",         title: "Pitch Perfect",         description: "Crafted the ideal pitch from intro to closing. Judges impressed!",    rewardPoints: 15 },
};

export default function ChapterManager({ 
  chapterData, 
  onNextChapter, 
  onBackToMenu, 
  chapterGameIndex,
  onStateChange,
  userId,           // ── ADDED ──
  grantAchievement, // ── ADDED ──
}) {
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

    // ── ADDED: grant chapter completion achievement ──
    if (userId && grantAchievement) {
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

      // ── ADDED: grant full novel achievement when epilogue finishes ──
      if (chapterGameIndex === 5) {
        await grantAchievement({
          userId,
          achievementId: NOVEL_COMPLETE_ACHIEVEMENT.achievementId,
          title: NOVEL_COMPLETE_ACHIEVEMENT.title,
          description: NOVEL_COMPLETE_ACHIEVEMENT.description,
          rewardPoints: NOVEL_COMPLETE_ACHIEVEMENT.rewardPoints,
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
  const handleMinigameComplete = async (payload) => {
    // Special "start" signal - ignore this, we handle it via tutorial now
    if (payload === "start") {
      console.log("[ChapterManager] Ignoring auto-start signal (using tutorial flow)");
      return;
    }

    console.log("[ChapterManager] 🎮 Minigame completed! Result:", payload);
    
    if (payload && typeof payload === "object") {
      if (payload.passed) {
        console.log("✅ Player PASSED the minigame!");

        // ── ADDED: grant minigame achievement ──
        // Priority: payload.achievement (from JSON) → MINIGAME_ACHIEVEMENTS map (hardcoded fallback)
        if (userId && grantAchievement) {
          const achFromPayload = payload.achievement;
          const achFromMap = MINIGAME_ACHIEVEMENTS[currentMinigame?.minigame_title];
          const ach = achFromPayload ?? achFromMap;

          if (ach) {
            console.log(`🏆 Granting minigame achievement: ${ach.title}`);
            // Derive a stable ID: prefer achievementId field, else slugify title
            const achievementId = ach.achievementId ?? (
              ach.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "_")
            );
            await grantAchievement({
              userId,
              achievementId,
              title: ach.title,
              description: ach.description,
              rewardPoints: ach.reward_points ?? ach.rewardPoints ?? 0,
            });
          }
        }
        // ── END ADDED ──

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