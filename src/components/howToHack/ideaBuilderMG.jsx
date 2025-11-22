"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * SDG IdeaBuilderDragDrop
 *
 * Expects props:
 *  - minigameData: { minigame_title, builds: [ { id, scenario, problem: { options, correct }, solution: {...}, sdg: {...} } ] }
 *  - onComplete(result)
 *
 * Behavior:
 *  - shows one round at a time (based on builds array)
 *  - pools all options (problem_options, solution_options, sdg_options) into a shuffled pool
 *  - player drags an option into Problem / Solution / SDG slots
 *  - only one item per slot; dropping a new item returns old to pool
 *  - player can drag a placed item back to pool
 *  - Submit evaluates matches against correct values and shows feedback; if all correct progress to next round
 */

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SDGIdeaBuilderDragDrop({ minigameData, onComplete }) {
  const builds = (minigameData && (minigameData.builds || minigameData.rounds)) || [];
  const title = (minigameData && minigameData.minigame_title) || "SDG Idea Builder";

  const [index, setIndex] = useState(0);
  const current = builds[index] || null;

  // pool: array of { id, text, kind } where kind is "problem" | "solution" | "sdg"
  const [pool, setPool] = useState([]);

  // placed slots:
  const [placed, setPlaced] = useState({
    problem: null,
    solution: null,
    sdg: null
  });

  // feedback state:
  const [feedback, setFeedback] = useState({
    shown: false,
    correct: { problem: false, solution: false, sdg: false },
    message: ""
  });

  // score tracking
  const [score, setScore] = useState(0);

  // initialize pool when minigameData or index changes
  useEffect(() => {
    if (!current) {
      setPool([]);
      setPlaced({ problem: null, solution: null, sdg: null });
      setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
      return;
    }

    // Build pool items with unique ids
    const items = [];
    let idCounter = 0;

    const addItems = (arr, kind) => {
      (arr || []).forEach((txt) => {
        items.push({ id: `${index}-${kind}-${idCounter++}`, text: txt, kind });
      });
    };

    // support two JSON shapes: either separate arrays like problem_options OR nested like current.problem.options
    if (current.problem?.options) addItems(current.problem.options, "problem");
    else if (current.problem_options) addItems(current.problem_options, "problem");

    if (current.solution?.options) addItems(current.solution.options, "solution");
    else if (current.solution_options) addItems(current.solution_options, "solution");

    if (current.sdg?.options) addItems(current.sdg.options, "sdg");
    else if (current.sdg_options) addItems(current.sdg_options, "sdg");

    setPool(shuffleArray(items));
    setPlaced({ problem: null, solution: null, sdg: null });
    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minigameData, index]);

  // helper: get expected correct text for each slot
  const expected = useMemo(() => {
    if (!current) return { problem: null, solution: null, sdg: null };
    const getCorrect = (obj, legacyKey) => {
      if (obj?.correct) return obj.correct;
      if (obj?.answer) return obj.answer;
      // legacy shape: current.correct?.problem etc
      if (current.correct && typeof current.correct === "object" && current.correct[legacyKey]) return current.correct[legacyKey];
      return null;
    };
    return {
      problem: getCorrect(current.problem, "problem"),
      solution: getCorrect(current.solution, "solution"),
      sdg: getCorrect(current.sdg, "sdg")
    };
  }, [current]);

  // HTML5 drag handlers --------------------------------
  const onDragStartFromPool = (e, item) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, source: "pool" }));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragStartFromPlaced = (e, item, zone) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, source: "placed", zone }));
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e) => e.preventDefault();

  // Drop into a zone
  const onDropToZone = (e, zone) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data || !data.text) return;

      let newPool = [...pool];
      if (data.source === "pool") {
        newPool = newPool.filter((p) => p.id !== data.id);
      } else if (data.source === "placed") {
        const srcZone = data.zone;
        if (srcZone && placed[srcZone] && placed[srcZone].id === data.id) {
          // will clear below
        }
      }

      // If target zone currently occupied -> move occupant to pool
      const currentOccupant = placed[zone];
      if (currentOccupant) {
        newPool = shuffleArray([...newPool, currentOccupant]);
      }

      // Clear source zone if moving from placed
      let newPlaced = { ...placed };
      if (data.source === "placed" && data.zone) {
        newPlaced[data.zone] = null;
      }

      // Place new item into target zone
      const toPlace = { id: data.id, text: data.text, kind: data.kind };
      newPlaced[zone] = toPlace;

      setPool(newPool);
      setPlaced(newPlaced);
      setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
    } catch (err) {
      // ignore parse errors
    }
  };

  // Drop back to pool (unplace)
  const onDropToPool = (e) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data || !data.text) return;

      if (data.source === "pool") return;

      const srcZone = data.zone;
      if (srcZone && placed[srcZone] && placed[srcZone].id === data.id) {
        const newPlaced = { ...placed, [srcZone]: null };
        setPlaced(newPlaced);
        setPool((p) => shuffleArray([...p, { id: data.id, text: data.text, kind: data.kind }]));
        setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
      }
    } catch (err) {}
  };

  // Evaluate current placements
  const evaluate = () => {
    if (!current) return;
    const correct = {
      problem: placed.problem && expected.problem && placed.problem.text === expected.problem,
      solution: placed.solution && expected.solution && placed.solution.text === expected.solution,
      sdg: placed.sdg && expected.sdg && placed.sdg.text === expected.sdg
    };
    const allCorrect = correct.problem && correct.solution && correct.sdg;
    setFeedback({
      shown: true,
      correct,
      message: allCorrect ? "Perfect! All three matched — great work connecting this to the right SDG!" : "Some items are not correct — review the scenario and try again."
    });

    if (allCorrect) {
      setScore((s) => s + 3);
    }
    return allCorrect;
  };

  // Next / finish
  const nextRound = () => {
    const allCorrect = feedback.shown && Object.values(feedback.correct).every(Boolean);
    if (!allCorrect) {
      const nowAll = evaluate();
      if (!nowAll) return;
    }

    // If last round -> complete
    if (index + 1 >= builds.length) {
      onComplete?.({
        passed: true,
        score,
        details: { roundsPlayed: builds.length }
      });
      return;
    }

    // Otherwise go to next
    const next = index + 1;
    setIndex(next);
    setPlaced({ problem: null, solution: null, sdg: null });
    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
  };

  // Safety: if there is no minigame data, render fallback
  if (!minigameData || builds.length === 0) {
    return (
      <div className="min-h-[240px] w-full p-6 bg-black/60 rounded-xl text-white">
        <div className="text-lg font-semibold">Minigame data missing</div>
        <div className="text-sm text-white/60 mt-2">This minigame requires build data in minigameData.builds.</div>
        <button
          onClick={() => onComplete?.({ passed: false })}
          className="mt-4 px-4 py-2 bg-fuchsia-700 rounded-lg"
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-fuchsia-900/95 rounded-2xl shadow-2xl border border-purple-400/30 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-base text-white/90 mt-2 font-medium">{current?.scenario || current?.description || ""}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-white/60">
            Round {index + 1}/{builds.length}
          </div>
          <div className="text-xl font-bold text-green-300">Score: {score}</div>
        </div>
      </div>

      {/* Targets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {["problem", "solution", "sdg"].map((zone) => (
          <div
            key={zone}
            onDragOver={allowDrop}
            onDrop={(e) => onDropToZone(e, zone)}
            className={`p-5 rounded-xl min-h-[140px] border-2 transition-all duration-300 ${
              placed[zone] 
                ? "border-green-400/60 bg-green-900/20 shadow-lg shadow-green-500/20" 
                : "border-white/20 bg-white/5 hover:border-white/30"
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm uppercase font-bold tracking-wide text-white/95 flex items-center gap-2">
                  {zone === "problem" && "🔍"}
                  {zone === "solution" && "💡"}
                  {zone === "sdg" && "🌍"}
                  {zone}
                </div>
                <div className="text-xs text-white/70 mt-1">
                  {(() => {
                    if (zone === "problem") return current?.problem?.hint || "What's the core issue?";
                    if (zone === "solution") return current?.solution?.hint || "How can we solve it?";
                    return current?.sdg?.hint || "Which UN SDG does this align with?";
                  })()}
                </div>
              </div>
              {placed[zone] && (
                <button
                  onClick={() => {
                    const item = placed[zone];
                    setPlaced((p) => ({ ...p, [zone]: null }));
                    setPool((prev) => shuffleArray([...prev, item]));
                    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
                  }}
                  className="text-xs text-white/60 hover:text-white/90 bg-white/10 px-2 py-1 rounded"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              {placed[zone] ? (
                <motion.div
                  layout
                  draggable
                  onDragStart={(e) => onDragStartFromPlaced(e, placed[zone], zone)}
                  className="p-3 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-white/20 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                >
                  <div className="font-semibold text-sm">{placed[zone].text}</div>
                </motion.div>
              ) : (
                <div className="text-white/50 text-sm italic">Drop an option here</div>
              )}

              {/* feedback text */}
              {feedback.shown && (
                <div className="mt-3 text-sm font-semibold">
                  {feedback.correct[zone] ? (
                    <span className="text-green-300 flex items-center gap-1">
                      ✓ Correct!
                    </span>
                  ) : (
                    <span className="text-orange-300 flex items-center gap-1">
                      ✗ Try again
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pool */}
      <div
        onDragOver={allowDrop}
        onDrop={onDropToPool}
        className="p-5 rounded-xl bg-black/50 border-2 border-white/10 mb-6 min-h-[140px]"
      >
        <div className="text-sm text-white/80 mb-4 font-semibold flex items-center gap-2">
          <span>📦</span> Options Pool — Drag cards to slots above
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pool.map((it) => (
            <motion.div
              key={it.id}
              draggable
              onDragStart={(e) => onDragStartFromPool(e, it)}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 cursor-grab active:cursor-grabbing hover:border-white/40 transition-all"
            >
              <div className="font-medium text-sm">{it.text}</div>
              <div className="text-xs text-white/50 mt-1 capitalize">
                {it.kind === "sdg" ? "🌍 SDG" : it.kind}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback message */}
      {feedback.shown && (
        <div className={`mb-4 p-3 rounded-lg text-center font-semibold ${
          Object.values(feedback.correct).every(Boolean) 
            ? "bg-green-500/20 text-green-200" 
            : "bg-orange-500/20 text-orange-200"
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => {
            const back = Object.values(placed).filter(Boolean);
            setPool((p) => shuffleArray([...p, ...back]));
            setPlaced({ problem: null, solution: null, sdg: null });
            setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
          }}
          className="px-4 py-2 bg-gray-700/60 hover:bg-gray-700/80 rounded-lg text-white font-medium transition-colors"
        >
          🔄 Reset Round
        </button>

        <button
          onClick={() => {
            const allPlaced = placed.problem && placed.solution && placed.sdg;
            if (!allPlaced) {
              alert("Please place one option into each slot (Problem, Solution, SDG) before submitting.");
              return;
            }
            const ok = evaluate();
            if (ok) {
              setTimeout(nextRound, 800);
            }
          }}
          className="px-6 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all"
        >
          {index + 1 < builds.length ? "Submit & Next →" : "Submit & Finish 🎉"}
        </button>
      </div>
    </div>
  );
}