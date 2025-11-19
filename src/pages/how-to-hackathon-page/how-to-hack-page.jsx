"use client"

import React, { useState, useEffect, useRef } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import MainMenu from "@/components/howToHack/mainMenu";
import GameSettings from "@/components/howToHack/gameSettings";
import { GameExit } from "@/components/howToHack/GameExit";
import GameFlow from "@/components/howToHack/gameFlow";
import GameControls from "@/components/howToHack/gameControls";
import ChapterManager from "@/components/howToHack/chapterManger";

export default function HowToHackPage() {
    // Game States
    const [chapter, setChapter] = useState(1);
    const [chapterData, setChapterData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMainMenu, setIsMainMenu] = useState(true);
    const [isSettings, setIsSettings] = useState(false);
    const [isExit, setIsExit] = useState(false);

    // NEW: Track ChapterManager's internal state
    const [gameFlowState, setGameFlowState] = useState({
        eventIndex: 0,
        dialogIndex: 0,
        isShowingMinigame: false
    });

    // Skeleton loader
    const [slowLoading, setSlowLoading] = useState(false);
    const [tooSmall, setTooSmall] = useState(false);

    // Main Menu → Game
    const handleStartGameFromMenu = () => {
        setIsMainMenu(false);
    };

    // Chapter Loading
    const loadChapter = async (id) => {
        try {
            setIsLoading(true);

            const res = await fetch(`/data/chapter${id}.json`);
            if (!res.ok) {
                console.warn(`Failed to fetch chapter file: /data/chapter${id}.json (status ${res.status})`);
                setChapterData(null);
                return;
            }

            const raw = await res.json();

            // Normalize JSON format
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

            console.debug("[HowToHackPage] Loaded chapter:", normalized);
            setChapterData(normalized);
        } catch (error) {
            console.error("Failed to load chapter:", error);
            setChapterData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Resize check
    useEffect(() => {
        const handleResize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
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

    // Skeleton Loader
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
    
    // Screen too small
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
                        {/* LEFT: Main Game Screen */}
                        <ResizablePanel defaultSize={70}>
                            <div className="flex flex-col h-full items-center justify-center p-6">
                                {isMainMenu ? (
                                    <MainMenu
                                        onStartGame={handleStartGameFromMenu}
                                        onLoadGame={() => console.log("Load Game clicked")}
                                        onSettings={() => setIsSettings(true)}
                                        onExit={() => setIsExit(true)}
                                    />
                                ) : isSettings ? (
                                    <GameSettings onBack={() => setIsSettings(false)} />
                                ) : isExit ? (
                                    <GameExit onBack={() => setIsExit(false)} />
                                ) : (
                                    <ChapterManager
                                        chapterGameIndex={chapter}
                                        chapterData={chapterData}
                                        onNextChapter={() => setChapter((prev) => prev + 1)}
                                        onBackToMenu={() => setIsMainMenu(true)}
                                        onStateChange={(state) => setGameFlowState(state)}
                                    />
                                )}
                            </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* RIGHT: GameFlow & Controls */}
                        <ResizablePanel defaultSize={30}>
                            <ResizablePanelGroup direction="vertical">
                                {/* GameFlow Panel */}
                                <ResizablePanel defaultSize={60}>
                                    <div className="h-full bg-gray-950 p-4 overflow-hidden">
                                        <GameFlow
                                            chapterData={chapterData}
                                            currentEventIndex={gameFlowState.eventIndex}
                                            currentDialogIndex={gameFlowState.dialogIndex}
                                            isShowingMinigame={gameFlowState.isShowingMinigame}
                                        />
                                    </div>
                                </ResizablePanel>
                                
                                <ResizableHandle />
                                
                                {/* Controls Panel */}
                                <ResizablePanel defaultSize={40}>
                                    <div className="h-full bg-gray-950 p-4">
                                        <GameControls />
                                    </div>
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}