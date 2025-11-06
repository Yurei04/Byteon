/*
    This is the Visual Novel Game 
*/

"use client"

import React, { useState, useEffect } from "react";
import GameScreen from "@/components/howToHack/gameScreen";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function HowToHackPage () {
    // Game States
    const [chapter, setChapter] = useState(1); //Chapter index of the game
    const [chapterData, setChapterData] = useState(null); // Chapter Data
    const [scenarioIndex, setScenarioIndex] = useState(0); // Scenerio index for a chapter
    const [eventIndex, setEventIndex] = useState(0); // event index for a scenario
    const [dialogIndex, setDialogIndex] = useState(0); // Dialog index for a scenario
    const [gameCharac, setGameCharac] = useState("byteon"); // Chracter for a chapter or event
    const [gameCharacPose, setGameCharacPose] = useState("standby") // For specific Character pose 
    const [isLoading, setIsLoading] = useState(false); // for loading 
    const [background, setBackground] = useState("") // set background depending to scenario
    // Mini game states
    const [isMiniGame, setIsMiniGame] = useState(false) // If mini game is happening
    const [isIntroPlaying, setIsIntroPlaying] = useState(true); // Intro scene
    const [isOutroPlaying, setIsOutroPlaying] = useState(false); // Intro scene
    const [isCardGame, setIsCardGame] = useState(false); // Card Game Mini Game
    const [isMultipleChoice, setIsMultipleChoice] = useState(false); // Multiple Choice Mini Game
    
    //Data States
    const [gameData, setGameData] = useState(null); // Data from the jsond
    
    // Skeleton loader — only shows if network or assets take too long to load
    const [slowLoading, setSlowLoading] = useState(false);

    // If the screen becomes to small
    const [tooSmall, setTooSmall] = useState(false);

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
            // reset indices when a new chapter loads to avoid out-of-range indices
            setScenarioIndex(0);
            setEventIndex(0);
            setDialogIndex(0);
        } catch (error) {
            console.error("Failed to load chapter:", error);
        } finally {
            setIsLoading(false);
        }
    };
    // Checks for resize of window screen
    useEffect(() => {
        const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Replace 1280x720 with your expected design size
        setTooSmall(w < 1280 || h < 720);
        };
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    //Fetch chapter when it changes
    useEffect(() => {
        loadChapter(chapter);
    }, [chapter]);

    // Safe accessors
    // use chapterData -> scenarios -> events -> dialogs
    const currentScenario = chapterData?.scenarios?.[scenarioIndex]; // Get Scenario data based on Chapter and index
    const currentEvent = currentScenario?.events?.[eventIndex]; // Get event data based on Chapter and index
    const currentDialog = currentEvent?.dialogs?.[dialogIndex]; // Get dialog data based on Chapter and index

    //  Game Progression Logic (Modify later for characters includes and mini games)
    const handleNextDialog = () => {
        if (!chapterData) return; // If no data don't do below
        // Move to next dialog
        if (currentEvent && dialogIndex + 1 < (currentEvent.dialogs?.length ?? 0)) {
            setDialogIndex((prev) => prev + 1);
        } else if (currentScenario && eventIndex + 1 < (currentScenario.events?.length ?? 0)) {
            // Move to next event
            setEventIndex((prev) => prev + 1);
            setDialogIndex(0);
        } else if (scenarioIndex + 1 < (chapterData.scenarios?.length ?? 0)) {
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

    // Skeleton Loader if the internet is slow
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
    
    // Reveal if the screen size is lowered or changed
    if (tooSmall) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center text-purple-400 text-center">
                <p className="text-xl mb-2">⚠️ Resize Detected</p>
                <p className="text-sm">Please use a 1920×1080 screen or fullscreen mode for best experience.</p>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col p-4">
            <ResizablePanelGroup
                direction="horizontal"
                className="w-full rounded-lg border border-white m-2"
                >
                <ResizablePanel defaultSize={120}>
                    <div className="flex flex-col h-full items-center justify-center p-6">
                        <GameScreen 
                            // pass down the current dialog object and a next handler
                            gameStart={!isIntroPlaying}
                            gameCharac={gameCharac}
                            characPose={gameCharacPose}
                            dialog={currentDialog?.text ?? ""}
                            chapter={chapter}
                            event={eventIndex}
                            scenario={scenarioIndex}
                            background={background}
                            choices={currentDialog?.choices ?? null}
                            miniGames={isMiniGame}
                            MultipleChoiceComponent={isMultipleChoice ? undefined : undefined} // placeholder — wire your components here
                            CardGameComponent={isCardGame ? undefined : undefined} // placeholder — wire your components here
                            onNext={handleNextDialog}
                        />
                        
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={25}>
                        <div className="flex h-full items-center justify-center p-6">
                            <span className="font-semibold">Two</span>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={75}>
                        <div className="flex h-full items-center justify-center p-6">
                            <span className="font-semibold">Three</span>
                        </div>
                    </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
            <div className="w-full h-1/4 border border-white">

            </div>
        </div> 
    )
}
