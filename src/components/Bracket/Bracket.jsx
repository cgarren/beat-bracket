import React, { useEffect, useState, useCallback, useMemo } from "react";
import SongButton from "./SongButton";
import useWindowSize from "react-use/lib/useWindowSize";
import {
  getNumberOfColumns,
  getNumberOfSongs,
} from "../../utilities/bracketGeneration";
import { popularitySort } from "../../utilities/helpers";

const styles = [
  "mt-[var(--firstColumnSpacing)]",
  "mt-[var(--secondColumnSpacing)]",
  "mt-[var(--thirdColumnSpacing)]",
  "mt-[var(--fourthColumnSpacing)]",
  "mt-[var(--fifthColumnSpacing)]",
  "mt-[var(--sixthColumnSpacing)]",
  "mt-[var(--seventhColumnSpacing)]",
  "mt-[var(--eigthColumnSpacing)]",
  "mt-[var(--ninthColumnSpacing)]",
];

const topStyles = [
  "0",
  "mt-[calc(var(--buttonheight)*.75)]",
  "mt-[calc(var(--buttonheight)*2.25)]",
  "mt-[calc(var(--buttonheight)*5.25)]",
  "mt-[calc(var(--buttonheight)*11.25)]",
  "mt-[calc(var(--buttonheight)*23.25)]",
  "mt-[calc(var(--buttonheight)*47.25)]",
  "mt-[calc(var(--buttonheight)*95.25)]",
  "mt-[calc(var(--buttonheight)*191.25)]",
];

const lineStyles = [
  "h-[var(--firstColumnSpacing)]",
  "h-[var(--secondColumnSpacing)]",
  "h-[var(--thirdColumnSpacing)]",
  "h-[var(--fourthColumnSpacing)]",
  "h-[var(--fifthColumnSpacing)]",
  "h-[var(--sixthColumnSpacing)]",
  "h-[var(--seventhColumnSpacing)]",
  "h-[var(--eigthColumnSpacing)]",
  "h-[var(--ninthColumnSpacing)]",
];

/* 3, 7, 15, 31, 63, 127*/
/*   4  8  16  32  64*/

const Bracket = ({
  allTracks,
  showBracket,
  setShowBracket,
  saveCommand,
  playbackEnabled,
  bracket,
  setBracket,
  editable,
  editMode,
  bracketTracks,
  currentlyPlayingId,
  setCurrentlyPlayingId,
}) => {
  const { width, height } = useWindowSize();
  const replacementTracks = useMemo(() => {
    const bracketIds = [];
    for (let track of bracketTracks) {
      bracketIds.push(track.id);
    }
    return allTracks
      .filter((track) => !bracketIds.includes(track.id))
      .sort(popularitySort);
  }, [allTracks, bracketTracks]);
  const renderArray = useMemo(
    () =>
      bracket instanceof Map && bracket.size !== 0
        ? [
            generateComponentArray(
              "l",
              currentlyPlayingId,
              setCurrentlyPlayingId
            ),
            generateComponentArray(
              "r",
              currentlyPlayingId,
              setCurrentlyPlayingId
            ),
          ]
        : [],
    [
      bracket,
      currentlyPlayingId,
      editMode,
      editable,
      replacementTracks,
      playbackEnabled,
    ]
  );
  const [bracketRef, setBracketRef] = useState(null);
  const bracketCallback = useCallback(
    (node) => {
      setBracketRef({ current: node });
    },
    [bracket]
  );

  function generateComponentArray(
    side,
    mycurrentlyPlayingId,
    mysetCurrentlyPlayingId
  ) {
    const columns = getNumberOfColumns(getNumberOfSongs(bracket.size));
    return Array.apply(null, { length: columns }).map((e, i) => (
      <div className="flex flex-col" key={side + i}>
        {Array.from(bracket.entries()).map((entry) => {
          const [mykey, value] = entry;
          //console.log(mykey, value);
          const colExpression = side === "l" ? i : columns - 1 - i;
          if (value.side === side && value.col === colExpression) {
            return (
              <div key={mykey}>
                <SongButton
                  editMode={editMode}
                  playbackEnabled={playbackEnabled}
                  modifyBracket={modifyBracket}
                  saveCommand={saveCommand}
                  getBracket={getBracket}
                  opponentId={value.opponentId}
                  nextId={value.nextId}
                  song={value.song}
                  id={value.id}
                  currentlyPlayingId={mycurrentlyPlayingId}
                  setCurrentlyPlayingId={mysetCurrentlyPlayingId}
                  side={side}
                  styling={
                    (value.index === 0
                      ? topStyles[colExpression]
                      : value.index % 2 === 0
                      ? styles[colExpression]
                      : "") +
                    " " +
                    colExpression +
                    " " +
                    value.index
                  }
                  color={value.color}
                  key={mykey}
                  eliminated={value.eliminated}
                  disabled={editable ? value.disabled : true}
                  winner={value.winner}
                  //setBracketWinner={setBracketWinner}
                  replacementTracks={replacementTracks}
                />
                {value.index % 2 === 0 && value.nextId != null ? (
                  <div
                    className={
                      lineStyles[colExpression] +
                      " bg-gray-500 w-[var(--lineWidth)] " +
                      (side === "l" ? "ml-[var(--leftLineMargin)]" : "ml-0")
                    }
                    key={mykey + "0"}
                  ></div>
                ) : (
                  ""
                )}
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
    ));
  }

  useEffect(() => {
    if (renderArray.length > 0) {
      setShowBracket(true);
    }
  }, [renderArray]);

  function modifyBracket(key, attribute, value) {
    let payload = bracket.get(key);
    payload[attribute] = value;
    setBracket(new Map(bracket.set(key, payload)));
  }

  function getBracket(key) {
    return bracket.get(key);
  }

  return (
    <div hidden={!showBracket || renderArray.length === 0}>
      <div
        className={
          "overflow-x-scroll flex " + //border-4 border-blue-600
          (bracketRef && bracketRef.current.offsetWidth <= width
            ? " justify-center"
            : " justify-start")
        }
      >
        <div
          ref={bracketCallback}
          className={
            "block w-fit flex-col p-2" +
            (editMode ? " bg-gray-800/25 rounded-2xl" : "")
          }
        >
          <div
            className="flex flex-row gap-[10px] justify-start p-[5px]"
            id="bracket"
          >
            {renderArray}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bracket;

// 128 -> 7
// 64 -> 6
// 32 -> 5
// 16 -> 4
// 8 -> 3
// 4 -> 2
// 2 -> 1
