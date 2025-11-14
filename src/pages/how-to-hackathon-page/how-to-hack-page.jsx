/*
    This is the Visual Novel Game 
*/

"use client"

import React, { useState, useEffect, useRef } from "react";
import GameScreen from "@/components/howToHack/gameScreen";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import GameIntroScene from "@/components/howToHack/introScene";
import MainMenu from "@/components/howToHack/mainMenu";
import GameSettings from "@/components/howToHack/gameSettings";
import { GameExit } from "@/components/howToHack/GameExit";
import GameFlow from "@/components/howToHack/gameFlow";
import TipsAndResources from "@/components/howToHack/tipsAndResources";
import GameControls from "@/components/howToHack/gameControls";
import ChapterManager from "@/components/howToHack/chapterManger"; // keep your import path as-is

// --- ADDED COMMENT: Optional future use: import { supabase } from "@/lib/supabaseClient"; to enable save/load ---

export default function HowToHackPage () {
    // Game States
    const [chapter, setChapter] = useState(1); // Chapter index of the game
    const [chapterData, setChapterData] = useState(null); // normalized chapter object (single source of truth)
    const [gameCharac, setGameCharac] = useState("byteon"); // Character for a chapter or event (initial/default)
    const [gameCharacPose, setGameCharacPose] = useState("standby"); // For specific Character pose 
    const [isLoading, setIsLoading] = useState(false); // for loading 
    const [background, setBackground] = useState("/images/kaede.jpg"); // TEMP: default to kaede for testing
    const [isMainMenu, setIsMainMenu] = useState(true); // if in main menu (start in main menu)
    const [isSettings, setIsSettings] = useState(false); // if in settings
    const [isExit, setIsExit] = useState(false); // if in exit and if data not saved

    // Mini game states
    const [isMiniGame, setIsMiniGame] = useState(false); // If mini game is happening
    const [isIntroPlaying, setIsIntroPlaying] = useState(false); // Intro scene (global); NOT used for per-chapter intro
    const [isOutroPlaying, setIsOutroPlaying] = useState(false); // Outro scene
    const [isCardGame, setIsCardGame] = useState(false); // Card Game Mini Game
    const [isMultipleChoice, setIsMultipleChoice] = useState(false); // Multiple Choice Mini Game
    
    // Data States
    const [gameData, setGameData] = useState(null); // raw JSON file root (kept for resources/tips)
    const [resources, setResources] = useState(null); // resources data from json
    const [tips, setTips] = useState(null); // tips and tricks from json

    // Skeleton loader — only shows if network or assets take too long to load
    const [slowLoading, setSlowLoading] = useState(false);

    // If the screen becomes too small
    const [tooSmall, setTooSmall] = useState(false);

    // Dialog/Typing States (kept for backwards compat if any UI needs them)
    const [dialog, setDialog] = useState(""); // Dialog text (can be updated by GameScreen)
    const [isTyping, setIsTyping] = useState(false); // Typewriter effect
    const bootingRef = useRef(true); // Check of website loading (kept as ref; unused here)

    // Intro → Main Menu
    const handleIntroFinish = () => {
        setIsIntroPlaying(false);
        setIsMainMenu(true);
    };

    // Main Menu → Game
    // NOTE: Instead of directly starting the game we now go into ChapterManager which will show the per-chapter intro.
    const handleStartGameFromMenu = () => {
        // hide main menu so ChapterManager can handle the per-chapter intro
        setIsMainMenu(false);
        // chapter (index) is already managed by state; ChapterManager will show intro before chapter start
    };

    // Legacy handler kept; redirect to our new handler to avoid accidental direct starts
    const handleStartGame = () => {
        handleStartGameFromMenu();
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
                // new format: { chapters: [ { ... } ], characters: [...] }
                normalized = { ...raw.chapters[0], characters: raw.characters ?? [] };
            } else if (raw && Array.isArray(raw.events)) {
                // already a single chapter object with events
                normalized = { ...raw, characters: raw.characters ?? [] };
            } else if (raw && Array.isArray(raw.scenarios)) {
                // older format: flatten scenarios -> events
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

            // Avoid ESLint "setState in effect" warning: reset any main-level indices (kept minimal)
            setTimeout(() => {
                // we keep these resets minimal because ChapterManager manages progression now
                // and will reset its own indices on new chapterData.
            }, 0);

            // Initial visuals setup (initial background / character for the chapter)
            const firstEvent = normalized?.events?.[0] ?? null;
            const firstDialog = firstEvent?.dialogs?.[0] ?? null;

            setBackground(firstEvent?.background ?? "/images/kaede.jpg");
            setGameCharac(firstDialog?.character ?? firstEvent?.character ?? "byteon");
            setGameCharacPose(firstDialog?.pose ?? firstEvent?.pose ?? "standby");

            // set the normalized chapter data — this is what ChapterManager expects
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

    // Fetch chapter when it changes
    useEffect(() => {
        loadChapter(chapter);
    }, [chapter]);

    // NOTE: progression (dialogs/events) is now handled by ChapterManager.
    // The previous "safe accessors" and handleNextDialog in this file were removed
    // to avoid conflicts. ChapterManager receives chapterData and onNextChapter callback.

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
                direction="vertical"
                className="w-full rounded-lg border border-fuchsia-400/80 mb-2"
            >
                <ResizablePanel defaultSize={80}>
                    <ResizablePanelGroup direction="horizontal">
                        <ResizablePanel defaultSize={70}>
                            <div className="flex flex-col h-full items-center justify-center p-6">
                                
                                { /* NOTE: per-chapter intro is now handled inside ChapterManager.
                                   The global GameIntroScene is not used for per-chapter intros.
                                   Keep GameIntroScene import if you still want a global prologue elsewhere. */ }

                                {isMainMenu ? (
                                    <MainMenu
                                        onStartGame={handleStartGameFromMenu}
                                        onLoadGame={() => console.log("Load Game clicked")}
                                        onSettings={() => console.log("Settings clicked")}
                                        onExit={() => console.log("Exit clicked")}
                                    />
                                ) : isSettings ? (
                                    <GameSettings />
                                ) : isExit ? (
                                    <GameExit />
                                ) : (
                                    // pass normalized chapterData to ChapterManager.
                                    // ChapterManager handles the per-chapter intro (Stay / Start Chapter)
                                    // and progression. Also give it a callback to return to Main Menu (Stay).
                                    <ChapterManager
                                        isFirstChapter={chapter === 1}
                                        chapterData={chapterData}
                                        onNextChapter={() => setChapter((prev) => prev + 1)}
                                        onBackToMenu={() => {
                                            // callback invoked when player presses "Stay" on the chapter intro
                                            setIsMainMenu(true);
                                        }}
                                    />
                                )}
                            </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        <ResizablePanel defaultSize={30}>
                            <ResizablePanelGroup direction="vertical">
                                <ResizablePanel defaultSize={60} className="p-4">
                                    <GameFlow chapter={chapter} scenario={0} event={0} />
                                </ResizablePanel>
                                <ResizableHandle />
                                <ResizablePanel defaultSize={40} className="p-4">
                                    <GameControls />
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={10} className="p-4">
                    <TipsAndResources />
                </ResizablePanel>
            </ResizablePanelGroup>

        </div> 
    )
}
