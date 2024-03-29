import React from "react";

export default function BracketWinnerInfo({ bracketWinner, showSongInfo }) {
  return (
    <div className="text-center text-md">
      {bracketWinner.art && (
        <img
          src={bracketWinner.art}
          className="w-[120px] h-[120px] mx-auto rounded"
          width="120px"
          height="120px"
          alt="Album art"
          title={`Album art for ${bracketWinner.name}`}
        />
      )}
      <span className="font-bold">Winner: </span>
      {`${bracketWinner.name}${showSongInfo ? ` by ${bracketWinner.artist}` : ""}`}
      {/* <div>
        <span>Popularity on Spotify:</span> {bracketWinner.popularity}/100
      </div> */}
    </div>
  );
}
