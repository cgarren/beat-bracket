import React from "react";
import { navigate } from "gatsby";
import Modal from "../Modal";
import ActionButton from "./ActionButton";
import BracketWinnerInfo from "./BracketWinnerInfo";
import SaveIndicator from "./SaveIndicator";

export default function BracketCompleteModal({ showModal, setShowModal, bracketWinner, songSource, isSaved, saving }) {
  return (
    <div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="flex flex-col justify-between align-middle items-center gap-0">
            <h1 className="text-xl font-bold">Bracket Complete!</h1>
            <BracketWinnerInfo
              bracketWinner={bracketWinner}
              showSongInfo={songSource && songSource.type === "playlist"}
            />

            <div className="mt-2 flex flex-row justify-evenly">
              <ActionButton
                onClick={() => setShowModal(false)}
                text="Admire my masterpiece"
                customStyling="mr-2 bg-gray-200 hover:bg-gray-300"
              />
              <ActionButton
                onClick={() => {
                  navigate("/my-brackets");
                }}
                text="Start a new bracket"
                autoFocus
                customStyling="bg-gray-700 text-white hover:bg-black disabled:text-gray-400 hover:disabled:bg-black"
                disabled={!isSaved}
              />
            </div>
            <SaveIndicator saving={saving} isSaved={isSaved} />
          </div>
        </Modal>
      )}
    </div>
  );
}
