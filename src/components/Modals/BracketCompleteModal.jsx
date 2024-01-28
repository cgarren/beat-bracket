import React from "react";
import { navigate } from "gatsby";
import Modal from "./Modal";
import ActionButton from "../Controls/ActionButton";
import BracketWinnerInfo from "../Bracket/BracketWinnerInfo";
import SyncIcon from "../../assets/svgs/syncIcon.svg";

export default function BracketCompleteModal({
  showModal,
  setShowModal,
  bracketWinner,
  songSource,
  savePending,
  saveError,
  retrySave,
  viewLink,
  share,
}) {
  return (
    <div>
      {showModal && (
        <Modal
          onClose={() => {
            if (!savePending) {
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
            <ActionButton
              onClick={() => {
                share();
              }}
              text="Share"
              variant="secondary"
            />
            {!savePending && !saveError && (
              <div className="mt-2 flex flex-row justify-around">
                <ActionButton
                  onClick={() => {
                    navigate(viewLink);
                    setShowModal(false);
                  }}
                  text="Admire my masterpiece"
                  variant="secondary"
                  disabled={savePending}
                />
                <ActionButton
                  onClick={() => {
                    navigate("/my-brackets");
                  }}
                  text="Start a new bracket"
                  autoFocus
                  variant="primary"
                  disabled={savePending}
                />
              </div>
            )}
            {savePending && (
              <div className="flex items-center gap-1 justify-center">
                <div className="animate-spin-reverse w-fit h-fit" aria-label="Saving" title="Saving">
                  <SyncIcon />
                </div>
                Hang tight! Saving your bracket...
              </div>
            )}
            {saveError && (
              <>
                <div className="flex flex-row justify-around text-red-500 font-bold">Error saving your bracket!</div>
                <ActionButton onClick={retrySave} text="Retry save" variant="secondary" />
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
