import React from "react";
import { navigate } from "gatsby";
import Modal from "./Modal";
import ActionButton from "../Controls/ActionButton";
import BracketWinnerInfo from "../Bracket/BracketWinnerInfo";
import SaveIndicator from "../Controls/SaveIndicator";
import LoadingIndicator from "../LoadingIndicator";

export default function BracketCompleteModal({
  showModal,
  setShowModal,
  bracketWinner,
  songSource,
  isSaved,
  saving,
  viewLink,
}) {
  return (
    <div>
      {showModal && (
        <Modal
          onClose={() => {
            if (isSaved) {
              navigate(viewLink);
              setShowModal(false);
            }
          }}
        >
          <div className="flex flex-col justify-between align-middle gap-0">
            <h1 className="text-xl font-bold">Bracket Complete!</h1>
            <BracketWinnerInfo
              bracketWinner={bracketWinner}
              showSongInfo={songSource && songSource.type === "playlist"}
            />
            {isSaved && (
              <div className="mt-2 flex flex-row justify-around">
                <ActionButton
                  onClick={() => {
                    navigate(viewLink);
                    setShowModal(false);
                  }}
                  text="Admire my masterpiece"
                  variant="secondary"
                  disabled={!isSaved}
                />
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
            )}
            {!isSaved && (
              <div className="flex flex-row justify-around">
                <SaveIndicator
                  saving={saving}
                  isSaved={isSaved}
                  savingText="Hang tight! Saving your bracket"
                  waitingText="Hang tight! Saving your bracket"
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
