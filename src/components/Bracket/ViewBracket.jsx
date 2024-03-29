import React from "react";
import Bracket from "./Bracket";
import FillSongButton from "./SongButton/FillSongButton";

export default function ViewBracket({ editable, bracketTracks, songSource, bracket }) {
  return (
    <Bracket
      bracket={bracket}
      bracketSize={bracketTracks.length}
      setShowBracket={() => {}}
      showBracket
      songSourceType={songSource.type}
      songButtonType={FillSongButton}
      songButtonProps={{
        currentlyPlayingId: null,
        setCurrentlyPlayingId: () => {},
        modifyBracket: () => {},
        saveCommand: () => {},
        getBracket: () => {},
        editable: editable,
        editMode: false,
      }}
    />
  );
}

// 128 -> 7
// 64 -> 6
// 32 -> 5
// 16 -> 4
// 8 -> 3
// 4 -> 2
// 2 -> 1
