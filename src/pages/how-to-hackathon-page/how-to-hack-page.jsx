/*
    This is the Visual Novel Game 
*/

"use client"

import React, { useState, useEffect } from "react";
import GameScreen from "@/components/howToHack/gameScreen";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import GameIntroScene from "@/components/howToHack/introScene";
import MainMenu from "@/components/howToHack/mainMenu";
import GameSettings from "@/components/howToHack/gameSettings";
import { GameExit } from "@/components/howToHack/GameExit";
import GameFlow from "@/components/howToHack/gameFlow";
import TipsAndResources from "@/components/howToHack/tipsAndResources";
import GameControls from "@/components/howToHack/gameControls";
import ChapterManager from "@/components/howToHack/chapterManger";
// --- ADDED COMMENT: Optional future use: import { supabase } from "@/lib/supabaseClient"; to enable save/load ---

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
    const [background, setBackground] = useState("/images/kaede.jpg") // TEMP: default to kaede for testing
    const [isMainMenu, setIsMainMenu] = useState(false); // if in main menu
    const [isSettings, setIsSettings] = useState(false); // if in settings
    const [isExit, setIsExit] = useState(false); // if in exit and if data not saved

    // Mini game states
    const [isMiniGame, setIsMiniGame] = useState(false) // If mini game is happening
    const [isIntroPlaying, setIsIntroPlaying] = useState(true); // Intro scene
    const [isOutroPlaying, setIsOutroPlaying] = useState(false); // Intro scene
    const [isCardGame, setIsCardGame] = useState(false); // Card Game Mini Game
    const [isMultipleChoice, setIsMultipleChoice] = useState(false); // Multiple Choice Mini Game
    
    //Data States
    const [gameData, setGameData] = useState(null); // Data from the jsond
    const [resources, setResources] = useState(null); // resources data from json
    const [tips, setTips] = useState(null); // tips and tricks from json

    // Skeleton loader — only shows if network or assets take too long to load
    const [slowLoading, setSlowLoading] = useState(false);

    // If the screen becomes to small
    const [tooSmall, setTooSmall] = useState(false);

    // Dialog/Typing States
    const [dialog, setDialog] = useState(""); // Dialog text
    const [isTyping, setIsTyping] = useState(false); // Typewriter effect
    const [booting, setBooting] = React.useState(true); // Check of website loading

    // Intro → Main Menu
    const handleIntroFinish = () => {
        setIsIntroPlaying(false);
        setIsMainMenu(true);
    };

    // Main Menu → Game
    const handleStartGame = () => {
        setIsMainMenu(false);
    };

    // Chapter Loading base on Chapter and ID
    const loadChapter = async (id) => {
        try {
            setIsLoading(true);

            const res = await fetch(`/data/chapter${id}.json`);
            if (!res.ok) {
            console.warn(`Failed to fetch chapter file: /data/chapter${id}.json (status ${res.status})`);
            setChapterData(null);
            setGameData(null);
            return;
            }

            const raw = await res.json();
            setGameData(raw ?? null);

            // --- Normalize both new and old JSON formats ---
            let normalized = null;

            if (raw && Array.isArray(raw.chapters) && raw.chapters.length > 0) {
                normalized = { ...raw.chapters[0], characters: raw.characters ?? [] };
            } else if (raw && Array.isArray(raw.events)) {
                normalized = { ...raw, characters: raw.characters ?? [] };
            } else if (raw && Array.isArray(raw.scenarios)) {
        
                const flattenedEvents = raw.scenarios.flatMap((s) => s.events ?? []);
                normalized = {
                    id: raw.id ?? `chapter${id}`,
                    title: raw.title ?? "",
                    events: flattenedEvents,
                    characters: raw.characters ?? [],
                };
            } else {
                normalized = null;
            }

            // Debug logs to verify the shape in console
            console.debug("[HowToHackPage] raw loaded:", raw);
            console.debug("[HowToHackPage] normalized chapter:", normalized);

            // Avoid ESLint "setState in effect" warning
            setTimeout(() => {
                setScenarioIndex(0);
                setEventIndex(0);
                setDialogIndex(0);
            }, 0);

            const firstEvent = normalized?.events?.[0] ?? null;
            const firstDialog = firstEvent?.dialogs?.[0] ?? null;

            setBackground(firstEvent?.background ?? "/images/kaede.jpg");
            setGameCharac(firstDialog?.character ?? firstEvent?.character ?? "byteon");
            setGameCharacPose(firstDialog?.pose ?? firstEvent?.pose ?? "standby");

            setChapterData(normalized);
        } catch (error) {
            console.error("Failed to load chapter:", error);
            setChapterData(null);
            setGameData(null);
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
    console.log(currentScenario)
    const currentEvent = currentScenario?.events?.[eventIndex]; // Get event data based on Chapter and index
    console.log(currentEvent)
    const currentDialog = currentEvent?.dialogs?.[dialogIndex]; // Get dialog data based on Chapter and index
    console.log(currentDialog)

    // Dynamically update visuals when event changes ---
    useEffect(() => {
        if (currentEvent) {
            setBackground(currentEvent.background ?? "/images/kaede.jpg");
            // If the event contains a "character" field you'd use it; otherwise we derive speaker from dialog
            setGameCharac(currentEvent.character ?? gameCharac);
            setGameCharacPose(currentEvent.pose ?? gameCharacPose);
        }
    }, [currentEvent, gameCharac, gameCharacPose]);

    // Update visuals when the active dialog changes (we use speaker/pose inside each dialog)
    useEffect(() => {
        if (currentDialog) {
            // Set background from event (fallback to kaede)
            setBackground(currentEvent?.background ?? "/images/kaede.jpg");

            // Prefer speaker from dialog for character visuals
            const speakerName = currentDialog.speaker ?? null;
            if (speakerName) {
                // keep the original speaker string (e.g., "Kaede") so GameScreen can map to an image
                setGameCharac(speakerName);
            }

            // Pose from dialog (if available)
            setGameCharacPose(currentDialog.pose ?? currentEvent?.pose ?? "standby");
        }
    }, [currentDialog, currentEvent]);

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
                className="w-full rounded-lg border border-fuchsia-400/80 mb-2"
                >
                <ResizablePanel defaultSize={120}>
                    <div className="flex flex-col h-full items-center justify-center p-6">
                        
                        {isIntroPlaying ? (
                            <GameIntroScene onFinish={handleIntroFinish} /> 
                        ) : isMainMenu ? (
                            <MainMenu
                                onStartGame={handleStartGame}
                                onLoadGame={() => console.log("Load Game clicked")}
                                onSettings={() => console.log("Settings clicked")}
                                onExit={() => console.log("Exit clicked")}
                            />
                        ) : isSettings ? (
                            <GameSettings />
                        ) : isExit ? (
                            <GameExit />
                        ) : (
                            <ChapterManager
                            chapterData={chapterData}
                            onNextChapter={() => setChapter((prev) => prev + 1)}
                            />
                        )}
                    </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50}>
                    <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={50} className="p-4">
                        <GameFlow 
                            chapter={chapter}
                            scenario={scenarioIndex}
                            event={eventIndex}
                        />
                    </ResizablePanel>
                    <ResizableHandle />
                    <ResizablePanel defaultSize={50} className="p-4">
                        <GameControls />
                    </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
            <div className="w-full h-1/4 border border-white">
                <TipsAndResources />
            </div>
        </div> 
    )
}
