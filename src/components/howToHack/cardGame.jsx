"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TrueOrFalseFlashGame({ minigameData, onComplete }) {
  // CRITICAL: All hooks MUST be at the top, before any early returns
  const questions = minigameData?.questions ?? [];
  const total = questions.length;
  const maxWrong = 3; // Maximum wrong answers allowed

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [failed, setFailed] = useState(false);

  // NOW we can do early returns after all hooks are declared
  if (!minigameData) {
    console.error("MiniGameMultipleChoice: minigameData is undefined");
    return (
      <div className="text-white p-4 text-center">
        <p>Minigame data missing.</p>
        <button
          onClick={() => onComplete?.()}
          className="mt-4 px-4 py-2 bg-fuchsia-600 rounded-lg"
        >
          Continue
        </button>
      </div>
    );
  }


  const q = questions[index];

  const handleAnswer = (choice) => {
    if (answered !== null) return;

    const isCorrect = choice === q.correct_answer;
    setAnswered(choice);

    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      setWrongCount((w) => w + 1);
      
      // Check if player exceeded max wrong answers
      if (wrongCount + 1 > maxWrong) {
        setTimeout(() => {
          setFailed(true);
          setShowResults(true);
        }, 700);
        return;
      }
    }

    setTimeout(() => {
      setAnswered(null);

      if (index + 1 < total) {
        setIndex((i) => i + 1);
      } else {
        // FINISHED - Show results
        setShowResults(true);
      }
    }, 700);
  };

  const handleContinue = () => {
    const passed = wrongCount <= maxWrong && !failed;
    
    onComplete?.({
      score,
      total,
      wrongCount,
      passed,
      achievement: passed ? (minigameData.achievement ?? null) : null,
    });
  };

  const handleRetry = () => {
    // Reset all state for retry
    setIndex(0);
    setScore(0);
    setWrongCount(0);
    setAnswered(null);
    setShowResults(false);
    setFailed(false);
  };

  // Results Screen
  if (showResults) {
    const passed = !failed && wrongCount <= maxWrong;
    const correctCount = score;
    const percentage = Math.round((correctCount / total) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl mx-auto p-6 bg-black/80 border-2 border-fuchsia-500 rounded-xl shadow-2xl"
      >
        <div className="text-center">
          {/* Pass/Fail Header */}
          {passed ? (
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-4xl font-bold text-green-400 mb-2">Success!</h2>
                <p className="text-xl text-green-300">You passed the challenge!</p>
              </motion.div>
            </div>
          ) : (
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-4">😔</div>
                <h2 className="text-4xl font-bold text-red-400 mb-2">Challenge Failed</h2>
                <p className="text-xl text-red-300">Too many wrong answers!</p>
              </motion.div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-400">{correctCount}</div>
              <div className="text-sm text-green-300">Correct</div>
            </div>
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
              <div className="text-3xl font-bold text-red-400">{wrongCount}</div>
              <div className="text-sm text-red-300">Wrong</div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="bg-black/40 border border-white/20 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Total Questions:</span>
              <span className="font-bold text-white">{total}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Accuracy:</span>
              <span className="font-bold text-white">{percentage}%</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-300">Wrong Allowed:</span>
              <span className="font-bold text-white">{maxWrong}</span>
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
              className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4 mb-6"
            >
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="text-lg font-bold text-yellow-400 mb-1">
                {minigameData.achievement.title}
              </h3>
              <p className="text-sm text-yellow-300">
                {minigameData.achievement.description}
              </p>
              <div className="text-xs text-yellow-200 mt-2">
                +{minigameData.achievement.reward_points} points
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!passed && (
              <button
                onClick={handleRetry}
                className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 rounded-lg font-bold text-white transition-colors"
              >
                Retry Challenge
              </button>
            )}
            <button
              onClick={handleContinue}
              className={`${!passed ? 'flex-1' : 'w-full'} px-6 py-3 ${
                passed 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              } rounded-lg font-bold text-white transition-colors`}
            >
              {passed ? 'Continue' : 'Skip (No Rewards)'}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Question Screen
  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-black/70 border border-white/20 rounded-xl shadow-xl">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-1">{minigameData.minigame_title}</h2>
        <p className="text-sm text-gray-300">{minigameData.description}</p>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2 bg-green-900/20 border border-green-500/30 px-3 py-1 rounded-lg">
          <span className="text-green-400 font-bold">✓</span>
          <span className="text-green-300">{score}</span>
        </div>
        <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/30 px-3 py-1 rounded-lg">
          <span className="text-red-400 font-bold">✗</span>
          <span className="text-red-300">{wrongCount} / {maxWrong}</span>
        </div>
        <div className="flex-1 flex items-center justify-end text-gray-300">
          Question {index + 1} of {total}
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={q?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className={`p-4 border rounded-lg ${
            answered === null
              ? 'bg-black/40 border-fuchsia-500'
              : answered === q.correct_answer
              ? 'bg-green-900/30 border-green-500'
              : 'bg-red-900/30 border-red-500'
          }`}
        >
          <p className="text-lg mb-3">{q?.statement}</p>

          {/* Feedback after answering */}
          {answered !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-white/20"
            >
              <div className={`text-sm font-semibold mb-1 ${
                answered === q.correct_answer ? 'text-green-300' : 'text-red-300'
              }`}>
                {answered === q.correct_answer ? '✓ Correct!' : '✗ Incorrect'}
              </div>
              <div className="text-sm text-gray-300 italic">
                {q.aira_reaction}
              </div>
              {q.tip && (
                <div className="text-xs text-gray-400 mt-2">
                  💡 {q.tip}
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Answer Buttons */}
      <div className="flex gap-3 mt-5">
        <button
          disabled={answered !== null}
          className={`flex-1 py-3 rounded-md border font-bold text-lg transition-all ${
            answered === true
              ? q.correct_answer === true
                ? 'bg-green-600 border-green-400'
                : 'bg-red-600 border-red-400'
              : 'bg-black/40 border-green-400 hover:bg-green-900/30 active:scale-95'
          } ${answered !== null ? 'cursor-not-allowed opacity-60' : ''}`}
          onClick={() => handleAnswer(true)}
        >
          True
        </button>

        <button
          disabled={answered !== null}
          className={`flex-1 py-3 rounded-md border font-bold text-lg transition-all ${
            answered === false
              ? q.correct_answer === false
                ? 'bg-green-600 border-green-400'
                : 'bg-red-600 border-red-400'
              : 'bg-black/40 border-red-400 hover:bg-red-900/30 active:scale-95'
          } ${answered !== null ? 'cursor-not-allowed opacity-60' : ''}`}
          onClick={() => handleAnswer(false)}
        >
          False
        </button>
      </div>

      {/* Warning if approaching limit */}
      {wrongCount === maxWrong && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center"
        >
          <p className="text-red-300 font-semibold">⚠️ Warning!</p>
          <p className="text-red-200 text-sm">
            You've reached the maximum wrong answers. One more mistake and you'll fail!
          </p>
        </motion.div>
      )}
    </div>
  );
}