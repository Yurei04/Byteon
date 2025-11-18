/*
    Main Game Screen of the Visual Novel - Fixed Version
    Now properly detects and switches to minigame mode
*/

"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import GameDialogBox from "./gameDialogBox";
import MiniGameMultipleChoice from "./multipleChoiceMG";
import TrueOrFalseFlashGame from "./cardGame";

export default function GameScreen({
  data,
  currentEvent,
  currentDialog,
  currentMinigame, // Passed from ChapterManager when minigame should show
  isShowingMinigame, // Flag to indicate minigame mode
  onNext,
  onMinigameComplete,
  onNextChapter,
  chapterGameIndex,
  onChapterEnd = () => {},
  gameStart = true,
}) {
  // refs to avoid double-calling onChapterEnd
  const calledChapterEndRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Log when minigame state changes
  useEffect(() => {
    console.log("[GameScreen] Minigame State:", {
      hasMinigame: !!currentMinigame,
      isShowingMinigame,
      minigameType: currentMinigame?.minigame_type,
      currentEventId: currentEvent?.id
    });
  }, [currentMinigame, isShowingMinigame, currentEvent?.id]);

  // Build quick id -> index lookup for branching (choices)
  const events = useMemo(() => data?.events || [], [data]);
  const eventIdToIndex = useMemo(() => {
    const map = {};
    events.forEach((ev, idx) => {
      if (ev?.id) map[ev.id] = idx;
    });
    return map;
  }, [events]);

  const dialogs = currentEvent?.dialogs ?? [];

  // Resolve background: event-level overrides chapter-level
  const backgroundSrc = currentEvent?.background
    ? `/images/${currentEvent.background}`
    : data?.background
    ? `/images/${data.background}`
    : "/images/kaede.jpg";

  // Utility: map character name + pose -> image path
  const getCharacterPoseImage = (characterName, pose) => {
    if (!characterName) return null;
    const chars = data?.characters ?? [];
    const found = chars.find((c) => String(c.id).toLowerCase() === String(characterName).toLowerCase());
    const poseFile = found?.poses?.[pose] ?? null;
    if (poseFile) return `/images/characters/${poseFile}`;
    return `/images/${String(characterName).toLowerCase()}.jpg`;
  };

  const currentSpeaker = currentDialog?.character ?? "Narrator";
  const currentPose = currentDialog?.pose ?? "neutral";
  const charSrc = getCharacterPoseImage(currentSpeaker, currentPose);

  // When a user selects a choice, jump to the target event
  const handleChoiceSelect = (choice) => {
    if (!choice || !choice.nextScene) return;
    const targetId = choice.nextScene;
    const targetIndex = eventIdToIndex[targetId];
    
    console.log(`[GameScreen] Choice selected: ${choice.text}, jumping to: ${targetId}`);
    
    if (typeof targetIndex === "number") {
      // For now, we'll call onNext which will be handled by ChapterManager
      // In a more advanced setup, you'd have a separate callback for choices
      onNext();
    } else {
      // If target scene not found, treat as end-of-chapter
      console.warn(`[GameScreen] Target scene not found: ${targetId}`);
      if (!calledChapterEndRef.current) {
        calledChapterEndRef.current = true;
        Promise.resolve().then(() => {
          if (mountedRef.current) onChapterEnd();
        });
      }
    }
  };

  // If no events, show message
  if (!events.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen text-white bg-black/80">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Scenes in this chapter</h2>
          <p className="text-sm text-gray-400">Add events to this chapter JSON to play it.</p>
        </div>
      </div>
    );
  }

  // Determine what to render based on priority
  let contentToRender;

  if (currentMinigame && isShowingMinigame) {
    // PRIORITY 1: Show minigame
    console.log("[GameScreen] Rendering minigame:", currentMinigame.minigame_type);
    contentToRender = "minigame";
  } else if (currentEvent?.type === "choice") {
    // PRIORITY 2: Show choices
    console.log("[GameScreen] Rendering choice event");
    contentToRender = "choice";
  } else if (currentDialog) {
    // PRIORITY 3: Show dialog
    console.log("[GameScreen] Rendering dialog");
    contentToRender = "dialog";
  } else {
    // Fallback
    console.warn("[GameScreen] No content to render");
    contentToRender = "none";
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      {/* Background image */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={backgroundSrc}
          alt="background"
          fill
          className="object-cover transition-all duration-700 ease-in-out"
          priority
        />
      </div>

      {/* Character image - hide during minigame */}
      {charSrc && contentToRender !== "minigame" && (
        <div className="absolute bottom-0 left-10 z-10 pointer-events-none">
          <Image
            src={charSrc}
            width={550}
            height={550}
            alt={currentSpeaker}
            className="object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.6)]"
          />
        </div>
      )}

      {/* Dark gradient */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent z-20 pointer-events-none" />

      {/* Main content area */}
      <div className="absolute bottom-0 w-full z-30 px-4">
        <AnimatePresence mode="wait">
          {contentToRender === "minigame" && (
            <motion.div
              key="minigame"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto mb-8"
            >
              {currentMinigame.minigame_type === "TrueOrFalseFlashCard" ? (
                <TrueOrFalseFlashGame
                  minigameData={currentMinigame}
                  onComplete={onMinigameComplete}
                />
              ) : currentMinigame.minigame_type === "MultipleChoice" ? (
                <MiniGameMultipleChoice
                  minigameData={currentMinigame}
                  onComplete={onMinigameComplete}
                />
              ) : (
                <div className="bg-red-900/50 p-4 rounded-lg text-center">
                  <p className="text-white mb-2">Unknown minigame type: {currentMinigame.minigame_type}</p>
                  <button
                    onClick={onMinigameComplete}
                    className="mt-4 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg"
                  >
                    Skip Minigame
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {contentToRender === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl mx-auto mb-34 relative z-30"
            >
              <div className="rounded-xl overflow-hidden shadow-lg bg-black/60 border border-white/20 backdrop-blur-md p-4">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 100, duration: 0.5 }}
                  className="w-full max-w-4xl border-2 border-fuchsia-500 bg-black/70 backdrop-blur-sm p-6 flex flex-col justify-between rounded-xl shadow-2xl"
                >
                  {currentEvent.prompt && (
                    <div className="text-lg text-white mb-4 font-semibold">
                      {currentEvent.prompt}
                    </div>
                  )}

                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, duration: 0.5 }}
                    className="mt-4 grid gap-3"
                  >
                    {(currentEvent?.choices ?? []).map((choice, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => handleChoiceSelect(choice)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.05 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full text-left px-4 py-3 bg-fuchsia-900/20 hover:bg-fuchsia-700/40 border border-fuchsia-400/40 backdrop-blur-lg rounded-md text-white shadow-lg shadow-fuchsia-900/30 cursor-pointer"
                      >
                        {choice.text}
                      </motion.button>
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {contentToRender === "dialog" && (
            <motion.div
              key="dialog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl mx-auto mb-34 relative z-30"
            >
              <div className="rounded-xl overflow-hidden shadow-lg bg-black/60 border border-white/20 backdrop-blur-md p-4">
                <GameDialogBox
                  chapterGameIndex={chapterGameIndex}
                  onNextChapter={onNextChapter}
                  text={currentDialog?.text ?? ""}
                  character={currentDialog?.character ?? "Narrator"}
                  chapter={data?.id ?? ""}
                  onNext={onNext}
                />
              </div>
            </motion.div>
          )}

          {contentToRender === "none" && (
            <div className="w-full max-w-3xl mx-auto mb-34 text-center text-white">
              <p>Loading next scene...</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}