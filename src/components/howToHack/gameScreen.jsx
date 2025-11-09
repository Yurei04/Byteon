"use client";

import React from "react";
import GameDialogBox from "./gameDialogBox";
import Image from "next/image";

export default function GameScreen(props) {
  const {
    gameStart = true,
    gameCharac,
    characPose = "default",
    dialog = null, // now expecting a dialog object (or null)
    chapter,
    event,
    scenario,
    background = "/images/kaede.jpg", // default fallback
    characPosition = "left", // can be "left" or "right"
    choices,
    miniGames = false,
    MultipleChoiceComponent = null,
    CardGameComponent = null,
    onNext = () => {},
  } = props;

  // dialog may be an object { speaker, text, pose, side } or null
  const dialogText = dialog?.text ?? "";
  const dialogSpeaker = dialog?.speaker ?? gameCharac ?? "Narrator";

  // Character image source resolution:
  // - If gameCharac looks like a file path (starts with / or contains a dot), use it directly.
  // - Otherwise, try to map names to temporary images in /images/<name>.jpg (lowercased).
  // This is a simple convention for temporary testing (e.g., "Kaede" -> /images/kaede.jpg).
  let charSrc = null;
  if (typeof gameCharac === "string") {
    const g = gameCharac.trim();
    if (g.startsWith("/") || g.includes(".") ) {
      charSrc = g;
    } else {
      charSrc = `/images/${g.toLowerCase()}.jpg`; // temporary convention
    }
  }

  // If you prefer to always use a specific test image regardless of character name, you can
  // uncomment the line below to force kaede for all testing:
  // charSrc = "/images/kaede.jpg";

  return (
    // --- Entire Game Screen Container ---
    <div className="relative w-full h-screen overflow-hidden bg-black text-white">
      
      {/* --- Background Image --- 
          It updates dynamically based on the JSON data (chapter/scenario/event).
      */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={background}
          alt="background"
          fill
          className="object-cover border border-white transition-all duration-700 ease-in-out"
          priority
        />
      </div>

      {/* --- Character Image (Left or Right) --- 
          This layer is in front of the background but behind dialog.
          Position, pose, and character name are all pulled from the JSON.
      */}
      {charSrc && (
        <div
          className={`absolute bottom-0 ${characPosition === "left" ? "left-10" : "right-10"} z-10 pointer-events-none`}
        >
          {/* using a square-ish size; adjust width/height to taste */}
          <Image
            src={charSrc}
            alt={String(dialogSpeaker)}
            width={550}
            height={550}
            className="object-contain drop-shadow-[0_0_15px_rgba(0,0,0,0.6)] transition-all duration-500"
          />
        </div>
      )}

      {/* 
          Helps the dialog box stand out visually by darkening the bottom area.
      */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/70 to-transparent z-20 pointer-events-none" />

      {/* --- Dialog & Mini-game Layer --- 
          This is the front-most layer of the game screen.
          It handles displaying dialog boxes, choices, and mini-games.
      */}
      <div className="absolute bottom-0 w-full z-30">
        {gameStart ? (
          // --- Dialog Display ---
          <GameDialogBox
            text={dialogText}
            character={dialogSpeaker}
            chapter={chapter}
            onNext={onNext}
          />
        ) : (
          // --- Mini-game Handling ---
          <>
            {miniGames && MultipleChoiceComponent && <MultipleChoiceComponent />}
            {miniGames && CardGameComponent && <CardGameComponent />}
          </>
        )}
      </div>
    </div>
  );
}
