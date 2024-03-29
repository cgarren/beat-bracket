import React, { useState, useEffect } from "react";

import useSpotify from "../hooks/useSpotify";

export default function GeneratePlaylistButton({ tracks, artist, hidden }) {
  const [playlistId, setPlaylistId] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const { createPlaylist, addTracksToPlaylist, addCoverImageToPlaylist } = useSpotify();

  async function makePlaylist() {
    setLoading(true);
    const nameStr = `${artist.name} tracks from Beat Bracket`;
    const descriptionStr = `A collection of ${tracks.length} tracks used in a ${artist.name} bracket. Make your own at beatbracket.com!`;
    const response = await createPlaylist(nameStr, descriptionStr);
    // addCoverImageToPlaylist(response.id, artist.art);
    if (!response.error) {
      const response2 = await addTracksToPlaylist(
        response.id,
        tracks.map((track) => `spotify:track:${track.id}`),
      );
      if (!response2.error) {
        setPlaylistId(response.id);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    setPlaylistId(undefined);
  }, [tracks, artist]);

  function viewPlaylist() {
    const url = `https://open.spotify.com/playlist/${playlistId}`;
    window.open(url, "_blank");
  }

  return (
    <button
      type="button"
      onClick={playlistId ? viewPlaylist : makePlaylist}
      className="inline-flex items-center justify-center cursor-pointer text-center"
      hidden={hidden}
      disabled={loading}
    >
      <span>{playlistId ? "View playlist on Spotify" : loading ? "" : "Make Spotify"}</span>
      <span>
        {tracks
          ? playlistId
            ? ""
            : loading
              ? "Working..."
              : `${String.fromCharCode(160)}playlist with ${tracks.length} tracks`
          : ""}
      </span>
    </button>
  );
}
