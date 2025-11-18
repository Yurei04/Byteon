"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TrueOrFalseFlashGame({ data, onComplete }) {
const questions = data?.questions ?? [];
const total = questions.length;

const [index, setIndex] = useState(0);
const [score, setScore] = useState(0);
const [answered, setAnswered] = useState(null);

const q = questions[index];

const handleAnswer = (choice) => {
    if (answered !== null) return;

    const isCorrect = choice === q.correct_answer;
    setAnswered(choice);

    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
    setAnswered(null);

    if (index + 1 < total) {
        setIndex((i) => i + 1);
    } else {
        // FINISHED
        onComplete?.({
            score,
            total,
            achievement: data?.achievement ?? null,
        });
    }
    }, 700);
};

return (
    <div className="w-full max-w-3xl mx-auto p-4 bg-black/70 border border-white/20 rounded-xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2">{data.minigame_title}</h2>
            <p className="text-sm text-gray-300 mb-4">{data.description}</p>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={q?.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="p-4 bg-black/40 border border-fuchsia-500 rounded-lg"
                >
                <p className="text-lg">{q?.statement}</p>

                {answered !== null && (
                    <div className="mt-2 text-sm text-fuchsia-200 italic">
                        {q.aira_reaction}
                    </div>
                )}
                </motion.div>
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
                <button
                className={`flex-1 py-2 rounded-md border ${
                    answered === true
                    ? "bg-green-600"
                    : "bg-black/40 border-green-400"
                }`}
                onClick={() => handleAnswer(true)}
                >
                True
                </button>

                <button
                    className={`flex-1 py-2 rounded-md border ${
                        answered === false
                        ? "bg-red-600"
                        : "bg-black/40 border-red-400"
                    }`}
                    onClick={() => handleAnswer(false)}
                >
                False
                </button>
            </div>

            {/* Progress */}
            <div className="mt-4 text-sm text-gray-300">
                {index + 1} / {total}
            </div>
        </div>
    );
}
