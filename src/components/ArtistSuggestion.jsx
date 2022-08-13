import * as React from "react";

import { suggestionStyle } from "./ArtistSuggestion.module.css";

const ArtistSuggestion = ({ artistName, art, onClick }) => {
  return (
    <li onClick={onClick} className={suggestionStyle}>
      <img src={art} alt="artist picture" height={35} />
      &nbsp;{artistName}
    </li>
  );
};

export default ArtistSuggestion;
