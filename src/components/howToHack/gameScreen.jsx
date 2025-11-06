
import React from "react";
import GameDialogBox from "./gameDialogBox";

export default function GameScreen (props) {
    const {
        gameStart = true,
        gameCharac,
        characPose,
        dialog,
        chapter,
        event,
        scenario,
        background,
        choices,
        miniGames = false,
        MultipleChoiceComponent = null,
        CardGameComponent = null,
        onNext = () => {},
    } = props;

    return (
        <div className="w-full h-full border border-white flex flex-col">
            {/* top area for background / character */}
            <div className="flex-1 w-full flex items-end justify-center">
                {/* ADDED COMMENT: placeholder area for background/character rendering */}
                <div className="w-full h-64 bg-black/50 flex items-center justify-center">
                    <p className="text-sm text-white/70">Background: {background || "default"}</p>
                </div>
            </div>

            {/* dialog & mini-game area */}
            <div className="w-full">
                {gameStart ? (
                    <div>
                        <GameDialogBox
                            text={dialog}
                            character={gameCharac}
                            chapter={chapter}
                            onNext={onNext}
                        />
                    </div>
                ) : (
                    <>
                        {miniGames && MultipleChoiceComponent && (
                            <MultipleChoiceComponent />
                        )}

                        {miniGames && CardGameComponent && (
                            <CardGameComponent />
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
