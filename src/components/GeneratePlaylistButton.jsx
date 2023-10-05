import React, { useState } from "react";

import {
    createPlaylist,
    addTracksToPlaylist,
    addCoverImageToPlaylist,
} from "../utilities/spotify";

import { useEffect } from "react";

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
        //addCoverImageToPlaylist(response.id, artist.art);
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

    useEffect(() => {
        setPlaylistId(undefined);
    }, [tracks, artist]);

    function viewPlaylist() {
        const url = "https://open.spotify.com/playlist/" + playlistId;
        window.open(url, "_blank");
    }

    return (
        <button
            onClick={playlistId ? viewPlaylist : makePlaylist}
            className="inline-flex items-center justify-center cursor-pointer text-center"
            hidden={hidden}
            disabled={loading}
        >
            <span>
                {playlistId
                    ? "View playlist on Spotify"
                    : loading
                    ? ""
                    : "Make Spotify"}
            </span>
            <span>
                {tracks
                    ? playlistId
                        ? ""
                        : loading
                        ? "Working..."
                        : String.fromCharCode(160) +
                          "playlist with " +
                          tracks.length +
                          " tracks"
                    : ""}
            </span>
        </button>
    );
};

export default GeneratePlaylistButton;
