import React, { useEffect, useState } from "react";

import {
  containerStyle,
  songButtonStyle,
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

const Bracket = () => {
  const [tracks, setTracks] = useState([]);
  const [bracket, setBracket] = useState({});

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
    console.log(tracks);
    setBracket({
      ...bracket,
      ["l0"]: tracks.slice(0, Math.ceil(tracks.length / 2)),
      ["r0"]: tracks.slice(-Math.ceil(tracks.length / 2)),
    });
    console.log("set bracket");
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

    console.log(temp);
    setBracket(temp);
    setTracks(new Array(theTracks.length).fill(null));
  }

  function getNumberOfColumns(items) {
    let cols = Math.log(items) / Math.log(2);
    return cols;
  }

  function genDiv(columnStyle, columnStyleTop, songList, key) {
    console.log("generating", columnStyle, columnStyleTop, songList, key);
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
        key={key}
      >
        {songList.map((item, index, array) => {
          return (
            <button
              key={index}
              className={
                songButtonStyle +
                " " +
                (index != 0 ? columnStyle : columnStyleTop)
              }
            >
              {item}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={containerStyle}>
      {/* {genDiv(
        firstColumnStyle,
        firstColumnStyle,
        tracks.slice(0, Math.ceil(tracks.length / 2))
      )} */}
      {Array.apply(null, { length: getNumberOfColumns(tracks.length) }).map(
        (e, i) => genDiv(styles[i], topStyles[i], bracket["l" + i], i)
      )}
      {Array.apply(null, { length: getNumberOfColumns(tracks.length) }).map(
        (e, i) =>
          genDiv(
            styles[getNumberOfColumns(tracks.length) - 1 - i],
            topStyles[getNumberOfColumns(tracks.length) - 1 - i],
            bracket["r" + (getNumberOfColumns(tracks.length) - 1 - i)],
            i
          )
      )}
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
