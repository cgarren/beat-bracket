import React, { forwardRef } from "react";
import SpotifySearchBar from "./SpotifySearchBar";

export default forwardRef(({ setPlaylist, disabled, id = "playlist-search" }, ref) => (
  <SpotifySearchBar type="playlist" setFunc={setPlaylist} disabled={disabled} id={id} ref={ref} />
));
