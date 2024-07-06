import React from "react";
import { navigate } from "gatsby";
import BracketWinnerInfo from "../Bracket/BracketWinnerInfo";
import SyncIcon from "../../assets/svgs/syncIcon.svg";
import ShareIcon from "../../assets/svgs/shareIcon.svg";
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
          <Button onClick={share} variant="outline" icon={<ShareIcon />} className="w-fit mx-auto gap-1">
            <ShareIcon />
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
                  Start a new bracket
                </AlertDialogAction>
                {/* </div> */}
              </>
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
                <div className="flex flex-row justify-around text-red-500 font-bold my-auto">
                  Error saving your bracket!
                </div>
                <AlertDialogAction onClick={retrySave}>Retry save</AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
