import React, { useMemo, useEffect, useRef } from "react";
import GameFlowCard from "./gameFlowCard";

export default function GameFlow({
    chapterData,
    chapterIndex,
    dialogIndex,
    isShowingMinigame
}) {
  const containerRef = useRef(null);

  const chapter = useMemo(() => chapterData?.chapter ?? [], [chapterData]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const activeEl = container.querySelector(".active-event");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [chapterIndex, dialogIndex, isShowingMinigame]);

  return (
    <div ref={containerRef} className="overflow-y-auto max-h-[500px]">
      {chapter.map((chapt, eIdx) => (
        <div
          key={eIdx}
          className={`mb-2 p-2 rounded ${
            eIdx === chapterIndex ? "active-event bg-gray-800" : "bg-gray-900"
          }`}
        >
          <h3 className="font-bold text-white">{chapt.title}</h3>
          {chapt.dialogs.map((dialog, dIdx) => (
            <p
              key={dIdx}
              className={`pl-2 ${
                eIdx === chapterIndex && dIdx === dialogIndex
                  ? "text-fuchsia-500 font-bold"
                  : "text-gray-400"
              }`}
            >
              {dialog.text}
            </p>
          ))}
          {chapt.minigame && eIdx === chapterIndex && isShowingMinigame && (
            <p className="pl-2 text-green-400 font-semibold">Minigame Active</p>
          )}
        </div>
      ))}
    </div>
  );
}
