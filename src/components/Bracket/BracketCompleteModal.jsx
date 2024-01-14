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
          <div className="flex flex-col justify-between align-middle gap-0">
            <h1 className="text-xl font-bold">Bracket Complete!</h1>
            <BracketWinnerInfo
              bracketWinner={bracketWinner}
              showSongInfo={songSource && songSource.type === "playlist"}
            />

            <div className="mt-2 flex flex-row justify-around">
              <ActionButton onClick={() => setShowModal(false)} text="Admire my masterpiece" variant="secondary" />
              <ActionButton
                onClick={() => {
                  navigate("/my-brackets");
                }}
                text="Start a new bracket"
                autoFocus
                variant="primary"
                disabled={!isSaved}
              />
            </div>
            <div className="flex flex-row justify-around">
              <SaveIndicator saving={saving} isSaved={isSaved} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
