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
    console.log(e);
    e.target.disabled = true;
    //document.getElementById(e.target.dataset.opponentid).disabled = true;
    disabled = true;
    modifySong(nextId, "song", song);
    modifySong(nextId, "disabled", false);
    modifySong(opponentId, "disabled", true);
    //document.getElementById(e.target.dataset.nextid).disabled = false;
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
