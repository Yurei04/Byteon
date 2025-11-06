
import React from "react";
import { Button } from "../ui/button";

export default function GameDialogBox ({
    text = "",
    character = "Narrator",
    chapter = 1,
    onNext = () => {},
}) {
    return (
        <div className="w-full h-full max-h-1/3 border border-white bg-black/60 p-4 flex flex-col justify-between">
            <div>
                <div className="text-xs text-gray-400 mb-1">Chapter {chapter} — {character}</div>
                <div className="text-lg font-sans leading-relaxed">{text}</div>
            </div>

            <div className="mt-4 flex justify-end">
                <Button onClick={onNext}>Next</Button>
            </div>
        </div>
    );
}
