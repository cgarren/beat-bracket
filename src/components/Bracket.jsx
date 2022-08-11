//TODO: USE REFS INSTEAD OF REDRAWING EVERY TIME ONE THING CHANGES!

// Library to get prominent colors from images (for coloring bracket spaces according to album art)
import Vibrant, { Swatch } from "node-vibrant";

import Mousetrap from "mousetrap";

import React, { useEffect, useState } from "react";

import {
  nearestGreaterPowerOf2,
  nearestLesserPowerOf2,
} from "../utilities/helpers";

import {
  loading,
  containerStyle,
  holderStyle,
  columnStyle,
  lineStyle,
  lineLeftStyle,
  lineRightStyle,
  firstColumnStyle,
  firstColumnLineStyle,
  secondColumnStyle,
  secondColumnStyleTop,
  secondColumnLineStyle,
  thirdColumnStyle,
  thirdColumnStyleTop,
  thirdColumnLineStyle,
  fourthColumnStyle,
  fourthColumnStyleTop,
  fourthColumnLineStyle,
  fifthColumnStyle,
  fifthColumnStyleTop,
  fifthColumnLineStyle,
  sixthColumnStyle,
  sixthColumnStyleTop,
  sixthColumnLineStyle,
  seventhColumnStyle,
  seventhColumnStyleTop,
  seventhColumnLineStyle,
  eigthColumnStyle,
  eigthColumnStyleTop,
  eigthColumnLineStyle,
  ninthColumnStyle,
  ninthColumnStyleTop,
  ninthColumnLineStyle,
} from "./Bracket.module.css";

import SongButton from "./SongButton";

const styles = [
  firstColumnStyle,
  secondColumnStyle,
  thirdColumnStyle,
  fourthColumnStyle,
  fifthColumnStyle,
  sixthColumnStyle,
  seventhColumnStyle,
  eigthColumnStyle,
  ninthColumnStyle,
];

const topStyles = [
  firstColumnStyle,
  secondColumnStyleTop,
  thirdColumnStyleTop,
  fourthColumnStyleTop,
  fifthColumnStyleTop,
  sixthColumnStyleTop,
  seventhColumnStyleTop,
  eigthColumnStyleTop,
  ninthColumnStyleTop,
];

const lineStyles = [
  firstColumnLineStyle,
  secondColumnLineStyle,
  thirdColumnLineStyle,
  fourthColumnLineStyle,
  fifthColumnLineStyle,
  sixthColumnLineStyle,
  seventhColumnLineStyle,
  eigthColumnLineStyle,
  ninthColumnLineStyle,
];

const Bracket = ({ tracks, loadReady }) => {
  const [bracket, setBracket] = useState(new Map());
  const [columns, setColumns] = useState(0);
  const [renderArray, setRenderArray] = useState([]);
  const [commands, setCommands] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    async function kickOff() {
      // reset the undo chain
      setCommands([]);
      setShow(false);
      await fillBracket(tracks);
    }
    if (tracks && tracks.length !== 0) {
      kickOff();
    }
  }, [tracks]);

  function saveCommand(action, inverse) {
    let temp = [
      ...commands,
      {
        action: action,
        inverse: inverse,
      },
    ];
    console.log(temp);
    setCommands(temp);
  }

  function undo() {
    const lastCommand = commands[commands.length - 1];
    console.log(commands, lastCommand);
    if (lastCommand) {
      // remove the last element
      setCommands(commands.splice(0, commands.length - 1));
      // run the function that was just popped
      lastCommand.inverse();
    }
  }

  Mousetrap.bind("mod+z", undo);

  function genArray(side) {
    return Array.apply(null, { length: columns }).map((e, i) => (
      <div className={columnStyle} key={side + i}>
        {Array.from(bracket.entries()).map((entry) => {
          const [mykey, value] = entry;
          const colExpression = side === "l" ? i : columns - 1 - i;
          if (value.side === side && value.col === colExpression) {
            return (
              <div key={mykey} className={holderStyle}>
                <SongButton
                  modifyBracket={modifyBracket}
                  saveCommand={saveCommand}
                  getBracket={getBracket}
                  opponentId={value.opponentId}
                  nextId={value.nextId}
                  song={value.song}
                  id={value.id}
                  styling={
                    value.index === 0
                      ? topStyles[colExpression]
                      : value.index % 2 == 0
                      ? styles[colExpression]
                      : ""
                  }
                  color={value.color}
                  key={mykey}
                  eliminated={value.eliminated}
                  disabled={value.disabled}
                  winner={value.winner}
                />
                {value.index % 2 == 0 && value.nextId != null ? (
                  <div
                    className={
                      lineStyles[colExpression] +
                      " " +
                      lineStyle +
                      " " +
                      (side === "l" ? lineLeftStyle : lineRightStyle)
                    }
                    key={mykey + "0"}
                  ></div>
                ) : (
                  ""
                )}
              </div>
            );
          }
        })}
      </div>
    ));
  }

  useEffect(() => {
    console.log("resetting render array");
    let leftSide = genArray("l");
    let rightSide = genArray("r");
    setRenderArray([...leftSide, ...rightSide]);
  }, [bracket]);

  useEffect(() => {
    // show the bracket when the renderArray is ready
    setShow(true);
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
        song: theTracks ? (theTracks[i] ? theTracks[i].name : null) : null,
        opponentId:
          len <= 1
            ? otherSide + col + 0
            : side + col + (i % 2 === 0 ? i + 1 : i - 1),
        nextId: len <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
        previousIds:
          col == 0
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
    console.log(temp);
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
    <div>
      <div className={loading} hidden={show && loadReady}>
        Loading...
      </div>
      <div hidden={!show || !loadReady || renderArray.length === 0}>
        <button onClick={undo}>Undo</button>
        {/* {bracket.forEach((value, key) => {
        <SongButton
          styling={value.col}
          key={key}
          disabled={col != 0 ? true : false}
        />;
      })} */}
        <div className={containerStyle}>{renderArray}</div>
        {/* {Array.apply(null, { length: columns }).map((e, i) => (
        <BracketColumn
          columnNum={columns - 1 - i}
          songList={
            bracket["r" + (columns - 1 - i)]
              ? bracket["r" + (columns - 1 - i)]
              : []
          }
          modifySong={modifySong}
          key={i}
        />
      ))} */}
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
