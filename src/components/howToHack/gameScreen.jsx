/*
    Main Game Screen of the Visual Novel
*/


"use client";
import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef, useMemo } from "react";
import Image from "next/image";
import GameDialogBox from "./gameDialogBox";
import MiniGameMultipleChoice from "./multipleChoiceMG";
import CardGame from "./cardGame";
/*
  Expectations for `data` (one chapter object): // missing mini game and tips and resources
  {
    id: "chapter2",
    title: "Building the Team",
    background: "your_room_morning.jpg",
    music: "gentle_morning_theme.mp3",
    events: [ { id:"scene1", dialogs: [...] , background?, music?, type?, choices? }, ... ],
    characters: [ { id: "You", poses: { neutral: "you_neutral.png", ... } }, ... ]

    
  }
*/

export default function GameScreen({
  data, miniGames, multipleChoiceComponent, CardGameComponent, onNextChapter, isFirstChapter,
  onChapterEnd = () => {},
  // optional: whether the game is considered started
  gameStart = true,
}) {
  // progression state (owned by GameScreen)
  const [eventIndex, setEventIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState(0);

  // refs to avoid double-calling onChapterEnd
  const calledChapterEndRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Reset progression indices when new chapter data arrives
  useEffect(() => {
  if (!data || data.length === 0) return; // No data, do nothing
    // Use microtask to defer state reset until after paint
    const timeout = setTimeout(() => {
      setEventIndex(0);
      setDialogIndex(0);
      calledChapterEndRef.current = false;
    }, 0);

    return () => clearTimeout(timeout);
  }, [data]);


  // events list (rename from 'scenarios' previously)
  const events = useMemo(() => {
    return data?.events || [];
  }, [data]);


  // Build quick id -> index lookup for branching (choices)
  const eventIdToIndex = useMemo(() => {
    const map = {};
    events.forEach((ev, idx) => {
      if (ev?.id) map[ev.id] = idx;
    });
    return map;
  }, [events]);

  const currentEvent = events[eventIndex] ?? null;
  const dialogs = currentEvent?.dialogs ?? [];
  const currentDialog = dialogs[dialogIndex] ?? null;

  // Resolve background: event-level overrides chapter-level, fall back to /images/kaede.jpg
  const backgroundSrc = currentEvent?.background
    ? `/images/${currentEvent.background}`
    : data?.background
    ? `/images/${data.background}`
    : "/images/kaede.jpg";

  // Utility: map character name + pose -> image path using data.characters list
  const getCharacterPoseImage = (characterName, pose) => {
    if (!characterName) return null;
      const chars = data?.characters ?? [];
      const found = chars.find((c) => String(c.id).toLowerCase() === String(characterName).toLowerCase());
      const poseFile = found?.poses?.[pose] ?? null;
    if (poseFile) return `/images/characters/${poseFile}`; // expects your files under /public/images/characters/
    // fallback: try generic `/images/<name>.jpg`
    return `/images/${String(characterName).toLowerCase()}.jpg`;
  };

  // Determine who should be shown as "character" for the static character sprite layer.
  // Prefer currentDialog.character
  const currentSpeaker = currentDialog?.character ?? "Narrator";
  const currentPose = currentDialog?.pose ?? "neutral";
  const charSrc = getCharacterPoseImage(currentSpeaker, currentPose);

  // Progression logic: move through dialogs -> events -> chapter end
  const progressToNext = () => {
    // If the current event is a choice-type, we don't auto-advance — choices must be chosen.
    if (currentEvent?.type === "choice") {
      // Do nothing — UI presents choices
      return;
    }

    // 1) more dialogs in current event
    if (dialogIndex + 1 < (dialogs?.length ?? 0)) {
      setDialogIndex((d) => d + 1);
      return;
    }

    // 2) more events in chapter (sequential)
    if (eventIndex + 1 < events.length) {
      setEventIndex((e) => e + 1);
      setDialogIndex(0);
      return;
    }

    // 3) no more events -> chapter finished, call onChapterEnd once
    if (!calledChapterEndRef.current) {
      calledChapterEndRef.current = true;
      // schedule on next microtask to avoid sync state updates during render
      Promise.resolve().then(() => {
        if (mountedRef.current) onChapterEnd();
      });
    }
  };

  // When a user selects a choice (from a choice event), jump to the event with id=choice.nextScene
  const handleChoiceSelect = (choice) => {
    if (!choice || !choice.nextScene) return;
    const targetId = choice.nextScene;
    const targetIndex = eventIdToIndex[targetId];
    if (typeof targetIndex === "number") {
      setEventIndex(targetIndex);
      setDialogIndex(0);
    } else {
      // If the target scene id not found, treat as end-of-chapter
      if (!calledChapterEndRef.current) {
        calledChapterEndRef.current = true;
        Promise.resolve().then(() => {
          if (mountedRef.current) onChapterEnd();
        });
      }
    }
  };

  // If the chapter file has no events, show message
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

      {/* Character image  */}
      {charSrc && (
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

      {/* dark gradient to make dialog legible */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent z-20 pointer-events-none" />

      {/* Dialog area */}
      <div className="absolute bottom-0 w-full z-30 px-4">
        {/* If current event is a choice, render dialog prompt (if any) and then choice buttons */}
        {currentEvent?.type === "choice" ? (
          <div className="w-full max-w-3xl mx-auto p-4 bg-black/60 border border-white rounded-md">
            {currentEvent.prompt && (
              <div className="text-xs text-gray-300 mb-2">{currentEvent.prompt}</div>
            )}
            {/* If the choice event also has dialogs, show them first (rare) */}
            {dialogs.length > 0 && currentDialog && (
              <GameDialogBox
                text={currentDialog.text ?? ""}
                character={currentDialog.character ?? "Narrator"}
                chapter={data?.id ?? ""}
                onNext={() => {
                  // if there are multiple dialogs inside the choice event, allow progressing them
                  if (dialogIndex + 1 < dialogs.length) setDialogIndex((d) => d + 1);
                }}
              />
            )}

            {currentEvent?.choices && currentEvent.choices.length > 0 && (
              <div className="w-full max-w-3xl mx-auto mb-34 relative z-30">
                <div className="rounded-xl overflow-hidden shadow-lg bg-black/60 border border-white/20 backdrop-blur-md p-4">
                  
                  {/* Motion wrapper identical to GameDialogBox */}
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 100, duration: 0.5 }}
                    className="w-full max-w-4xl max-h-1/3 border-2 border-fuchsia-500 bg-black/70
                              backdrop-blur-sm p-6 flex flex-col justify-between rounded-xl shadow-2xl"
                  >
                    {/* Choices */}
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
                          className="
                            w-full text-left px-4 py-3
                            bg-fuchsia-900/20 hover:bg-fuchsia-700/40
                            border border-fuchsia-400/40
                            backdrop-blur-lg rounded-md text-white
                            shadow-lg shadow-fuchsia-900/30 cursor-pointer
                          "
                        >
                          {choice.text}
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>

                </div>
              </div>
            )}


          </div>
        ) : miniGames && multipleChoiceComponent ? ( // If mini game multiple choice
            <MiniGameMultipleChoice />
        ) : miniGames && CardGameComponent ? ( // If mini game card Game
            <CardGame />
        ) : (
          // Normal dialog flow
          <div className="w-full max-w-3xl mx-auto mb-34 relative z-30">
            <div className="rounded-xl overflow-hidden shadow-lg bg-black/60 border border-white/20 backdrop-blur-md p-4">
              <GameDialogBox
                isFirstChapter={isFirstChapter}
                onNextChapter={onNextChapter}
                text={currentDialog?.text ?? ""}
                character={currentDialog?.character ?? "Narrator"}
                chapter={data?.id ?? ""}
                onNext={progressToNext}
              />
            </div>
          </div>

        )}
      </div>
    </div>
  );
}
