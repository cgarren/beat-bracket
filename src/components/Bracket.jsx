import React, { useEffect, useState } from "react";

import { containerStyle } from "./Bracket.module.css";

import BracketColumn from "./BracketColumn";

const Bracket = () => {
  const [tracks, setTracks] = useState([]);
  const [bracket, setBracket] = useState({});
  const [columns, setColumns] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("This will run after 3 seconds!");
      fillBracket(new Array(128).fill("Song"));
    }, 3000);
    return () => {
      clearTimeout(timer);
      console.log("cleared");
    };
  }, []);

  useEffect(() => {
    setBracket({
      ...bracket,
      ["l0"]: tracks.slice(0, Math.ceil(tracks.length / 2)),
      ["r0"]: tracks.slice(-Math.ceil(tracks.length / 2)),
    });
  }, [tracks]);

  // useEffect(() => {
  //   console.log(bracket);
  //   console.log("new bracket");
  // }, [bracket]);

  function fillBracket(theTracks) {
    let cols = getNumberOfColumns(theTracks.length);
    let i = 0;
    let forward = true;
    let repeated = false;
    let temp = {};
    while (i >= 0) {
      let len = theTracks.length / 2 ** (i + 1);
      console.log(len, i, forward);
      //console.log(temp);

      if (i >= cols - 1) {
        if (!repeated) {
          repeated = true;
          temp = {
            ["l" + i]: new Array(len).fill(null),
            ...temp,
          };
          forward = false;
          continue;
        }
      }

      if (forward) {
        temp = {
          ["l" + i]: new Array(len).fill(null),
          ...temp,
        };
        i++;
      } else {
        temp = {
          ["r" + i]: new Array(len).fill(null),
          ...temp,
        };
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
      {Array.apply(null, { length: columns }).map((e, i) => (
        <BracketColumn
          columnNum={i}
          songList={bracket["l" + i] ? bracket["l" + i] : []}
          key={i}
        />
      ))}
      {Array.apply(null, { length: columns }).map((e, i) => (
        <BracketColumn
          columnNum={columns - 1 - i}
          songList={
            bracket["r" + (columns - 1 - i)]
              ? bracket["r" + (columns - 1 - i)]
              : []
          }
          key={i}
        />
      ))}
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
