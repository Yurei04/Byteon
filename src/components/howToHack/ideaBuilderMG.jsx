"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SDG IdeaBuilderDragDrop 
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
  const maxAttempts = 3;

  const [index, setIndex] = useState(0);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [score, setScore] = useState(0);
  const [totalRoundsCompleted, setTotalRoundsCompleted] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [failed, setFailed] = useState(false);

  const current = builds[index] || null;

  const [pool, setPool] = useState([]);
  const [placed, setPlaced] = useState({
    problem: null,
    solution: null,
    sdg: null
  });

  const [feedback, setFeedback] = useState({
    shown: false,
    correct: { problem: false, solution: false, sdg: false },
    message: ""
  });

  useEffect(() => {
    if (!current) {
      setPool([]);
      setPlaced({ problem: null, solution: null, sdg: null });
      setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
      return;
    }

    const items = [];
    let idCounter = 0;

    const addItems = (arr, kind) => {
      (arr || []).forEach((txt) => {
        items.push({ id: `${index}-${kind}-${idCounter++}`, text: txt, kind });
      });
    };

    if (current.problem?.options) addItems(current.problem.options, "problem");
    else if (current.problem_options) addItems(current.problem_options, "problem");

    if (current.solution?.options) addItems(current.solution.options, "solution");
    else if (current.solution_options) addItems(current.solution_options, "solution");

    if (current.sdg?.options) addItems(current.sdg.options, "sdg");
    else if (current.sdg_options) addItems(current.sdg_options, "sdg");

    setPool(shuffleArray(items));
    setPlaced({ problem: null, solution: null, sdg: null });
    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
    setCurrentAttempt(0);
  }, [minigameData, index, current]);

  const expected = useMemo(() => {
    if (!current) return { problem: null, solution: null, sdg: null };
    const getCorrect = (obj, legacyKey) => {
      if (obj?.correct) return obj.correct;
      if (obj?.answer) return obj.answer;
      if (current.correct && typeof current.correct === "object" && current.correct[legacyKey]) return current.correct[legacyKey];
      return null;
    };
    return {
      problem: getCorrect(current.problem, "problem"),
      solution: getCorrect(current.solution, "solution"),
      sdg: getCorrect(current.sdg, "sdg")
    };
  }, [current]);

  const onDragStartFromPool = (e, item) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, source: "pool" }));
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragStartFromPlaced = (e, item, zone) => {
    e.dataTransfer.setData("application/json", JSON.stringify({ ...item, source: "placed", zone }));
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e) => e.preventDefault();

  const onDropToZone = (e, zone) => {
    e.preventDefault();
    if (feedback.shown) return;

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

      const currentOccupant = placed[zone];
      if (currentOccupant) {
        newPool = shuffleArray([...newPool, currentOccupant]);
      }

      let newPlaced = { ...placed };
      if (data.source === "placed" && data.zone) {
        newPlaced[data.zone] = null;
      }

      const toPlace = { id: data.id, text: data.text, kind: data.kind };
      newPlaced[zone] = toPlace;

      setPool(newPool);
      setPlaced(newPlaced);
    } catch (err) {
      // ignore parse errors
    }
  };

  const onDropToPool = (e) => {
    e.preventDefault();
    if (feedback.shown) return;

    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (!data || !data.text) return;

      if (data.source === "pool") return;

      const srcZone = data.zone;
      if (srcZone && placed[srcZone] && placed[srcZone].id === data.id) {
        const newPlaced = { ...placed, [srcZone]: null };
        setPlaced(newPlaced);
        setPool((p) => shuffleArray([...p, { id: data.id, text: data.text, kind: data.kind }]));
      }
    } catch (err) {}
  };

  const evaluate = () => {
    if (!current) return false;
    
    const correct = {
      problem: placed.problem && expected.problem && placed.problem.text === expected.problem,
      solution: placed.solution && expected.solution && placed.solution.text === expected.solution,
      sdg: placed.sdg && expected.sdg && placed.sdg.text === expected.sdg
    };
    
    const allCorrect = correct.problem && correct.solution && correct.sdg;
    
    setFeedback({
      shown: true,
      correct,
      message: allCorrect 
        ? "🎉 Perfect! All three matched — great work!" 
        : `❌ Not quite right. Attempts remaining: ${maxAttempts - currentAttempt - 1}`
    });

    if (allCorrect) {
      setScore((s) => s + 3);
      setTotalRoundsCompleted((r) => r + 1);
    } else {
      setCurrentAttempt((a) => a + 1);
      
      if (currentAttempt + 1 >= maxAttempts) {
        setTimeout(() => {
          setFailed(true);
          setShowResults(true);
        }, 1500);
      }
    }

    return allCorrect;
  };

  const nextRound = () => {
    const allCorrect = feedback.shown && Object.values(feedback.correct).every(Boolean);
    
    if (!allCorrect) {
      return;
    }

    if (index + 1 >= builds.length) {
      setShowResults(true);
      return;
    }

    setIndex((i) => i + 1);
    setPlaced({ problem: null, solution: null, sdg: null });
    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
    setCurrentAttempt(0);
  };

  const resetRound = () => {
    const back = Object.values(placed).filter(Boolean);
    setPool((p) => shuffleArray([...p, ...back]));
    setPlaced({ problem: null, solution: null, sdg: null });
    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
  };

  const handleContinue = () => {
    const passed = !failed;

    console.log("[SDGIdeaBuilder] Calling onComplete with:", {
      score,
      total: builds.length,
      roundsCompleted: totalRoundsCompleted,
      passed
    });

    onComplete?.({
      score,
      total: builds.length,
      roundsCompleted: totalRoundsCompleted,
      passed,
      achievement: passed ? (minigameData.achievement ?? null) : null,
    });
  };

  const handleRetry = () => {
    setIndex(0);
    setScore(0);
    setTotalRoundsCompleted(0);
    setCurrentAttempt(0);
    setShowResults(false);
    setFailed(false);
    setPlaced({ problem: null, solution: null, sdg: null });
    setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
  };

  const handleDebugSkip = () => {
    console.log("[SDGIdeaBuilder] Debug skip activated");
    onComplete?.({
      score: 0,
      total: builds.length,
      roundsCompleted: 0,
      passed: false,
      skipped: true
    });
  };

  if (!minigameData || builds.length === 0) {
    return (
      <div className="min-h-[240px] w-full p-6 bg-black/80 rounded-xl text-white border border-white/20">
        <div className="text-lg font-semibold">⚠️ Minigame data missing</div>
        <div className="text-sm text-white/60 mt-2">This minigame requires build data in minigameData.builds.</div>
        <button
          onClick={() => onComplete?.({ passed: false, skipped: true })}
          className="mt-4 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 rounded-lg transition-colors"
        >
          Continue
        </button>
      </div>
    );
  }

  // RESULTS SCREEN
  if (showResults) {
    const passed = !failed;
    const percentage = builds.length > 0 ? Math.round((totalRoundsCompleted / builds.length) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mb-26 mx-auto p-4 bg-black/80 border-2 border-fuchsia-500 rounded-xl shadow-2xl max-h-[85vh] overflow-y-auto"
      >
        <div className="text-center text-white">
          {/* Pass/Fail Header */}
          {passed ? (
            <div className="mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-5xl mb-2">🎉</div>
                <h2 className="text-3xl font-bold text-green-400 mb-1">Mission Complete!</h2>
                <p className="text-base text-green-300">You&apos;ve successfully connected all SDG ideas!</p>
              </motion.div>
            </div>
          ) : (
            <div className="mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-5xl mb-2">😔</div>
                <h2 className="text-3xl font-bold text-red-400 mb-1">Challenge Failed</h2>
                <p className="text-base text-red-300">Too many incorrect attempts!</p>
              </motion.div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{totalRoundsCompleted}</div>
              <div className="text-xs text-green-300">Rounds Completed</div>
            </div>
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{score}</div>
              <div className="text-xs text-blue-300">Total Score</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-black/40 border border-white/20 rounded-lg p-3 mb-4 text-left text-sm">
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-300">Total Rounds:</span>
              <span className="font-bold text-white">{builds.length}</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-300">Completion Rate:</span>
              <span className="font-bold text-white">{percentage}%</span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-300">Attempts Per Round:</span>
              <span className="font-bold text-white">{maxAttempts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className={`font-bold ${passed ? 'text-green-400' : 'text-red-400'}`}>
                {passed ? 'PASSED ✓' : 'FAILED ✗'}
              </span>
            </div>
          </div>

          {/* Achievement (if passed) */}
          {passed && minigameData.achievement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 mb-4"
            >
              <div className="text-xl mb-1">🏆</div>
              <h3 className="text-base font-bold text-yellow-400 mb-0.5">
                {minigameData.achievement.title}
              </h3>
              <p className="text-xs text-yellow-300">
                {minigameData.achievement.description}
              </p>
              <div className="text-xs text-yellow-200 mt-1.5">
                +{minigameData.achievement.reward_points} points
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {!passed && (
              <button
                onClick={handleRetry}
                className="flex-1 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-white text-sm transition-colors"
              >
                🔄 Retry Challenge
              </button>
            )}
            <button
              onClick={handleContinue}
              className={`${!passed ? 'flex-1' : 'w-full'} px-4 py-2.5 ${
                passed 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } rounded-lg font-bold text-white text-sm transition-colors`}
            >
              {passed ? '✨ Continue' : '⏭️ Skip (No Rewards)'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // MAIN GAME SCREEN 
  return (
    <div className="w-full max-w-5xl mb-24 mx-auto p-4 bg-gradient-to-br from-indigo-900/95 via-purple-900/95 to-fuchsia-900/95 rounded-xl shadow-2xl border border-purple-400/30 text-white max-h-[90vh] overflow-y-auto">
      {/* Header - More Compact */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
            {title}
          </h3>
          <p className="text-sm text-white/90 mt-1 font-medium line-clamp-2">{current?.scenario || current?.description || ""}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-xs text-white/60">
            Round {index + 1}/{builds.length}
          </div>
          <div className="text-lg font-bold text-green-300">Score: {score}</div>
          <div className="text-xs text-orange-300">
            Attempts: {currentAttempt}/{maxAttempts}
          </div>
        </div>
      </div>

      {/* Drop Zones - Reduced Height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {["problem", "solution", "sdg"].map((zone) => (
          <div
            key={zone}
            onDragOver={allowDrop}
            onDrop={(e) => onDropToZone(e, zone)}
            className={`p-3 rounded-lg min-h-[120px] border-2 transition-all duration-300 ${
              placed[zone] 
                ? "border-green-400/60 bg-green-900/20 shadow-lg shadow-green-500/20" 
                : "border-white/20 bg-white/5 hover:border-white/30"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-xs uppercase font-bold tracking-wide text-white/95 flex items-center gap-1">
                  {zone === "problem" && "🔍"}
                  {zone === "solution" && "💡"}
                  {zone === "sdg" && "🌍"}
                  {zone}
                </div>
                <div className="text-[10px] text-white/70 mt-0.5">
                  {(() => {
                    if (zone === "problem") return current?.problem?.hint || "Core issue?";
                    if (zone === "solution") return current?.solution?.hint || "How to solve?";
                    return current?.sdg?.hint || "Which SDG?";
                  })()}
                </div>
              </div>
              {placed[zone] && !feedback.shown && (
                <button
                  onClick={() => {
                    const item = placed[zone];
                    setPlaced((p) => ({ ...p, [zone]: null }));
                    setPool((prev) => shuffleArray([...prev, item]));
                  }}
                  className="text-[10px] text-white/60 hover:text-white/90 bg-white/10 px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <div>
              {placed[zone] ? (
                <motion.div
                  layout
                  draggable={!feedback.shown}
                  onDragStart={(e) => onDragStartFromPlaced(e, placed[zone], zone)}
                  className={`p-2 rounded-lg bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-white/20 ${
                    !feedback.shown ? 'cursor-grab active:cursor-grabbing hover:scale-105' : 'cursor-not-allowed opacity-80'
                  } transition-transform`}
                >
                  <div className="font-semibold text-xs">{placed[zone].text}</div>
                </motion.div>
              ) : (
                <div className="text-white/50 text-xs italic text-center py-4">
                  Drop here
                </div>
              )}

              {/* Feedback */}
              {feedback.shown && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 text-xs font-semibold"
                  >
                    {feedback.correct[zone] ? (
                      <span className="text-green-300 flex items-center gap-1">
                        ✓ Correct!
                      </span>
                    ) : (
                      <span className="text-orange-300 flex items-center gap-1">
                        ✗ Not quite
                      </span>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Options Pool - More Compact */}
      <div
        onDragOver={allowDrop}
        onDrop={onDropToPool}
        className="p-3 rounded-lg bg-black/50 border-2 border-white/10 mb-3 min-h-[120px]"
      >
        <div className="text-xs text-white/80 mb-2 font-semibold flex items-center gap-2">
          <span>📦</span> Options Pool — Drag to slots above
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {pool.map((it) => (
            <motion.div
              key={it.id}
              draggable={!feedback.shown}
              onDragStart={(e) => onDragStartFromPool(e, it)}
              whileHover={!feedback.shown ? { scale: 1.03, y: -2 } : {}}
              whileTap={!feedback.shown ? { scale: 0.98 } : {}}
              className={`p-2 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/20 ${
                !feedback.shown ? 'cursor-grab active:cursor-grabbing hover:border-white/40' : 'cursor-not-allowed opacity-50'
              } transition-all`}
            >
              <div className="font-medium text-xs">{it.text}</div>
              <div className="text-[10px] text-white/50 mt-0.5 capitalize">
                {it.kind === "sdg" ? "🌍 SDG" : `${it.kind === "problem" ? "🔍" : "💡"} ${it.kind}`}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Feedback Message - Compact */}
      {feedback.shown && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-3 p-2 rounded-lg text-center font-semibold text-sm ${
              Object.values(feedback.correct).every(Boolean) 
                ? "bg-green-500/20 text-green-200 border border-green-500/50" 
                : "bg-orange-500/20 text-orange-200 border border-orange-500/50"
            }`}
          >
            {feedback.message}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Controls - Compact */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={resetRound}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-700/60 hover:bg-gray-700/80 text-white"
        >
          🔄 Reset
        </button>

        <button
          onClick={handleDebugSkip}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-medium transition-colors"
        >
          ⏭️ Skip
        </button>

        {/* Show Submit button when not answered yet OR show Try Again when wrong */}
        {!feedback.shown ? (
          <button
            onClick={() => {
              const allPlaced = placed.problem && placed.solution && placed.sdg;
              if (!allPlaced) {
                alert("⚠️ Please place one option into each slot before submitting.");
                return;
              }
              const ok = evaluate();
              if (ok) {
                setTimeout(nextRound, 1200);
              }
            }}
            className="px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            {index + 1 < builds.length ? "Submit & Next →" : "Submit & Finish 🎉"}
          </button>
        ) : Object.values(feedback.correct).every(Boolean) ? (
          // All correct - show Next button
          <button
            onClick={nextRound}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            {index + 1 < builds.length ? "Next Round →" : "Finish 🎉"}
          </button>
        ) : (
          // Some wrong - show Try Again button if attempts remaining
          currentAttempt < maxAttempts && (
            <button
              onClick={() => {
                setFeedback({ shown: false, correct: { problem: false, solution: false, sdg: false }, message: "" });
              }}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              🔄 Try Again ({maxAttempts - currentAttempt} left)
            </button>
          )
        )}
      </div>

      {/* Warning for last attempt - Compact */}
      {currentAttempt === maxAttempts - 1 && !feedback.shown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 bg-red-900/30 border border-red-500/50 rounded-lg p-2 text-center"
        >
          <p className="text-red-300 font-semibold text-sm">⚠️ Last Attempt!</p>
          <p className="text-red-200 text-xs">
            This is your final chance. Choose carefully!
          </p>
        </motion.div>
      )}
    </div>
  );
}