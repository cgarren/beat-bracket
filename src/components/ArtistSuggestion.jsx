import * as React from "react";

const ArtistSuggestion = ({ artistName, art, onClick }) => {
  return (
    <li onClick={onClick}>
      <img src={art} alt="an image" height={35} className="me-2" />
      {artistName}
    </li>
  );
};

export default ArtistSuggestion;
