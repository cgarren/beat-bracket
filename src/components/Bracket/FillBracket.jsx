import React, { useCallback, useMemo } from "react";
import Bracket from "./Bracket";
import FillSongButton from "./SongButton/FillSongButton";

export default function FillBracket({
  showBracket,
  setShowBracket,
  editable,
  bracketTracks,
  songSource,
  bracket,
  setBracket,
  setSeedingMethod,
  currentlyPlayingId,
  setCurrentlyPlayingId,
  saveCommand,
}) {
  const getBracket = useCallback((key) => bracket.get(key), [bracket]);
  const modifyBracket = useCallback(
    (modificationTriples, save = false) => {
      const bracketCopy = new Map(bracket);
      modificationTriples.forEach(([key, attribute, value]) => {
        const payload = bracketCopy.get(key);
        payload[attribute] = value;
        bracketCopy.set(key, payload);
      });
      if (save) {
        setBracket(new Map(bracketCopy));
      } else {
        setBracket(new Map(bracketCopy));
      }
    },
    [bracket, getBracket, setBracket, setSeedingMethod],
  );

  return (
    <Bracket
      bracket={bracket}
      bracketSize={bracketTracks.length}
      setShowBracket={setShowBracket}
      showBracket={showBracket}
      songSourceType={songSource.type}
      songButtonType={FillSongButton}
      songButtonProps={useMemo(
        () => ({
          modifyBracket: modifyBracket,
          saveCommand: saveCommand,
          getBracket: getBracket,
          editable: editable,
          currentlyPlayingId: currentlyPlayingId,
          setCurrentlyPlayingId: setCurrentlyPlayingId,
        }),
        [modifyBracket, getBracket, editable, currentlyPlayingId, setCurrentlyPlayingId],
      )}
    />
  );
}
