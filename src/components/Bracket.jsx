//TODO: USE REFS INSTEAD OF REDRAWING EVERYTIME ONE THING CHANGES!

import React, { useEffect, useState } from "react";

import { containerStyle } from "./Bracket.module.css";

import {
  columnStyle,
  firstColumnStyle,
  secondColumnStyle,
  secondColumnStyleTop,
  thirdColumnStyle,
  thirdColumnStyleTop,
  fourthColumnStyle,
  fourthColumnStyleTop,
  fifthColumnStyle,
  fifthColumnStyleTop,
  sixthColumnStyle,
  sixthColumnStyleTop,
  seventhColumnStyle,
  seventhColumnStyleTop,
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
];

const topStyles = [
  firstColumnStyle,
  secondColumnStyleTop,
  thirdColumnStyleTop,
  fourthColumnStyleTop,
  fifthColumnStyleTop,
  sixthColumnStyleTop,
  seventhColumnStyleTop,
];

const Bracket = ({ tracks }) => {
  const [bracket, setBracket] = useState(new Map());
  const [columns, setColumns] = useState(0);
  const [renderArray, setRenderArray] = useState([]);

  useEffect(() => {
    if (tracks && tracks.length !== 0) {
      fillBracket(tracks);
    }
  }, [tracks]);

  function genArray(side) {
    return Array.apply(null, { length: columns }).map((e, i) => (
      <div className={columnStyle} key={side + i}>
        {Array.from(bracket.entries()).map((entry) => {
          const [mykey, value] = entry;
          let colExpression = side === "l" ? i : columns - 1 - i;
          if (value.side === side && value.col === colExpression) {
            return (
              <SongButton
                modifyBracket={modifyBracket}
                getBracket={getBracket}
                opponentId={value.opponentId}
                nextId={value.nextId}
                song={value.song}
                id={value.id}
                styling={
                  value.index === 0
                    ? topStyles[colExpression]
                    : styles[colExpression]
                }
                key={mykey}
                disabled={value.disabled}
                winner={value.winner}
              />
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

  function modifyBracket(key, attribute, value) {
    let payload = bracket.get(key);
    payload[attribute] = value;
    setBracket(new Map(bracket.set(key, payload)));
  }

  function getBracket(key) {
    return bracket.get(key);
  }

  function relateSongs(len, theTracks, col, side, otherSide) {
    let colMap = new Map();
    for (let i = 0; i < len; i++) {
      colMap.set(side + col + i, {
        song: theTracks ? (theTracks[i] ? theTracks[i].name : null) : null,
        opponentId:
          len <= 1
            ? otherSide + col + 0
            : side + col + (i % 2 === 0 ? i + 1 : i - 1),
        nextId: len <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
        id: side + col + i,
        col: col,
        side: side,
        index: i,
        disabled: col === 0 && theTracks[i] ? false : true,
        winner: false,
        color: null,
      });
      //colMap.set("l00", {});
    }
    return colMap;
  }

  function fillBracket() {
    let cols = getNumberOfColumns(tracks.length);
    let i = 0;
    let forward = true;
    let repeated = false;
    let temp = new Map();

    let nearestPowerOf2 = 0;
    let j = 0;
    while (nearestPowerOf2 <= tracks.length) {
      nearestPowerOf2 = 2 ** (j + 1);
      j++;
    }

    let oddTracks = nearestPowerOf2 % tracks.length;

    console.log(nearestPowerOf2, oddTracks);

    while (i >= 0) {
      let theTracks = undefined;
      let len = nearestPowerOf2 / 2 ** (i + 1) / 2;

      if (i >= cols - 1) {
        if (!repeated) {
          repeated = true;
          temp = new Map([
            ...relateSongs(len, theTracks, i, "l", "r"),
            ...temp,
          ]);
          forward = false;
          continue;
        }
      }

      if (i === 0) {
        if (forward) {
          theTracks = tracks.slice(0, Math.ceil(tracks.length / 2));
          console.log(theTracks);
        } else {
          theTracks = tracks.slice(-Math.floor(tracks.length / 2));
          console.log(theTracks);
        }
      }

      // if (i === 1) {
      //   if (forward) {
      //     if (tracks.length < )
      //     theTracks = tracks.slice(0, Math.ceil(tracks.length / 2)));
      //   } else {
      //     theTracks = tracks.slice(-Math.ceil(tracks.length / 2));
      //   }
      // }

      if (forward) {
        temp = new Map([...relateSongs(len, theTracks, i, "l", "r"), ...temp]);
        i++;
      } else {
        temp = new Map([...relateSongs(len, theTracks, i, "r", "l"), ...temp]);
        i--;
      }
    }

    setBracket(temp);
    setColumns(cols);
  }

  function getNumberOfColumns(items) {
    let cols = Math.ceil(Math.log(items) / Math.log(2));
    return cols;
  }

  return (
    <div className={containerStyle}>
      {/* {bracket.forEach((value, key) => {
        <SongButton
          styling={value.col}
          key={key}
          disabled={col != 0 ? true : false}
        />;
      })} */}
      {renderArray}
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
