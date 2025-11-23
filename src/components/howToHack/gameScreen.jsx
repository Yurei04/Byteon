"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import GameDialogBox from "./gameDialogBox";
import TrueOrFalseFlashGame from "./cardGame";
import IdeaBuilderMiniGame from "./ideaBuilderMG";
import MiniGameMultipleChoice from "./multipleChoiceMG";
import IdeaBuilderDragDrop from "./ideaBuilderMG";
import GameNav from "./gameNav";

export default function GameScreen({
  data,
  currentEvent,
  currentDialog,
  currentMinigame,
  isShowingMinigame,
  onNext,
  onMinigameComplete,
  onNextChapter,
  chapterGameIndex,
  onChapterEnd = () => {},
  gameStart = true,
}) {
  const dialogs = currentEvent?.dialogs ?? [];

  // Minigame auto-start detector
  const startMiniGame =
    !!currentMinigame &&
    currentDialog == null &&
    !isShowingMinigame;

  useEffect(() => {
    if (startMiniGame) {
      console.log("[GameScreen] Auto-start minigame triggered.");
      onMinigameComplete("start");
    }
  }, [startMiniGame, onMinigameComplete]);

  const calledChapterEndRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  // Debug logs
  useEffect(() => {
    console.log("[GameScreen] Minigame State:", {
      hasMinigame: !!currentMinigame,
      isShowingMinigame,
      minigameType: currentMinigame?.minigame_type,
      eventId: currentEvent?.id,
      currentDialogExists: !!currentDialog
    });
  }, [currentMinigame, isShowingMinigame, currentEvent?.id, currentDialog]);

  // Background
  const backgroundSrc = currentEvent?.background
    ? `/images/${currentEvent.background}`
    : data?.background
    ? `/images/${data.background}`
    : "/images/kaede.jpg";

  // Get character image - now directly from dialog.image
  const getCharacterImage = (dialog) => {
    if (!dialog) return null;
    
    const character = dialog.character;
    
    // Don't show images for Narrator or You
    if (!character || character === "Narrator" || character === "You") {
      return null;
    }
    
    // If dialog has direct image path, use it
    if (dialog.image) {
      console.log("[Character Image - Direct]", dialog.image);
      return dialog.image;
    }
    
    // Fallback: construct from character + pose (backward compatibility)
    const pose = dialog.pose || "neutral";
    const fallbackPath = `/images/${character.toLowerCase()}_${pose.toLowerCase()}.png`;
    console.log("[Character Image - Fallback]", fallbackPath);
    return fallbackPath;
  };

  const currentSpeaker = currentDialog?.character ?? "Narrator";
  const charSrc = getCharacterImage(currentDialog);

  // Render priority
  let contentToRender;

  if (currentMinigame && isShowingMinigame) {
    contentToRender = "minigame";
  } else if (currentEvent?.type === "choice") {
    contentToRender = "choice";
  } else if (currentDialog) {
    contentToRender = "dialog";
  } else {
    contentToRender = "none";
  }

  // No events fallback
  if (!data?.events?.length) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen text-white bg-black/80">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">No Scenes in this chapter</h2>
          <p className="text-sm text-gray-400">
            Add events to this chapter JSON to play it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden text-white">
      <div className="absolute flex justify-start items-start z-30 pointer-events-none">
        <GameNav />
      </div>
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={"/images/temp_bkg.jpg"}
          alt="background"
          fill
          className="object-cover transition-all duration-700 ease-in-out rounded-2xl"
          priority
        />
      </div>


      {/* CHARACTER — HIDDEN DURING MINI GAME */}
      {charSrc && contentToRender !== "minigame" && (
        <div className="absolute flex justify-center items-start z-10 pointer-events-none w-[400px] h-[400px]">
          <Image
            src={charSrc}
            alt={currentSpeaker}
            fill
            className="object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.6)]"
          />
        </div>
      )}


      {/* GRADIENT */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent z-20 pointer-events-none" />

      {/* MAIN CONTENT */}
      <div className="absolute bottom-0 w-full z-30 px-4">
        <AnimatePresence mode="wait">
          {contentToRender === "minigame" && currentMinigame && (
          <motion.div
            key="minigame"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-4xl mx-auto mb-8"
          >
            {/* TRUE OR FALSE GAME */}
            {currentMinigame.minigame_type === "TrueOrFalseFlashCard" && (
              <TrueOrFalseFlashGame
                minigameData={currentMinigame}
                onComplete={onMinigameComplete}
              />
            )}

            {/* MULTIPLE CHOICE - Original format */}
            {currentMinigame.minigame_type === "MultipleChoice" && currentMinigame.tasks && (
              <MiniGameMultipleChoice
                minigameData={currentMinigame}
                onComplete={onMinigameComplete}
              />
            )}

            {/* SEQUENTIAL IDEA BUILDER - New task-based format */}
            {currentMinigame.minigame_type === "IdeaBuilderMiniGame" && currentMinigame.builds && (
              <IdeaBuilderDragDrop
                minigameData={currentMinigame}
                onComplete={onMinigameComplete}
              />
            )}

            {/* UNKNOWN MINIGAME TYPE */}
            {currentMinigame.minigame_type !== "TrueOrFalseFlashCard" && 
              currentMinigame.minigame_type !== "MultipleChoice" && 
              currentMinigame.minigame_type !== "IdeaBuilderMiniGame" && (
              <div className="bg-red-900/50 p-4 rounded-lg text-center">
                <p className="text-white mb-2">Unknown minigame type: {currentMinigame?.minigame_type}</p>
                <p className="text-white/70 text-sm mb-4">Expected: TrueOrFalseFlashCard, MultipleChoice, SequentialIdeaBuilder, or MixAndMatch</p>
                <button
                  onClick={() => onMinigameComplete({})}
                  className="mt-4 px-6 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg"
                >
                  Skip Minigame
                </button>
              </div>
            )}
          </motion.div>
        )}


          {/* CHOICE EVENT */}
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
                  className="w-full max-w-4xl border-2 border-fuchsia-500 bg-black/70 backdrop-blur-sm p-6 rounded-xl shadow-2xl"
                >
                  {currentEvent.prompt && (
                    <div className="text-lg text-white mb-4 font-semibold">
                      {currentEvent.prompt}
                    </div>
                  )}

                  <div className="mt-4 grid gap-3">
                    {(currentEvent?.choices ?? []).map((choice, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => onNext(choice)}
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
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* NORMAL DIALOG MODE */}
          {contentToRender === "dialog" && (
            <motion.div
              key="dialog"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl mx-auto mb-20 relative z-30"
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

          {/* NO CONTENT (loading) */}
          {contentToRender === "none" && (
            <div className="w-full max-w-3xl mx-auto mb-34 text-center text-white">
              <p>Loading next scene...</p>
              <p>Error in Loading Scenes</p>
              
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}