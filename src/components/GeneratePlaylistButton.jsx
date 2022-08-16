import React, { useState } from "react";

import { buttonStyle, logoStyle } from "./GeneratePlaylistButton.module.css";

import { createPlaylist, addTracksToPlaylist } from "../utilities/helpers";

import spotifyLogo from "../assets/images/Spotify_Logo_RGB_Green.png";

const GeneratePlaylistButton = ({ tracks, artist, hidden }) => {
  const [playlistId, setPlaylistId] = useState(undefined);
  const [loading, setLoading] = useState(false);

  async function makePlaylist() {
    setLoading(true);
    const nameStr = artist.name + " tracks from Song Coliseum";
    const descriptionStr =
      "A collection of " +
      tracks.length +
      " tracks used in a " +
      artist.name +
      " bracket. Make your own at cgarren.github.com/song-coliseum!";
    const response = await createPlaylist(nameStr, descriptionStr);
    if (!response["error"]) {
      const response2 = await addTracksToPlaylist(
        response.id,
        tracks.map((track) => "spotify:track:" + track.id)
      );
      if (!response2["error"]) {
        console.log("success");
        setPlaylistId(response.id);
      }
    }
    setLoading(false);
  }

  function viewPlaylist() {
    const url = "https://open.spotify.com/playlist/" + playlistId;
    window.open(url, "_blank");
  }

  return (
    <button
      onClick={playlistId ? viewPlaylist : makePlaylist}
      className={buttonStyle}
      hidden={hidden}
      disabled={loading}
    >
      <span>
        {playlistId ? "View playlist on" : loading ? "" : "Make"}&nbsp;
      </span>
      {loading ? (
        ""
      ) : (
        <img src={spotifyLogo} alt="Spotify logo" className={logoStyle}></img>
      )}
      <span>
        {playlistId
          ? ""
          : loading
          ? "Working..."
          : String.fromCharCode(160) + "playlist"}
      </span>
    </button>
  );
};

export default GeneratePlaylistButton;
