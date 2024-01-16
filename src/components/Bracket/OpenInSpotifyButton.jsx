import React from "react";
import spotifyIcon from "../../assets/images/Spotify_Icon_RGB_Green.png";
import SongButtonAction from "./SongActionButton";

export default function OpenInSpotifyButton({ songId }) {
  return (
    <SongButtonAction
      actionFunction={() => {
        if (songId) {
          window.open(`http://open.spotify.com/track/${songId}`);
        }
      }}
      extraClasses="hover:bg-white bg-black text-white"
      label="Open in Spotify"
    >
      <img src={spotifyIcon} alt="Spotify Icon" title="Open in Spotify" className="h-[20px] text-white" />
    </SongButtonAction>
  );
}
