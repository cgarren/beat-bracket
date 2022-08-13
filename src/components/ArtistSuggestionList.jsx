import * as React from "react";
import ArtistSuggestion from "./ArtistSuggestion";

import { listStyle } from "./ArtistSuggestionList.module.css";

const ArtistSuggestionList = ({ artistList }) => {
  return (
    <ul className={listStyle}>
      {artistList.map((item) => {
        return (
          <ArtistSuggestion
            artistName={item.name}
            art={item.art}
            onClick={item.onClick}
            key={item.id}
          />
        );
      })}
    </ul>
  );
};

export default ArtistSuggestionList;
