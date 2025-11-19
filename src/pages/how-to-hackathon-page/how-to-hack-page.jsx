"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import MainMenu from "@/components/howToHack/mainMenu";
import GameSettings from "@/components/howToHack/gameSettings";
import { GameExit } from "@/components/howToHack/GameExit";
import GameFlow from "@/components/howToHack/gameFlow";
import GameControls from "@/components/howToHack/gameControls";
import ChapterManager from "@/components/howToHack/chapterManger";

export default function HowToHackPage() {
    /* ----------------------------- STATE HOOKS FIRST ----------------------------- */

    const [chapter, setChapter] = useState(1);
    const [chapterData, setChapterData] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isMainMenu, setIsMainMenu] = useState(true);
    const [isSettings, setIsSettings] = useState(false);
    const [isExit, setIsExit] = useState(false);
    const [isStartGame, setIsStartGame] = useState(false);

    const [gameFlowState, setGameFlowState] = useState({
        eventIndex: 0,
        dialogIndex: 0,
        isShowingMinigame: false,
    });

    const [slowLoading, setSlowLoading] = useState(false);
    const [tooSmall, setTooSmall] = useState(false);

    /* ------------------------------ STABLE CALLBACKS ----------------------------- */

    const handleStartGameFromMenu = useCallback(() => {
        setIsMainMenu(false);
        setIsStartGame(true);
    }, []);

    const handleNextChapter = useCallback(() => {
        setChapter((prev) => prev + 1);
    }, []);

    const handleBackToMenu = useCallback(() => {
        setIsMainMenu(true);
    }, []);

    const handleStateChange = useCallback((state) => {
        setGameFlowState((prev) => {
            if (
                prev.eventIndex === state.eventIndex &&
                prev.dialogIndex === state.dialogIndex &&
                prev.isShowingMinigame === state.isShowingMinigame
            ) return prev;

            return state;
        });
    }, []);

    /* ------------------------------ LOAD CHAPTER ------------------------------ */

    const loadChapter = useCallback(async (id) => {
        try {
            setIsLoading(true);

            const res = await fetch(`/data/chapter${id}.json`);
            if (!res.ok) {
                console.warn(`Failed to load chapter file /data/chapter${id}.json`);
                setChapterData(null);
                return;
            }

            const raw = await res.json();
            let normalized = null;

            if (raw?.chapters?.length > 0) {
                normalized = { ...raw.chapters[0], characters: raw.characters ?? [] };
            } else if (raw?.events) {
                normalized = { ...raw, characters: raw.characters ?? [] };
            } else if (raw?.scenarios) {
                const flattenedEvents = raw.scenarios.flatMap((s) => s.events ?? []);
                normalized = {
                    id: raw.id ?? `chapter${id}`,
                    title: raw.title ?? "",
                    events: flattenedEvents,
                    characters: raw.characters ?? [],
                };
            }

            setChapterData(normalized);
        } catch (err) {
            console.error("Error loading chapter:", err);
            setChapterData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /* ------------------------------ WINDOW RESIZE CHECK ------------------------------ */

    useEffect(() => {
        const handleResize = () => {
            setTooSmall(window.innerWidth < 1280 || window.innerHeight < 720);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    /* ------------------------------ CHAPTER EFFECT ------------------------------ */

    useEffect(() => {
        loadChapter(chapter);
    }, [chapter, loadChapter]);

    /* ------------------------------ MEMOIZED UI BLOCKS ------------------------------ */

    const chapterManagerElement = useMemo(() => {
        return (
            <ChapterManager
                chapterGameIndex={chapter}
                chapterData={chapterData}
                onNextChapter={handleNextChapter}
                onBackToMenu={handleBackToMenu}
                onStateChange={handleStateChange}
            />
        );
    }, [chapter, chapterData, handleNextChapter, handleBackToMenu, handleStateChange]);

    const gameFlowElement = useMemo(() => {
        return (
            <GameFlow
                chapterData={chapterData}
                currentEventIndex={gameFlowState.eventIndex}
                currentDialogIndex={gameFlowState.dialogIndex}
                isShowingMinigame={gameFlowState.isShowingMinigame}
            />
        );
    }, [chapterData, gameFlowState]);

    /* ------------------------------ EARLY RETURNS (AFTER HOOKS!) ------------------------------ */

    if (slowLoading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-purple-300">
                <div className="animate-pulse">
                    <p>Website Loading…</p>
                </div>
            </div>
        );
    }

    if (tooSmall) {
        return (
            <div className="fixed inset-0 bg-black text-purple-400 flex flex-col justify-center items-center">
                <p className="text-xl mb-2">⚠️ Screen Too Small</p>
                <p>Please use at least 1280×720 or fullscreen mode.</p>
            </div>
        );
    }

    /* ------------------------------ MAIN RENDER ------------------------------ */

    return (
        <div className="w-full h-screen flex flex-col p-4">
            <ResizablePanelGroup direction="vertical" className="rounded-lg border border-fuchsia-400/80 mb-2">
                <ResizablePanel defaultSize={80}>
                    <ResizablePanelGroup direction="horizontal">

                        {/* LEFT SCREEN */}
                        <ResizablePanel defaultSize={70}>
                            <div className="flex flex-col h-full items-center justify-center p-6">
                                {isMainMenu ? (
                                    <MainMenu
                                        onStartGame={handleStartGameFromMenu}
                                        onLoadGame={() => {}}
                                        onSettings={() => setIsSettings(true)}
                                        onExit={() => setIsExit(true)}
                                    />
                                ) : isSettings ? (
                                    <GameSettings onBack={() => setIsSettings(false)} />
                                ) : isExit ? (
                                    <GameExit onBack={() => setIsExit(false)} />
                                ) : (
                                    chapterManagerElement
                                )}
                            </div>
                        </ResizablePanel>

                        <ResizableHandle />

                        {/* RIGHT SIDE */}
                        <ResizablePanel defaultSize={30}>
                            <ResizablePanelGroup direction="vertical">

                                {/* Top: GameFlow */}
                                <ResizablePanel defaultSize={60}>
                                    {isStartGame ? (
                                        <div className="h-full bg-gray-950 p-4 overflow-hidden">
                                            {gameFlowElement}
                                        </div>
                                    ) : (
                                        <div className="text-white flex h-full justify-center items-center">
                                            <h1>Welcome To Byteon Visual Novel</h1>
                                        </div>
                                    )}
                                </ResizablePanel>

                                <ResizableHandle />

                                {/* Bottom: Controls */}
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
