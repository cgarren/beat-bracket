import React from "react";
import SpotifySearchBar from "./SpotifySearchBar";

export default function ArtistSearchBar({ setArtist, disabled, id = "artist-search" }) {
  return (
    // <div className="mb-2 max-w-[800px] min-w-[25%] flex flex-col">
    <SpotifySearchBar type="artist" setFunc={setArtist} disabled={disabled} id={id} />
  );
}
