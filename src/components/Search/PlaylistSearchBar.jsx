import React from "react";
import SpotifySearchBar from "./SpotifySearchBar";

export default function PlaylistSearchBar({ setPlaylist, disabled }) {
  return (
    // <div className="mb-2 max-w-[800px] min-w-[25%] flex flex-col">
    <SpotifySearchBar type="playlist" setFunc={setPlaylist} disabled={disabled} />
  );
}
