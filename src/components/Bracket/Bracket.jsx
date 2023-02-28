import React, { useEffect, useState, useCallback } from "react";
import SongButton from "./SongButton";
import useWindowSize from "react-use/lib/useWindowSize";
import {
  getNumberOfColumns,
  fillBracket,
} from "../../utilities/bracketGeneration";

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
  setBracketWinner,
  saveCommand,
  playbackEnabled,
  bracket,
  setBracket,
  editable,
  editMode,
}) => {
  const columns = Array.isArray(tracks) ? getNumberOfColumns(tracks.length) : 0;
  const [renderArray, setRenderArray] = useState([]);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState(null);
  const [centerBracket, setCenterBracket] = useState(false);
  const { width, height } = useWindowSize();
  const [bracketRef, setBracketRef] = useState(null);
  const bracketCallback = useCallback((node) => {
    // console.log("setting bracket ref");
    setBracketRef({ current: node });
    updateCenterBracket();
  }, []);

  useEffect(() => {
    updateCenterBracket();
  }, [bracket, showBracket, renderArray, width, height]);

  function updateCenterBracket() {
    // console.log("called", bracketRef);
    if (bracketRef) {
      //console.log(bracketRef.current, width);
      if (bracketRef.current.offsetWidth <= width) {
        //console.log("center on");
        setCenterBracket(true);
      } else {
        //console.log("center off");
        setCenterBracket(false);
      }
    }
  }

  useEffect(() => {
    async function kickOff() {
      // reset the undo chain
      console.log("kicking off");
      setShowBracket(false);
      setCurrentlyPlayingId(null);
      const temp = await fillBracket(tracks, columns);
      setBracket(temp);
    }
    if (Array.isArray(tracks)) {
      if (!tracks.includes(null)) {
        if (tracks.length !== 0) {
          setBracketWinner(null);
          kickOff();
        } else {
          setRenderArray([]);
        }
      }
    }
  }, [tracks]);

  useEffect(() => {
    regenerateRenderArray();
  }, [columns, editMode]);

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
                  editMode={editMode}
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
                  disabled={editable ? value.disabled : true}
                  winner={value.winner}
                  setBracketWinner={setBracketWinner}
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

  return (
    <div hidden={!showBracket || renderArray.length === 0}>
      <div
        className={
          "overflow-x-scroll flex" + //border-4 border-blue-600
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
