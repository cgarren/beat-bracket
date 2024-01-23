import React, { useCallback, useMemo } from "react";
import { produce } from "immer";
import Bracket from "./Bracket";
import FillSongButton from "./SongButton/FillSongButton";

export default function FillBracket({
  showBracket,
  setShowBracket,
  bracketTracks,
  songSource,
  bracket,
  setBracket,
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
      setBracket(bracketCopy);
    },
    [bracket, getBracket, setBracket],
  );

  function undoChoice(id, previousIds) {
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
    // const triples = [
    //   [id, "disabled", false],
    //   [opponentId, "disabled", false],
    //   [opponentId, "eliminated", false],
    // ];
    // undoEliminatePrevious(opponentId);
    // if (nextId) {
    //   triples.push(
    //     ...[
    //       [nextId, "song", null],
    //       [nextId, "disabled", true],
    //       [nextId, "color", null],
    //     ],
    //   );
    // } else {
    //   triples.push(...[[id, "winner", false]]);
    // }
    setCurrentlyPlayingId(null);
    modifyBracket(triples);
  }

  function makeChoice(id, opponentId, nextId, song, color) {
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
          // [nextId, "undoFunc", undoChoice],
        ],
      );
    } else {
      console.log(`Winner is ${song.name}`);
      triples.push(...[[id, "winner", true]]);
    }
    modifyBracket(triples);
    setCurrentlyPlayingId(null);
  }

  return (
    <Bracket
      bracket={bracket}
      bracketSize={bracketTracks.length}
      setShowBracket={setShowBracket}
      showBracket={showBracket}
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
