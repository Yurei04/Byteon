"use client"
import React, { useState } from "react";
import { Button } from "../ui/button";

export default function MiniGameMultipleChoice ({
    question = "Question?",
    choices = ["A","B","C","D"],
    correctAnswer = "",
    onCorrect = () => {},
    onWrong = () => {},
}) {

    const [answered, setAnswered] = useState(null)
    const [locked, setLocked] = useState(false)

    function buttonClass(choice) {
        if (!answered) return "w-full";
        if (choice === answered) {
            return choice === correctAnswer ? "w-full ring-2 ring-green-400" : "w-full ring-2 ring-red-400";
        }
        return "w-full opacity-60";
    }

    function answer (choice) {
        if (!choice || locked) return;
        setAnswered(choice);
        setLocked(true);
        if (choice === correctAnswer) {
            onCorrect();
        } else {
            onWrong();
        }
    }

    return (
        <>
            <div className="flex flex-col">
                <div className="flex items-center justify-center text-center mb-4">
                    <p className="text-base font-medium">
                        {question}
                    </p>
                </div>
                <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-3">
                    {choices.map((c, idx) => (
                        <Button
                            key={idx}
                            className={buttonClass(c)}
                            onClick={() => answer(c)}
                        >
                            {c}
                        </Button>
                    ))}
                </div>
            </div>
        </>
    )
}
