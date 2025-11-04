import { GameDialogBox } from "./gameDialogBox";

export default function GameScreen (
    gameStart, gameCharac, characPose, dialog, chapter, event, scenario,
    miniGame, background, choices, miniGames, 
) {
    return (
        <div className="w-full h-full border border-white">
            {gameStart ? (
                <div>
                    <GameDialogBox
                    
                    />
                </div>
            ) : (
                <>

                </>
            )}
        </div>
    )
}