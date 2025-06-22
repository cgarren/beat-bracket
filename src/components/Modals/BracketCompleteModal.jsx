import React from "react";
import { navigate } from "gatsby";
import BracketWinnerInfo from "../Bracket/BracketWinnerInfo";
import SyncIcon from "../../assets/svgs/syncIcon.svg";
import ShareIcon from "../../assets/svgs/shareIcon.svg";
import UndoIcon from "../../assets/svgs/undoIcon.svg";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

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
  onUndo,
}) {
  return (
    <div>
      <AlertDialog open={showModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bracket Complete!</AlertDialogTitle>
          </AlertDialogHeader>
          {bracketWinner && (
            <BracketWinnerInfo
              bracketWinner={bracketWinner}
              showSongInfo={songSource && songSource.type === "playlist"}
            />
          )}
          <Button onClick={share} variant="outline" className="w-fit mx-auto gap-1">
            <div className="w-4 h-4">
              <ShareIcon />
            </div>
            Share
          </Button>
          <AlertDialogFooter>
            {!savePending && !saveError && (
              <>
                {/* <div className="flex justify-around w-full"> */}
                <AlertDialogCancel className="min-w-[182px]" onClick={() => navigate(viewLink)}>
                  Admire my masterpiece
                </AlertDialogCancel>
                <AlertDialogAction className="min-w-[182px]" onClick={() => navigate("/my-brackets")}>
                  Back to my brackets
                </AlertDialogAction>
                {/* </div> */}
              </>
            )}
            {savePending && (
              <div className="flex items-center gap-1 justify-center">
                <div className="animate-spin-reverse w-4 h-4" aria-label="Saving" title="Saving">
                  <SyncIcon />
                </div>
                Hang tight! Saving your bracket...
              </div>
            )}
            {saveError && (
              <>
                <div className="flex flex-row justify-around text-red-500 font-bold my-auto">
                  Error saving your bracket!
                </div>
                <AlertDialogAction onClick={retrySave}>Retry save</AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
          {!savePending && !saveError && onUndo && (
            <div className="flex justify-center mt-0">
              <button
                onClick={onUndo}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors underline"
                type="button"
              >
                Choose a different winner
              </button>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
