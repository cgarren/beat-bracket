import React from "react";

import { songButtonStyle } from "./SongButton.module.css";

const SongButton = ({ styling, song, disabled }) => {
  return (
    <button disabled={disabled} className={songButtonStyle + " " + styling}>
      {song}
    </button>
  );
};

export default SongButton;
