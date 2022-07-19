import * as React from "react";
import SongSuggestion from "./ArtistSuggestion";

const ArtistSuggestionList = ({ artistList }) => {
  return (
    <ul>
      {artistList.map((item) => {
        return (
          <SongSuggestion
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
