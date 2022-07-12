import React from "react";

import { songButtonStyle } from "./SongButton.module.css";

const SongButton = ({
  styling,
  song,
  opponentId,
  nextId,
  id,
  disabled,
  modifySong,
}) => {
  function songChosen(e) {
    disabled = true;
    modifySong(nextId, "song", song);
    modifySong(nextId, "disabled", false);
    modifySong(opponentId, "disabled", true);
  }

  return (
    <button
      disabled={disabled}
      className={songButtonStyle + " " + styling}
      onClick={songChosen}
      id={id}
      data-opponentid={opponentId}
      data-nextid={nextId}
    >
      {song}
      <br />
      id: {id}
    </button>
  );
};

export default SongButton;
