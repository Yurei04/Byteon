"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, Circle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ChapterList = ({ onBack, onStartGame, chapterChosen, setChapterChosen }) => {
  const [chaptersUnlocked, setChaptersUnlocked] = useState(1); // Default: only chapter 1 unlocked
  const [chaptersCompleted, setChaptersCompleted] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch user progress on component mount
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.error("[ChapterList] Error fetching user:", userError);
          setLoading(false);
          return;
        }

        // Fetch user's progress from database
        const { data: userData, error: dbError } = await supabase
          .from('users')
          .select('chapters_unlocked, chapters_completed')
          .eq('user_id', user.id)
          .single();

        if (dbError) {
          console.error("[ChapterList] Error fetching user data:", dbError);
          // Default values if user doesn't exist
          setChaptersUnlocked(1);
          setChaptersCompleted(0);
        } else {
          setChaptersUnlocked(userData?.chapters_unlocked || 1);
          setChaptersCompleted(userData?.chapters_completed || 0);
          console.log("[ChapterList] Progress loaded:", userData);
        }
      } catch (error) {
        console.error("[ChapterList] Unexpected error:", error);
        setChaptersUnlocked(1);
        setChaptersCompleted(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProgress();
  }, []);

  // Define chapters
  const chapters = [
    { 
      id: 1, 
      title: "Chapter 1: The Beginning", 
      description: "Your journey into the digital underground starts here.",
    },
    { 
      id: 2, 
      title: "Chapter 2: First Steps", 
      description: "Learn the basics of network infiltration.",
    },
    { 
      id: 3, 
      title: "Chapter 3: Deep Dive", 
      description: "Advanced techniques and dangerous territory.",
    },
    { 
      id: 4, 
      title: "Chapter 4: The Truth", 
      description: "Uncover the conspiracy behind it all.",
    },
    { 
      id: 5, 
      title: "Chapter 5: Final Stand", 
      description: "The culmination of your choices.",
    },
  ].map(chapter => ({
    ...chapter,
    unlocked: chapter.id <= chaptersUnlocked, // Chapter is unlocked if its ID <= chapters_unlocked
    completed: chapter.id <= chaptersCompleted // Chapter is completed if its ID <= chapters_completed
  }));

  const handleChapterSelect = (chapter) => {
    if (!chapter.unlocked) {
      console.log("[ChapterList] Chapter is locked");
      return;
    }
    
    console.log(`[ChapterList] Selected chapter ${chapter.id}`);
    setChapterChosen(chapter.id);
  };

  const handleStartSelectedChapter = () => {
    if (chapterChosen === 0) {
      console.warn("[ChapterList] No chapter selected");
      return;
    }
    console.log(`[ChapterList] Starting chapter ${chapterChosen}`);
    onStartGame();
  };

  // Show loading state while fetching user progress
  if (loading) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-fuchsia-400 animate-spin" />
          <p className="text-fuchsia-200 text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-80" />

      {/* Title and Progress */}
      <div className="relative z-10 text-center mb-8">
        <motion.h1
          className="text-3xl font-bold text-fuchsia-400 tracking-widest drop-shadow-lg mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Select Chapter
        </motion.h1>
        <motion.p
          className="text-sm text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Unlocked: {chaptersUnlocked} / {chapters.length} | Completed: {chaptersCompleted} / {chapters.length}
        </motion.p>
      </div>

      {/* Chapter List */}
      <div className="relative z-10 w-full max-w-2xl space-y-4 overflow-y-auto max-h-[60vh] pr-2">
        {chapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
            onClick={() => handleChapterSelect(chapter)}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-300
              ${!chapter.unlocked 
                ? 'bg-gray-900/30 border-gray-700/50 cursor-not-allowed opacity-50' 
                : chapterChosen === chapter.id
                  ? 'bg-fuchsia-900/40 border-fuchsia-400 shadow-lg shadow-fuchsia-400/30'
                  : 'bg-fuchsia-900/20 border-fuchsia-400/30 hover:bg-fuchsia-800/30 hover:border-fuchsia-400/60 cursor-pointer'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {chapter.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : chapter.unlocked ? (
                    <Circle className="w-5 h-5 text-fuchsia-400" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <h3 className={`text-lg font-semibold ${
                    chapter.unlocked ? 'text-fuchsia-100' : 'text-gray-500'
                  }`}>
                    {chapter.title}
                  </h3>
                  {chapter.completed && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                      Completed
                    </span>
                  )}
                </div>
                <p className={`text-sm ${
                  chapter.unlocked ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {chapter.description}
                </p>
                {!chapter.unlocked && (
                  <p className="text-xs text-gray-500 mt-2">
                    🔒 Complete previous chapters to unlock
                  </p>
                )}
              </div>
              
              {chapterChosen === chapter.id && chapter.unlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-4"
                >
                  <div className="w-6 h-6 rounded-full bg-fuchsia-400 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Buttons */}
      <motion.div
        className="relative z-10 flex gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Button
          onClick={onBack}
          className="px-8 py-6 bg-gray-700 hover:bg-gray-600 text-white border border-gray-500"
        >
          Back
        </Button>
        
        <Button
          onClick={handleStartSelectedChapter}
          disabled={chapterChosen === 0}
          className={`px-8 py-6 ${
            chapterChosen === 0
              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed border border-gray-700'
              : 'bg-fuchsia-600 hover:bg-fuchsia-700 text-white border border-fuchsia-400'
          }`}
        >
          {chapterChosen === 0 ? 'Select a Chapter' : `Start Chapter ${chapterChosen}`}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ChapterList;