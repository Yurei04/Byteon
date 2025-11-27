import { motion } from "framer-motion";
import { BookOpen, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";

const TUTORIAL_CONTENT = {
  TrueOrFalseFlashCard: {
    title: "True or False Challenge",
    instructions: [
      "Read each statement carefully",
      "Choose TRUE or FALSE",
      "Click the button to answer",
      "Get instant feedback",
      "Finish all cards to complete"
    ],
    tips: "Think critically about every statement!",
    icon: "📝"
  },
  MultipleChoice: {
    title: "Multiple Choice Quiz",
    instructions: [
      "Read the question",
      "Review options",
      "Select the correct answer",
      "Submit to check",
      "Complete all items"
    ],
    tips: "Eliminate wrong choices first!",
    icon: "❓"
  },
  IdeaBuilderMiniGame: {
    title: "Idea Builder Challenge",
    instructions: [
      "Review the target idea",
      "Drag available pieces",
      "Place them in order",
      "Build step by step",
      "Submit when ready"
    ],
    tips: "Think logically about each piece!",
    icon: "🧩"
  }
};

export default function TutorialMiniGame({ minigameType = "TrueOrFalseFlashCard", onComplete }) {
  const tutorial = TUTORIAL_CONTENT[minigameType] || TUTORIAL_CONTENT.TrueOrFalseFlashCard;

  const handleStart = () => onComplete?.("tutorial_complete");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.25 }}
      className="w-full max-w-md mx-auto mb-24 z-50"
    >
      <div className="bg-gradient-to-br from-fuchsia-900/80 to-purple-900/80 backdrop-blur-xl 
      border-2 border-fuchsia-900 rounded-xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-600 to-purple-600 p-4 text-center relative">
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative z-10"
          >
            <div className="text-3xl mb-1">{tutorial.icon}</div>
            <h2 className="text-xl font-bold text-white">{tutorial.title}</h2>
            <div className="flex items-center justify-center gap-1 text-white/90 text-xs mt-1">
              <BookOpen className="w-4 h-4" />
              <span>Tutorial</span>
            </div>
          </motion.div>
        </div>

        {/* Instructions */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-1">
              <span className="text-xl">📋</span> How to Play
            </h3>
            <ul className="space-y-2">
              {tutorial.instructions.map((instruction, index) => (
                <motion.li
                  key={index}
                  initial={{ x: -15, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.25 + index * 0.1 }}
                  className="flex items-start gap-2 text-white/85 text-sm"
                >
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
                  <span>{instruction}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Tips */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-yellow-500/15 border border-yellow-400/30 rounded-lg p-3 text-sm"
          >
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="text-yellow-300 font-semibold text-sm mb-1">
                  Pro Tip
                </h4>
                <p className="text-white/85 text-xs">{tutorial.tips}</p>
              </div>
            </div>
          </motion.div>

          {/* Start Button */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-600 
              hover:from-fuchsia-500 hover:to-purple-500 text-white font-medium 
              py-3 rounded-lg shadow-md transition-all text-sm flex items-center 
              justify-center gap-2 cursor-pointer"
            >
              Start Challenge →
            </Button>
          </motion.div>

          {/* Skip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <Button
              onClick={handleStart}
              variant="none"
              className="text-white/50 hover:text-white/80 text-xs underline cursor-pointer"
            >
              Skip tutorial
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
