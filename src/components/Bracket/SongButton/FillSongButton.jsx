import React from "react";
import cx from "classnames";
import UndoIcon from "../../../assets/svgs/undoIcon.svg";
import OpenInSpotifyButton from "./OpenInSpotifyButton";
import SongButton from "./NewSongButton";

export default function FillSongButton({
  styling,
  song,
  opponentId,
  nextId,
  id,
  side,
  col,
  previousIds,
  disabled,
  currentlyPlayingId,
  setCurrentlyPlayingId,
  modifyBracket,
  saveCommand,
  getBracket,
  eliminated,
  winner,
  color,
  undoFunc,
}) {
  // Recursive function to mark all previous instances of a song in a bracket as eliminated
  // function eliminatePrevious(thisId) {
  //     let songInfo = getBracket(thisId);
  //     if (songInfo.previousIds.length === 0) {
  //         return;
  //     }
  //     console.log(songInfo);
  //     for (let prevId of songInfo.previousIds) {
  //         if (getBracket(prevId).song === getBracket(thisId).song) {
  //             modifyBracket(prevId, "eliminated", true);
  //             eliminatePrevious(prevId);
  //         }
  //     }
  // }

  function undoChoice() {
    modifyBracket([
      [id, "disabled", false],
      [opponentId, "disabled", false],
      [opponentId, "eliminated", false],
    ]);
    setCurrentlyPlayingId(null);
    // undoEliminatePrevious(opponentId);
    if (nextId) {
      modifyBracket(
        [
          [nextId, "song", null],
          [nextId, "disabled", true],
          [nextId, "color", null],
        ],
        true,
      );
    } else {
      modifyBracket([[id, "winner", false]], true);
    }
  }

  function makeChoice() {
    modifyBracket([
      [id, "disabled", true],
      [opponentId, "disabled", true],
      [opponentId, "eliminated", true],
    ]);
    // eliminatePrevious(opponentId);
    if (nextId) {
      modifyBracket([
        [nextId, "song", song],
        [nextId, "disabled", false],
        [nextId, "color", color, true],
        [nextId, "undoFunc", undoChoice],
      ]);
      setCurrentlyPlayingId(null);
    } else {
      console.log(`Winner is ${song.name}`);
      modifyBracket([[id, "winner", true]], true);
      // setBracketWinner(song);
      setCurrentlyPlayingId(null);
    }
  }

  function songChosen() {
    if (opponentId && getBracket(opponentId).song !== null) {
      makeChoice();
      saveCommand(makeChoice, undoChoice);
    }
  }

  return (
    <div className="relative">
      {song && !disabled && col !== 0 && undoFunc && (
        <button
          type="button"
          onClick={undoFunc}
          aria-label="Undo"
          className={cx(
            "border-0 w-[26px] h-[26px] p-1 text-xs hover:bg-red-600 hover:text-white bg-transparent text-black absolute rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
            {
              "-right-8 top-3": side === "l" && getBracket(opponentId).side === side,
              "-left-8 top-3": side === "r" && getBracket(opponentId).side === side,
              "-bottom-8 left-11": getBracket(opponentId).side !== side,
            },
          )}
        >
          <UndoIcon />
        </button>
      )}
      <SongButton
        actionButton={song && !disabled && <OpenInSpotifyButton songId={song.id} />}
        clickFunction={() => songChosen()}
        showPlayPauseButton={song && song.preview_url && !disabled}
        styling={styling}
        song={song}
        id={id}
        side={side}
        disabled={disabled}
        currentlyPlayingId={currentlyPlayingId}
        setCurrentlyPlayingId={setCurrentlyPlayingId}
        eliminated={eliminated}
        winner={winner}
        color={color}
        editMode={false}
        editable={true}
      />
    </div>
  );
}
