import React, { useCallback, useMemo } from "react";
import { produce } from "immer";
import Bracket from "./Bracket";
import FillSongButton from "./SongButton/FillSongButton";

export default function FillBracket({
  bracketTracks,
  songSource,
  bracket,
  changeBracket,
  currentlyPlayingId,
  setCurrentlyPlayingId,
  saveCommand,
}) {
  const getBracket = useCallback((key) => bracket.get(key), [bracket]);
  const modifyBracket = useCallback(
    (modificationTriples) => {
      const bracketCopy = produce(bracket, (draft) => {
        modificationTriples.forEach(([key, attribute, value]) => {
          draft.get(key)[attribute] = value;
        });
      });
      changeBracket(bracketCopy);
    },
    [bracket, getBracket, changeBracket],
  );

  const undoChoice = useCallback(
    (id, previousIds) => {
      const triples = [
        [id, "song", null],
        [id, "disabled", true],
        [id, "color", null],
        [id, "winner", false],
      ];

      if (previousIds?.length > 0) {
        previousIds.forEach((prevId) => {
          triples.push(
            ...[
              [prevId, "disabled", false],
              [prevId, "eliminated", false],
            ],
          );
        });
      }
      setCurrentlyPlayingId(null);
      modifyBracket(triples);
    },
    [modifyBracket, setCurrentlyPlayingId],
  );

  const makeChoice = useCallback(
    (id, opponentId, nextId, song, color) => {
      const triples = [
        [id, "disabled", true],
        [opponentId, "disabled", true],
        [opponentId, "eliminated", true],
      ];
      // eliminatePrevious(opponentId);
      if (nextId) {
        triples.push(
          ...[
            [nextId, "song", song],
            [nextId, "disabled", false],
            [nextId, "color", color, true],
          ],
        );
      } else {
        console.log(`Winner is ${song.name}`);
        triples.push(...[[id, "winner", true]]);
      }
      modifyBracket(triples);
      setCurrentlyPlayingId(null);
    },
    [modifyBracket, setCurrentlyPlayingId],
  );

  return (
    <Bracket
      bracket={bracket}
      bracketSize={bracketTracks.length}
      setShowBracket={() => {}}
      showBracket
      songSourceType={songSource?.type}
      songButtonType={FillSongButton}
      songButtonProps={useMemo(
        () => ({
          modifyBracket: modifyBracket,
          saveCommand: saveCommand,
          getBracket: getBracket,
          currentlyPlayingId: currentlyPlayingId,
          setCurrentlyPlayingId: setCurrentlyPlayingId,
          editable: true,
          undoChoice: undoChoice,
          makeChoice: makeChoice,
        }),
        [modifyBracket, getBracket, currentlyPlayingId, setCurrentlyPlayingId],
      )}
    />
  );
}
