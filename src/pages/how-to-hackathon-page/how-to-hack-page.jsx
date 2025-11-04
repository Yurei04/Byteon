/*
    This is the Visual Novel Game 
*/

"use client"

import { ChartScatter } from "lucide-react";
import React, { useState, useEffect } from "react";


export default function HowToHackPage () {
    // Game States
    const [chapter, setChapter] = useState(1); //Chapter index of the game
    const [chapterData, setChapterData] = useState(null); // Chapter Data
    const [scenarioIndex, setScenerioIndex] = useState(0); // Scenerio index for a chapter
    const [eventIndex, setEventIndex] = useState(0); // event index for a scenario
    const [dialogIndex, setDialogIndex] = useState(0); // Dialog index for a scenario
    const [gameCharac, setGameCharac] = useState("byteon"); // Chracter for a chapter or event
    const [loading, setLoading] = useState(false); // for loading 

    // Mini game states
    const [isIntroPlaying, setIsIntroPlaying] = useState(true); // Intro scene
    const [isOutroPlaying, setIsOutroPlaying] = useState(false); // Intro scene
    const [isCardGame, setIsCardGame] = useState(false); // Card Game Mini Game
    const [isMultipleChoice, setIsMultipleChoice] = useState(false); // Multiple Choice Mini Game
    
    //Data States
    const [gameData, setGameData] = useState(null); // Data from the jsond

    // Dialog/Typing States
    const [dialog, setDialog] = useState(""); // Dialog text
    const [isTyping, setIsTyping] = useState(false); // Typewriter effect

    const [booting, setBooting] = React.useState(true); // Check of website loading
    
    // Chapter Loading base on Chapter and ID
    const loadChapter = async (id) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/data/chapter${id}.json`);
            const data = await response.json();
            console.log("Data Loaded")
            setChapterData(data);
        } catch (error) {
            console.error("Failed to load chapter:", error);
        } finally {
            setIsLoading(false);
    }
  };

    //Fetch chapter when it changes
    useEffect(() => {
        loadChapter(chapter);
    }, [chapter]);

    // Safe accessors
    const currentScenario = chapterData?.scenarios?.[scenarioIndex]; // Get Scenario data based on Chapter and index
    const currentEvent = ChartScatter?.events?.[eventIndex]; // Get event data based on Chapter and index
    const currentDialog = currentEvent?.dialogs?.[dialogIndex]; // Get dialog data based on Chapter and index

    //  Game Progression Logic (Modify later for characters includes and mini games)
    const handleNextDialog = () => {
        if (!chapterData) return; // If no data don't do below
        // Move to next dialog
        if (dialogIndex + 1 < currentEvent.dialogs.length) {
            setDialogIndex((prev) => prev + 1);
        } else if (eventIndex + 1 < currentScenario.events.length) {
            // Move to next event
            setEventIndex((prev) => prev + 1);
            setDialogIndex(0);
        } else if (scenarioIndex + 1 < chapterData.scenarios.length) {
            // Move to next scenario
            setScenarioIndex((prev) => prev + 1);
            setEventIndex(0);
            setDialogIndex(0);
        } else {
            // Move to next chapter
            setChapter((prev) => prev + 1);
            setScenarioIndex(0);
            setEventIndex(0);
            setDialogIndex(0);
        }
    };

    if (slowLoading) {
        return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-purple-300">
            <div className="animate-pulse flex flex-col items-center">
            <div className="w-40 h-40 bg-purple-800/30 rounded-full mb-6" />
            <p className="text-lg font-mono tracking-wide mb-2">
                Website Loading.....
            </p>
            <p className="text-sm text-purple-500">
                Weak network latency...
            </p>
            </div>
        </div>
        );
    }
    
    if (tooSmall) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-purple-400 text-center">
                <p className="text-xl mb-2">⚠️ Resize Detected</p>
                <p className="text-sm">Please use a 1920×1080 screen or fullscreen mode for best experience.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col p-2">
            <div className="flex flex-row">
                <div className="flex flex-col">

                </div>
                <div className="flex flex-col">

                </div>
            </div>
            <div className="">

            </div>
        </div> 
    )
}