import React from "react";
import cx from "classnames";
import UndoIcon from "../../../assets/svgs/undoIcon.svg";
import OpenInSpotifyButton from "./OpenInSpotifyButton";
import SongButton from "./SongButton";

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
  saveCommand,
  getBracket,
  eliminated,
  winner,
  color,
  undoChoice,
  makeChoice,
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

  function songChosen() {
    if (opponentId && getBracket(opponentId).song !== null) {
      makeChoice(id, opponentId, nextId, song, color);
      saveCommand(
        () => makeChoice(id, opponentId, nextId),
        () => undoChoice(nextId, [id, opponentId]),
      );
    }
  }

  function choiceUndone() {
    undoChoice(id, previousIds);
    saveCommand(
      () => undoChoice(id, previousIds),
      () => {
        const picked = previousIds.find((buttonId) => getBracket(buttonId).eliminated === false);
        const notPicked = previousIds.find((buttonId) => getBracket(buttonId).eliminated === true);
        makeChoice(picked, notPicked, id, song, color);
      },
    );
  }

  return (
    <div className="relative">
      {song && !disabled && col !== 0 && (
        <button
          type="button"
          onClick={choiceUndone}
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
        editable
      />
    </div>
  );
}
