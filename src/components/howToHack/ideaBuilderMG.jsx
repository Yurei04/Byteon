import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IdeaBuilderMiniGame({ minigameData, onComplete }) {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [selectedTech, setSelectedTech] = useState(null);
  const [selectedImpact, setSelectedImpact] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [generatedIdea, setGeneratedIdea] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const categories = minigameData?.categories || {
    problems: [],
    technologies: [],
    impacts: []
  };

  const combinations = minigameData?.combinations || [];

  // Check if all slots are filled
  useEffect(() => {
    if (selectedProblem && selectedTech && selectedImpact && !generatedIdea) {
      generateIdea();
    }
  }, [selectedProblem, selectedTech, selectedImpact]);

  const generateIdea = () => {
    const combination = combinations.find(
      c => c.problem === selectedProblem &&
           c.technology === selectedTech &&
           c.impact === selectedImpact
    );

    if (combination) {
      setGeneratedIdea(combination.idea_result);
      setShowResult(true);
    }
  };

  const handleDragStart = (item, category) => {
    setDraggedItem({ item, category });
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (dropZone) => {
    if (!draggedItem) return;

    const { item, category } = draggedItem;

    if (dropZone === 'problem' && category === 'problems') {
      setSelectedProblem(item);
    } else if (dropZone === 'technology' && category === 'technologies') {
      setSelectedTech(item);
    } else if (dropZone === 'impact' && category === 'impacts') {
      setSelectedImpact(item);
    }

    setDraggedItem(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const resetSelection = () => {
    setSelectedProblem(null);
    setSelectedTech(null);
    setSelectedImpact(null);
    setGeneratedIdea(null);
    setShowResult(false);
  };

  const handleComplete = () => {
    setIsComplete(true);
    setTimeout(() => {
      onComplete?.({
        passed: true,
        achievement: minigameData?.achievement
      });
    }, 500);
  };

  const removeItem = (slot) => {
    if (slot === 'problem') setSelectedProblem(null);
    if (slot === 'technology') setSelectedTech(null);
    if (slot === 'impact') setSelectedImpact(null);
    setGeneratedIdea(null);
    setShowResult(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-purple-900/90 via-fuchsia-900/90 to-pink-900/90 rounded-2xl shadow-2xl border-2 border-fuchsia-400/50 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">
          {minigameData?.minigame_title || "Idea Builder"}
        </h2>
        <p className="text-white/90 text-sm">
          {minigameData?.description || "Drag and drop to create your innovative idea!"}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Problems Column */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-fuchsia-300 text-center mb-3">
            🎯 Problems
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-fuchsia-500 scrollbar-track-purple-900/50">
            {categories.problems.map((problem, idx) => (
              <motion.div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(problem, 'problems')}
                onDragEnd={handleDragEnd}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 bg-gradient-to-r from-red-500/80 to-orange-500/80 rounded-lg cursor-move border-2 border-red-400/50 text-white text-sm font-medium shadow-lg hover:shadow-red-500/50 transition-all ${
                  selectedProblem === problem ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {problem}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technologies Column */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-cyan-300 text-center mb-3">
            💻 Technologies
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-500 scrollbar-track-purple-900/50">
            {categories.technologies.map((tech, idx) => (
              <motion.div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(tech, 'technologies')}
                onDragEnd={handleDragEnd}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 bg-gradient-to-r from-blue-500/80 to-cyan-500/80 rounded-lg cursor-move border-2 border-cyan-400/50 text-white text-sm font-medium shadow-lg hover:shadow-cyan-500/50 transition-all ${
                  selectedTech === tech ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {tech}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Impacts Column */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-green-300 text-center mb-3">
            ✨ Impacts
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-green-500 scrollbar-track-purple-900/50">
            {categories.impacts.map((impact, idx) => (
              <motion.div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(impact, 'impacts')}
                onDragEnd={handleDragEnd}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 bg-gradient-to-r from-green-500/80 to-emerald-500/80 rounded-lg cursor-move border-2 border-green-400/50 text-white text-sm font-medium shadow-lg hover:shadow-green-500/50 transition-all ${
                  selectedImpact === impact ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {impact}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Drop Zones */}
      <div className="bg-black/40 p-6 rounded-xl border-2 border-white/20 mb-6">
        <h3 className="text-xl font-semibold text-white text-center mb-4">
          🎨 Build Your Idea
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Problem Drop Zone */}
          <div
            onDrop={() => handleDrop('problem')}
            onDragOver={handleDragOver}
            className={`min-h-24 p-4 rounded-lg border-2 border-dashed transition-all ${
              draggedItem?.category === 'problems'
                ? 'border-red-400 bg-red-500/20 scale-105'
                : 'border-white/30 bg-white/5'
            }`}
          >
            <div className="text-xs text-white/60 mb-2">Problem</div>
            {selectedProblem ? (
              <div className="bg-gradient-to-r from-red-500/80 to-orange-500/80 p-3 rounded-lg text-white text-sm relative group">
                {selectedProblem}
                <button
                  onClick={() => removeItem('problem')}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center text-white/40 text-sm">
                Drop problem here
              </div>
            )}
          </div>

          {/* Technology Drop Zone */}
          <div
            onDrop={() => handleDrop('technology')}
            onDragOver={handleDragOver}
            className={`min-h-24 p-4 rounded-lg border-2 border-dashed transition-all ${
              draggedItem?.category === 'technologies'
                ? 'border-cyan-400 bg-cyan-500/20 scale-105'
                : 'border-white/30 bg-white/5'
            }`}
          >
            <div className="text-xs text-white/60 mb-2">Technology</div>
            {selectedTech ? (
              <div className="bg-gradient-to-r from-blue-500/80 to-cyan-500/80 p-3 rounded-lg text-white text-sm relative group">
                {selectedTech}
                <button
                  onClick={() => removeItem('technology')}
                  className="absolute -top-2 -right-2 bg-cyan-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center text-white/40 text-sm">
                Drop technology here
              </div>
            )}
          </div>

          {/* Impact Drop Zone */}
          <div
            onDrop={() => handleDrop('impact')}
            onDragOver={handleDragOver}
            className={`min-h-24 p-4 rounded-lg border-2 border-dashed transition-all ${
              draggedItem?.category === 'impacts'
                ? 'border-green-400 bg-green-500/20 scale-105'
                : 'border-white/30 bg-white/5'
            }`}
          >
            <div className="text-xs text-white/60 mb-2">Impact</div>
            {selectedImpact ? (
              <div className="bg-gradient-to-r from-green-500/80 to-emerald-500/80 p-3 rounded-lg text-white text-sm relative group">
                {selectedImpact}
                <button
                  onClick={() => removeItem('impact')}
                  className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : (
              <div className="text-center text-white/40 text-sm">
                Drop impact here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Idea Result */}
      <AnimatePresence>
        {showResult && generatedIdea && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-orange-500/20 p-6 rounded-xl border-2 border-yellow-400/50 mb-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">💡</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-yellow-300 mb-2">
                  Your Generated Idea:
                </h4>
                <p className="text-white text-lg leading-relaxed">
                  {generatedIdea}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={resetSelection}
          className="px-6 py-3 bg-gray-600/80 hover:bg-gray-700/80 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
        >
          Reset
        </button>
        {generatedIdea && !isComplete && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleComplete}
            className="px-8 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-700 hover:to-pink-700 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Complete! 🎉
          </motion.button>
        )}
      </div>

      {/* Completion Message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 bg-green-500/20 border-2 border-green-400 rounded-lg text-center"
          >
            <p className="text-white text-lg font-semibold">
              {minigameData?.completion_message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}