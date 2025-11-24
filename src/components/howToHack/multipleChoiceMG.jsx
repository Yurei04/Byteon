"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MiniGameMultipleChoice({ minigameData, onComplete }) {
  // All hooks FIRST
  const tasks = minigameData?.tasks ?? [];
  const total = tasks.length;
  const maxWrong = 3; // Maximum wrong answers allowed

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]); // Multi-select support
  const [answered, setAnswered] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [failed, setFailed] = useState(false);

  // Handle missing data
  if (!minigameData) {
    console.error("TeamBuilderGame: minigameData is undefined");
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

  const currentTask = tasks[index];
  const correctAnswers = currentTask?.correct_answer ?? [];
  const isSingleAnswer = correctAnswers.length === 1;

  // Toggle option selection (for multi-select)
  const handleOptionToggle = (option) => {
    if (answered) return;

    if (isSingleAnswer) {
      // Single answer: replace selection
      setSelectedOptions([option]);
    } else {
      // Multiple answers: toggle in array
      setSelectedOptions(prev => 
        prev.includes(option)
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    }
  };

  // Submit answer
  const handleSubmit = () => {
    if (answered || selectedOptions.length === 0) return;

    // Check if answer is correct
    const isCorrect = 
      selectedOptions.length === correctAnswers.length &&
      selectedOptions.every(opt => correctAnswers.includes(opt));

    setAnswered(true);

    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      setWrongCount(w => w + 1);

      // Check if exceeded max wrong
      if (wrongCount + 1 > maxWrong) {
        setTimeout(() => {
          setFailed(true);
          setShowResults(true);
        }, 1500);
        return;
      }
    }

    // Move to next question after delay
    setTimeout(() => {
      setAnswered(false);
      setSelectedOptions([]);

      if (index + 1 < total) {
        setIndex(i => i + 1);
      } else {
        setShowResults(true);
      }
    }, 1500);
  };

  const handleContinue = () => {
    const passed = wrongCount <= maxWrong && !failed;

    console.log("[TeamBuilderGame] Calling onComplete with:", {
      score,
      total,
      wrongCount,
      passed
    });

    onComplete?.({
      score,
      total,
      wrongCount,
      passed,
      achievement: passed ? (minigameData.achievement ?? null) : null,
    });
  };

  const handleRetry = () => {
    console.log("[TeamBuilderGame] Retrying minigame");
    setIndex(0);
    setScore(0);
    setWrongCount(0);
    setSelectedOptions([]);
    setAnswered(false);
    setShowResults(false);
    setFailed(false);
  };

  // Check if selection is correct/wrong
  const getOptionStatus = (option) => {
    if (!answered) return "unselected";
    
    const isSelected = selectedOptions.includes(option);
    const isCorrect = correctAnswers.includes(option);

    if (isSelected && isCorrect) return "correct";
    if (isSelected && !isCorrect) return "wrong";
    if (!isSelected && isCorrect) return "missed";
    return "unselected";
  };

  // RESULTS SCREEN
  if (showResults) {
    const passed = !failed && wrongCount <= maxWrong;
    const percentage = Math.round((score / total) * 100);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-h-[50%] mx-auto p-6 bg-black/80 border-2 border-fuchsia-500 rounded-xl shadow-2xl mb-24"
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
              <div className="text-3xl font-bold text-green-400">{score}</div>
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
              <span className="text-gray-300">Total Tasks:</span>
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

  // TASK SCREEN
  return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-black/70 border border-white/20 rounded-xl shadow-xl mb-24">
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
          Task {index + 1} of {total}
        </div>
      </div>

      {/* Task Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTask?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mb-4"
        >
          {/* Task Description */}
          <div className="p-4 bg-black/40 border border-fuchsia-500 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">📋</div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-white mb-1">
                  {currentTask?.task}
                </p>
                {!answered && (
                  <p className="text-xs text-gray-400">
                    {isSingleAnswer 
                      ? "Select the best role for this task"
                      : "Select all roles that fit this task"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role Options */}
          <div className="space-y-2 mb-4">
            {currentTask?.options?.map((option, idx) => {
              const status = getOptionStatus(option);
              const isSelected = selectedOptions.includes(option);

              let buttonStyle = "bg-black/40 border-white/30";
              
              if (!answered) {
                // Before submitting
                if (isSelected) {
                  buttonStyle = "bg-fuchsia-600 border-fuchsia-400";
                } else {
                  buttonStyle = "bg-black/40 border-white/30 hover:bg-fuchsia-900/30";
                }
              } else {
                // After submitting
                if (status === "correct") {
                  buttonStyle = "bg-green-600 border-green-400";
                } else if (status === "wrong") {
                  buttonStyle = "bg-red-600 border-red-400";
                } else if (status === "missed") {
                  buttonStyle = "bg-green-900/50 border-green-500";
                } else {
                  buttonStyle = "bg-black/40 border-gray-600 opacity-50";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={answered}
                  onClick={() => handleOptionToggle(option)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${buttonStyle} ${
                    answered ? 'cursor-not-allowed' : 'active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox/Radio */}
                    <div className={`w-6 h-6 rounded ${isSingleAnswer ? 'rounded-full' : 'rounded'} border-2 flex items-center justify-center ${
                      isSelected && !answered ? 'bg-white border-white' : 'border-white/50'
                    }`}>
                      {isSelected && !answered && (
                        <span className="text-fuchsia-600 font-bold">✓</span>
                      )}
                      {answered && status === "correct" && (
                        <span className="text-white font-bold">✓</span>
                      )}
                      {answered && status === "wrong" && (
                        <span className="text-white font-bold">✗</span>
                      )}
                      {answered && status === "missed" && (
                        <span className="text-white font-bold">!</span>
                      )}
                    </div>
                    
                    {/* Role Name */}
                    <span className="flex-1 font-semibold">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback after answering */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 border rounded-lg bg-black/40 border-white/20"
            >
              <div className={`text-sm font-semibold mb-2 ${
                selectedOptions.length === correctAnswers.length &&
                selectedOptions.every(opt => correctAnswers.includes(opt))
                  ? 'text-green-300'
                  : 'text-red-300'
              }`}>
                {selectedOptions.length === correctAnswers.length &&
                selectedOptions.every(opt => correctAnswers.includes(opt))
                  ? '✓ Correct!'
                  : '✗ Incorrect'}
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-semibold">Correct answer{correctAnswers.length > 1 ? 's' : ''}:</span>{' '}
                {correctAnswers.join(', ')}
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Submit Button */}
      {!answered && (
        <>
          <button
            onClick={handleSubmit}
            disabled={selectedOptions.length === 0}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              selectedOptions.length > 0
                ? 'bg-fuchsia-600 hover:bg-fuchsia-700 active:scale-95'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            Submit Answer
          </button>
          <button
            onClick={handleContinue}
            className={"px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer text-xs"}
          >
            Debug Skip
          </button>
        </>
        
      )}

      {/* Warning if approaching limit */}
      {wrongCount === maxWrong && !failed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-center"
        >
          <p className="text-red-300 font-semibold">⚠️ Warning!</p>
          <p className="text-red-200 text-sm">
            You&apos;ve reached the maximum wrong answers. One more mistake and you&apos;ll fail!
          </p>
        </motion.div>
      )}
    </div>
  );
}