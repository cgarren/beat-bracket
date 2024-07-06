import React, { forwardRef } from "react";
import SpotifySearchBar from "./SpotifySearchBar";

export default forwardRef(({ setArtist, disabled, id = "artist-search" }, ref) => (
  <SpotifySearchBar type="artist" setFunc={setArtist} disabled={disabled} id={id} ref={ref} />
));

// function ArtistSearchBar
