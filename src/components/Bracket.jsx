// Library to get prominent colors from images (for coloring bracket spaces according to album art)
import Vibrant from "node-vibrant";

import React, { useEffect, useState, useCallback } from "react";

import SongButton from "./SongButton";

import {
  nearestGreaterPowerOf2,
  nearestLesserPowerOf2,
} from "../utilities/helpers";

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
  "mt-[var(--firstColumnSpacing)]",
  "mt-[calc(var(--buttonheight)*1.25)]",
  "mt-[calc(var(--buttonheight)*2.75)]",
  "mt-[calc(var(--buttonheight)*5.75)]",
  "mt-[calc(var(--buttonheight)*11.75)]",
  "mt-[calc(var(--buttonheight)*23.75)]",
  "mt-[calc(var(--buttonheight)*47.75)]",
  "mt-[calc(var(--buttonheight)*95.75)]",
  "mt-[calc(var(--buttonheight)*191.75)]",
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
  tracks,
  showBracket,
  setShowBracket,
  setBracketComplete,
  saveCommand,
  playbackEnabled,
  bracket,
  setBracket,
}) => {
  const [columns, setColumns] = useState(0);
  const [renderArray, setRenderArray] = useState([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [centerBracket, setCenterBracket] = useState(false);
  const [bracketRef, setBracketRef] = useState(null);
  const bracketCallback = useCallback((node) => {
    // console.log("setting bracket ref");
    setBracketRef({ current: node });
    updateCenterBracket();
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateCenterBracket);
    return () => {
      window.removeEventListener("resize", updateCenterBracket);
    };
  }, []);

  useEffect(() => {
    updateCenterBracket();
  }, [bracket, showBracket, renderArray]);

  function updateCenterBracket() {
    // console.log("called", bracketRef);
    if (bracketRef && window) {
      // console.log("inner", bracketRef.current);
      if (bracketRef.current.offsetWidth <= window.innerWidth) {
        // console.log("center on");
        setCenterBracket(true);
      } else {
        // console.log("center off");
        setCenterBracket(false);
      }
    }
  }

  useEffect(() => {
    async function kickOff() {
      // reset the undo chain
      console.log("kicking off");
      setShowBracket(false);
      await fillBracket(tracks);
    }
    if (Array.isArray(tracks)) {
      if (!tracks.includes(null)) {
        if (tracks.length !== 0) {
          setBracketComplete(false);
          kickOff();
        } else {
          setRenderArray([]);
        }
      } else {
        setColumns(getNumberOfColumns(tracks.length));
      }
    }
  }, [tracks]);

  useEffect(() => {
    regenerateRenderArray();
  }, [columns]);

  function generateComponentArray(side) {
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
                  playbackEnabled={playbackEnabled}
                  modifyBracket={modifyBracket}
                  saveCommand={saveCommand}
                  getBracket={getBracket}
                  opponentId={value.opponentId}
                  nextId={value.nextId}
                  song={value.song}
                  id={value.id}
                  currentlyPlayingId={currentlyPlayingId}
                  setCurrentlyPlayingId={setCurrentlyPlayingId}
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
                  disabled={value.disabled}
                  winner={value.winner}
                  setBracketComplete={setBracketComplete}
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

  function regenerateRenderArray() {
    let leftSide = generateComponentArray("l");
    let rightSide = generateComponentArray("r");
    setRenderArray([...leftSide, ...rightSide]);
  }

  // rerender the bracket when certain events happen
  useEffect(() => {
    regenerateRenderArray();
    setShowBracket(true);
  }, [bracket, playbackEnabled, currentlyPlayingId]);

  useEffect(() => {
    // show the bracket when the renderArray is ready
    setShowBracket(true);
  }, [renderArray]);

  function modifyBracket(key, attribute, value) {
    let payload = bracket.get(key);
    payload[attribute] = value;
    setBracket(new Map(bracket.set(key, payload)));
  }

  function getBracket(key) {
    return bracket.get(key);
  }

  async function relateSongs(len, theTracks, col, side, otherSide) {
    let colMap = new Map();
    for (let i = 0; i < len; i++) {
      colMap.set(side + col + i, {
        song: theTracks ? (theTracks[i] ? theTracks[i] : null) : null,
        opponentId:
          len <= 1
            ? otherSide + col + 0
            : side + col + (i % 2 === 0 ? i + 1 : i - 1),
        nextId: len <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
        previousIds:
          col === 0
            ? []
            : [
                side + (col - 1) + Math.ceil(i * 2),
                side + (col - 1) + (Math.ceil(i * 2) + 1),
              ],
        id: side + col + i,
        col: col,
        side: side,
        index: i,
        disabled: col === 0 && theTracks[i] ? false : true,
        winner: false,
        eliminated: false,
        color: theTracks
          ? theTracks[i]
            ? (await Vibrant.from(theTracks[i].art).getPalette()).Vibrant
            : null
          : null,
      });
    }
    return colMap;
  }

  async function fillBracket() {
    const cols = getNumberOfColumns(tracks.length);
    let i = 0;
    let forward = true;
    let repeated = false;
    let temp = new Map();

    while (i >= 0) {
      const len = nearestGreaterPowerOf2(tracks.length) / 2 ** (i + 1) / 2;
      let theTracks = new Array(len);
      if (i >= cols - 1) {
        if (!repeated) {
          repeated = true;
          temp = new Map([
            ...(await relateSongs(len, theTracks, i, "l", "r")),
            ...temp,
          ]);
          forward = false;
          continue;
        }
      }

      if (i === 0) {
        if (forward) {
          theTracks = tracks.slice(0, Math.ceil(tracks.length / 2));
          //console.log(theTracks);
        } else {
          theTracks = tracks.slice(-Math.floor(tracks.length / 2));
          //console.log(theTracks);
        }
      }

      if (forward) {
        temp = new Map([
          ...(await relateSongs(len, theTracks, i, "l", "r")),
          ...temp,
        ]);
        i++;
      } else {
        temp = new Map([
          ...(await relateSongs(len, theTracks, i, "r", "l")),
          ...temp,
        ]);
        i--;
      }
    }
    console.log(tracks, tracks.length);
    setBracket(temp);
    setColumns(cols);
  }

  function getNumberOfColumns(numItems) {
    let cols = Math.ceil(
      Math.log(nearestLesserPowerOf2(numItems)) / Math.log(2)
    );
    return cols;
  }

  return (
    <div hidden={!showBracket || renderArray.length === 0}>
      <div
        className={
          "overflow-x-scroll flex" +
          (centerBracket ? " justify-center" : " justify-start")
        }
      >
        <div ref={bracketCallback} className="block w-fit flex-col">
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
