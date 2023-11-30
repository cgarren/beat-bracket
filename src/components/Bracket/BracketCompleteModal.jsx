import React from "react";
import Modal from "../Modal";
import ActionButton from "./ActionButton";
import BracketWinnerInfo from "./BracketWinnerInfo";
import { navigate } from "gatsby";

export default function BracketCompleteModal({
    showModal,
    setShowModal,
    bracketWinner,
    songSource,
}) {
    return (
        <>
            {showModal && (
                <Modal onClose={() => setShowModal(false)}>
                    <h1 className="text-xl font-bold">Bracket Complete!</h1>
                    <BracketWinnerInfo
                        bracketWinner={bracketWinner}
                        showSongInfo={
                            songSource && songSource.type === "playlist"
                        }
                    />
                    <div className="mt-2 flex flex-row justify-around">
                        <ActionButton
                            onClick={() => setShowModal(false)}
                            text={"Admire my masterpiece"}
                            customStyling={"mr-2 bg-gray-200 hover:bg-gray-300"}
                        />
                        <ActionButton
                            onClick={() => {
                                navigate("/my-brackets");
                            }}
                            text={"Start a new bracket"}
                            autoFocus={true}
                            customStyling={
                                "bg-gray-700 text-white hover:bg-black"
                            }
                        />
                    </div>
                </Modal>
            )}
        </>
    );
}
