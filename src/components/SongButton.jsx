import React from "react";

import {
  songButtonStyle,
  unfilledStyle,
  winnerStyle,
  eliminatedStyle,
} from "./SongButton.module.css";

const SongButton = ({
  styling,
  song,
  opponentId,
  nextId,
  id,
  previousIds,
  disabled,
  modifyBracket,
  saveCommand,
  getBracket,
  eliminated,
  winner,
  color,
}) => {
  // Recursive function to mark all previous instances of a song in a bracket as eliminated
  function eliminatePrevious(thisId) {
    let songInfo = getBracket(thisId);
    if (songInfo.previousIds.length === 0) {
      return;
    }
    console.log(songInfo);
    for (let prevId of songInfo.previousIds) {
      if (getBracket(prevId).song === getBracket(thisId).song) {
        modifyBracket(prevId, "eliminated", true);
        eliminatePrevious(prevId);
      }
    }
  }

  function songChosen() {
    makeChoice();
    saveCommand(makeChoice, undoChoice);
  }

  function makeChoice() {
    if (opponentId && getBracket(opponentId).song !== null) {
      modifyBracket(id, "disabled", true);
      modifyBracket(opponentId, "disabled", true);
      modifyBracket(opponentId, "eliminated", true);
      //eliminatePrevious(opponentId);
      if (nextId) {
        modifyBracket(nextId, "song", song);
        modifyBracket(nextId, "disabled", false);
        modifyBracket(nextId, "color", color);
      } else {
        console.log("Winner is " + song);
        modifyBracket(id, "winner", true);
      }
    }
  }

  function undoChoice() {
    modifyBracket(id, "disabled", false);
    modifyBracket(opponentId, "disabled", false);
    modifyBracket(opponentId, "eliminated", false);
    //undoEliminatePrevious(opponentId);
    if (nextId) {
      modifyBracket(nextId, "song", null);
      modifyBracket(nextId, "disabled", true);
      modifyBracket(nextId, "color", null);
    } else {
      modifyBracket(id, "winner", false);
    }
  }

  return (
    <button
      disabled={disabled}
      className={
        songButtonStyle +
        (song == null ? " " + unfilledStyle + " " : " ") +
        (winner ? " " + winnerStyle + " " : " ") +
        (eliminated ? " " + eliminatedStyle + " " : " ") +
        styling
      }
      style={
        color
          ? {
              backgroundColor: color.getHex(),
              color: color.getBodyTextColor(),
              borderColor: color.getHex(),
            }
          : {}
      }
      onClick={songChosen}
      id={id}
      data-opponentid={opponentId}
      data-nextid={nextId}
    >
      {song}
    </button>
  );
};

export default SongButton;
