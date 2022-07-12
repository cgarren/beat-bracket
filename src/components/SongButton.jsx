import React from "react";

import {
  songButtonStyle,
  unfilledStyle,
  winnerStyle,
} from "./SongButton.module.css";

const SongButton = ({
  styling,
  song,
  opponentId,
  nextId,
  id,
  disabled,
  modifyBracket,
  getBracket,
  winner,
}) => {
  function songChosen(e) {
    if (opponentId && getBracket(opponentId).song !== null) {
      modifyBracket(id, "disabled", true);
      modifyBracket(opponentId, "disabled", true);
      if (nextId) {
        modifyBracket(nextId, "song", song);
        modifyBracket(nextId, "disabled", false);
      } else {
        console.log("Winner is " + song);
        modifyBracket(id, "winner", true);
      }
    } else {
      console.log("fill in opponent song first!");
    }
  }

  return (
    <button
      disabled={disabled}
      className={
        songButtonStyle +
        (song == null ? " " + unfilledStyle + " " : " ") +
        (winner ? " " + winnerStyle + " " : " ") +
        styling
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
