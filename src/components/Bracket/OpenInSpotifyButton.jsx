import React from "react";
import spotifyIcon from "../../assets/images/Spotify_Icon_RGB_Green.png";

export default function OpenInSpotifyButton({ songId, extraClasses = "" }) {
    return (
        <button
            onClick={() => {
                if (songId) {
                    window.open(`http://open.spotify.com/track/${songId}`);
                }
            }}
            className={
                extraClasses +
                " border-0 p-0 w-[20px] h-[20px] hover:bg-white bg-black text-white rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
            }
        >
            <img
                src={spotifyIcon}
                alt="Spotify Icon"
                title="Open in Spotify"
                className="h-[20px] text-white"
            />
        </button>
    );
}
