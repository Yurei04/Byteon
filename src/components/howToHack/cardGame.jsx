"use client"
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";

export default function CardGame ({
    cards = ["Card A","Card B","Card C"],
    correctCard = null,
    onChoose = () => {},
}) {
    const [chosenAnswer, setChosenAnswer] = useState(null);
    const [locked, setLocked] = useState(false);

    const checkAnswer = (value) => {
        if (locked) return;
        setChosenAnswer(value);
        setLocked(true);
        const isCorrect = value === correctCard;
        onChoose(value, isCorrect);
    }

    useEffect(() => {
        
        if (locked) {
            // small visual delay or sound could be triggered here
        }
    }, [locked])

    return (
        <div className="p-4">
            <div className="mb-4 text-center">Pick a card</div>
            <div className="flex gap-4 justify-center">
                {cards.map((card, idx) => (
                    <Button
                        key={idx}
                        onClick={() => checkAnswer(card)}
                        value={card}
                    >
                        {card}
                    </Button>
                ))}
            </div>

            {chosenAnswer && (
                <div className="mt-3 text-center">
                    {chosenAnswer === correctCard ? (
                        <span className="text-green-400">Correct!</span>
                    ) : (
                        <span className="text-red-400">Wrong</span>
                    )}
                </div>
            )}
        </div>
    )
}
