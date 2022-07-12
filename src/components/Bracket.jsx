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
import BracketColumn from "./BracketColumn";

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

const Bracket = () => {
  const [tracks, setTracks] = useState([]);
  const [bracket, setBracket] = useState(new Map());
  const [columns, setColumns] = useState(0);
  const [renderArray, setRenderArray] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fillBracket(
        Array.from(
          { length: 128 },
          () => "Song " + Math.floor(Math.random() * 128)
        )
      );
    }, 1000);
    return () => {
      clearTimeout(timer);
      console.log("cleared");
    };
  }, []);

  // useEffect(() => {
  //   let temp = bracket;
  //   console.log(temp);
  //   for (let item in temp.l0) {
  //     item.song = tracks.slice(0, Math.ceil(tracks.length / 2));
  //   }
  //   for (let item in temp.r0) {
  //     item.songs = tracks.slice(-Math.ceil(tracks.length / 2));
  //   }
  //   setBracket(temp);
  // }, [tracks]);

  function genArray(side) {
    return Array.apply(null, { length: columns }).map((e, i) => (
      <div className={columnStyle} key={side + i}>
        {Array.from(bracket.entries()).map((entry) => {
          const [mykey, value] = entry;
          let colExpression = side == "l" ? i : columns - 1 - i;
          if (value.side == side && value.col == colExpression) {
            return (
              <SongButton
                modifySong={modifySong}
                opponentId={value.opponentId}
                nextId={value.nextId}
                song={value.song}
                id={value.id}
                styling={
                  value.index == 0
                    ? topStyles[colExpression]
                    : styles[colExpression]
                }
                key={mykey}
                disabled={value.disabled}
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
    console.log([...leftSide, ...rightSide]);
    setRenderArray([...leftSide, ...rightSide]);
  }, [bracket]);

  function modifySong(key, attribute, value) {
    console.log(key, attribute, value);
    let payload = bracket.get(key);
    payload[attribute] = value;
    console.log(bracket);
    console.log(new Map(bracket.set(key, payload)));
    setBracket(new Map(bracket.set(key, payload)));
  }

  function relateSongs(len, tracks, side, col) {
    let colMap = new Map();
    for (let i = 0; i < len; i++) {
      colMap.set(side + col + i, {
        song: tracks ? tracks[i] : null,
        opponentId: len <= 1 ? null : side + col + (i % 2 == 0 ? i + 1 : i - 1),
        nextId: len <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
        id: side + col + i,
        col: col,
        side: side,
        index: i,
        disabled: col == 0 ? false : true,
      });
      //colMap.set("l00", {});
    }
    return colMap;
  }

  function fillBracket(theTracks) {
    let cols = getNumberOfColumns(theTracks.length);
    let i = 0;
    let forward = true;
    let repeated = false;
    let temp = new Map();
    while (i >= 0) {
      let len = theTracks.length / 2 ** (i + 1);
      let tracks = undefined;

      if (i >= cols - 1) {
        if (!repeated) {
          repeated = true;
          temp = new Map([...relateSongs(len, tracks, "l", i), ...temp]);
          forward = false;
          continue;
        }
      }

      if (i == 0) {
        if (forward) {
          tracks = theTracks.slice(0, Math.ceil(theTracks.length / 2));
        } else {
          tracks = theTracks.slice(-Math.ceil(theTracks.length / 2));
        }
      }

      if (forward) {
        temp = new Map([...relateSongs(len, tracks, "l", i), ...temp]);
        i++;
      } else {
        temp = new Map([...relateSongs(len, tracks, "r", i), ...temp]);
        i--;
      }
    }

    setBracket(temp);
    setTracks(theTracks);
    setColumns(cols);
  }

  function getNumberOfColumns(items) {
    let cols = Math.log(items) / Math.log(2);
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
