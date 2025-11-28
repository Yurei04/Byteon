"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import audioService from "@/lib/audioService";
import MainMenu from "@/components/howToHack/mainMenu";
import dynamic from "next/dynamic";

const GameSettings = dynamic(() => import("@/components/howToHack/gameSettings"), {
    ssr: false,
});
const GameExit = dynamic(() => import("@/components/howToHack/GameExit"), {
    ssr: false,
});
const GameFlow = dynamic(() => import("@/components/howToHack/gameFlow"), {
    ssr: false,
});
const ChapterManager = dynamic(() => import("@/components/howToHack/chapterManger"), {
    ssr: false,
});
const EndCredits = dynamic(() => import("@/components/howToHack/endCredits"), {
    ssr: false,
});
const TipsAndResources = dynamic(() => import("@/components/howToHack/tipsAndResources"), {
    ssr: false,
});
const AudioPermissionDialog = dynamic(() => import("@/components/howToHack/audioPermissionDialogBox"), {
    ssr: false,
});


export default function HowToHackPage() {
    /* ----------------------------- STATE HOOKS FIRST ----------------------------- */

    const [chapter, setChapter] = useState(1);
    const [chapterData, setChapterData] = useState(null);
    const [showAudioPermission, setShowAudioPermission] = useState(false);
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isMainMenu, setIsMainMenu] = useState(true);
    const [isSettings, setIsSettings] = useState(false);
    const [isExit, setIsExit] = useState(false);
    const [isStartGame, setIsStartGame] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

    const [gameFlowState, setGameFlowState] = useState({
        eventIndex: 0,
        dialogIndex: 0,
        isShowingMinigame: false,
    });

    const [slowLoading, setSlowLoading] = useState(false);
    const [tooSmall, setTooSmall] = useState(false);

    // Show audio permission dialog on mount (main menu)
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAudioPermission(true);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const handleAudioAccept = async () => {
        setShowAudioPermission(false);
        setAudioEnabled(true);
        
        try {
            await audioService.initialize();
            await audioService.playBackgroundMusic();
            console.log('[HowToHackPage] Audio enabled and music started');
        } catch (error) {
            console.error('[HowToHackPage] Failed to start audio:', error);
        }
    };

    const handleAudioDecline = () => {
        setShowAudioPermission(false);
        setAudioEnabled(false);
        console.log('[HowToHackPage] Audio disabled by user');
    };
    
    
    
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
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
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

    /* ------------------------------ MOBILE LAYOUT ------------------------------ */

    if (isMobile) {
        return (
            <div className="w-full h-screen flex flex-col bg-gray-950 overflow-hidden z-50">
                <AudioPermissionDialog
                    isOpen={showAudioPermission}
                    onAccept={handleAudioAccept}
                    onDecline={handleAudioDecline}
                />
                
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-3 bg-gray-900 border-b border-fuchsia-400/50">
                    <h1 className="text-fuchsia-400 font-bold text-lg">How to Hack</h1>
                    {isStartGame && (
                        <button
                            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                            className="px-3 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 active:bg-fuchsia-800 text-white rounded-md text-sm transition-colors"
                        >
                            {showMobileSidebar ? 'Hide Info' : 'Show Info'}
                        </button>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Game Screen */}
                    <div className="h-full w-full">
                        {isMainMenu ? (
                            <div className="flex h-full items-center justify-center p-4">
                                <MainMenu
                                    onStartGame={handleStartGameFromMenu}
                                    onLoadGame={() => {
                                        if (audioEnabled && window.audioManager) {
                                            window.audioManager.playClick();
                                        }
                                    }}
                                    onSettings={() => {
                                        if (audioEnabled && window.audioManager) {
                                            window.audioManager.playClick();
                                        }
                                        setIsSettings(true);
                                    }}
                                    onExit={() => {
                                        if (audioEnabled && window.audioManager) {
                                            window.audioManager.playClick();
                                        }
                                        setIsExit(true);
                                    }}
                                />
                            </div>
                        ) : isSettings ? (
                            <div className="flex h-full items-center justify-center p-4">
                                <GameSettings onBack={() => {
                                    if (audioEnabled && window.audioManager) {
                                        window.audioManager.playClick();
                                    }
                                    setIsSettings(false);
                                }} />
                            </div>
                        ) : isExit ? (
                            <div className="flex h-full items-center justify-center p-4">
                                <GameExit onBack={() => {
                                    if (audioEnabled && window.audioManager) {
                                        window.audioManager.playClick();
                                    }
                                    setIsExit(false);
                                }} />
                            </div>
                        ) : (
                            <div className="h-full">
                                {chapterManagerElement}
                            </div>
                        )}
                    </div>

                    {/* Mobile Sidebar Overlay */}
                    {showMobileSidebar && isStartGame && (
                        <div 
                            className="absolute inset-0 bg-black/50 z-40"
                            onClick={() => setShowMobileSidebar(false)}
                        >
                            <div 
                                className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-gray-900 border-l border-fuchsia-400/50 overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-fuchsia-400 font-semibold text-lg">Game Info</h2>
                                        <button
                                            onClick={() => setShowMobileSidebar(false)}
                                            className="text-white hover:text-fuchsia-400 text-2xl leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>
                                    {gameFlowElement}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Bottom Tips (when not in game) */}
                {!isStartGame && !isSettings && !isExit && isMainMenu && (
                    <div className="border-t border-fuchsia-400/50 bg-gray-900 p-4 max-h-48 overflow-y-auto">
                        <TipsAndResources />
                    </div>
                )}
            </div>
        );
    }

    /* ------------------------------ DESKTOP LAYOUT ------------------------------ */

    return (
        <div className="w-full h-screen flex bg-gray-950 flex-col p-2 sm:p-4">
            <AudioPermissionDialog
                isOpen={showAudioPermission}
                onAccept={handleAudioAccept}
                onDecline={handleAudioDecline}
            />
            <ResizablePanelGroup direction="vertical" className="rounded-lg border border-fuchsia-400/80 mb-2">
                <ResizablePanel defaultSize={80}>
                    <ResizablePanelGroup direction="horizontal">

                        {/* LEFT SCREEN */}
                        <ResizablePanel defaultSize={70}>
                            <div className="flex flex-col h-full items-center justify-center p-3 sm:p-6">
                                {isMainMenu ? (
                                    <MainMenu
                                        onStartGame={handleStartGameFromMenu}
                                        onLoadGame={() => {
                                            if (audioEnabled && window.audioManager) {
                                                window.audioManager.playClick();
                                            }
                                        }}
                                        onSettings={() => {
                                            if (audioEnabled && window.audioManager) {
                                                window.audioManager.playClick();
                                            }
                                            setIsSettings(true);
                                        }}
                                        onExit={() => {
                                            if (audioEnabled && window.audioManager) {
                                                window.audioManager.playClick();
                                            }
                                            setIsExit(true);
                                        }}
                                    />
                                ) : isSettings ? (
                                    <GameSettings onBack={() => {
                                        if (audioEnabled && window.audioManager) {
                                            window.audioManager.playClick();
                                        }
                                        setIsSettings(false);
                                    }} />
                                ) : isExit ? (
                                    <GameExit onBack={() => {
                                        if (audioEnabled && window.audioManager) {
                                            window.audioManager.playClick();
                                        }
                                        setIsExit(false);
                                    }} />
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
                                        <div className="h-full bg-gray-950 p-2 sm:p-4 overflow-hidden">
                                            {gameFlowElement}
                                        </div>
                                    ) : (
                                        <div className="text-white flex h-full justify-center items-center p-2 sm:p-4">
                                           <TipsAndResources />
                                        </div>
                                    )}
                                </ResizablePanel>

                            </ResizablePanelGroup>
                        </ResizablePanel>

                    </ResizablePanelGroup>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}