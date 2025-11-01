/*
    This is the Visual Novel Game 
*/

"use client"

import React, { use, useState } from "react"



export default function HowToHackPage () {
    const [chapter, setChapter] = useState(1); //Chapter sequence of the game
    const [displayText, setDisplayText] = useState(""); // Dialog text
    const [dialogData, setDialogData] = useState(null); // Dialog data 
    const [isTyping, setIsTyping] = useState(false); // Typewriter effect

    const [isIntroPlaying, setIsIntroPlaying] = useState(true); // Intro scene
    const [isCardGame, setIsCardGame] = useState(false); // Card Game Mini Game
    const [isMultipleChoice, setIsMultipleChoice] = useState(false); // Multiple Choice Mini Game

    const [booting, setBooting] = React.useState(true); // Check of website loading
    
    const loadChapter = async (id) => { // Fetch data from json file 
        const response = await fetch(`/data/chapter${id}.json`);
        return await response.json();
    };

    useEffect(() => { // Set Loaded Data To Dialog Data
        const fetchChapter = async () => {
            const data = await loadChapter(chapter);
            setDialogData(data);
        };
        fetchChapter();
    }, [chapter]);

  

    return (
        <div className="">

        </div>
    )
}