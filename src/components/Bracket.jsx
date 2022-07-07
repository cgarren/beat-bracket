import React, { useState } from "react";

import {
  songButtonStyle,
  firstColumnStyle,
  secondColumnStyle,
  secondColumnStyleTop,
  thirdColumnStyle,
  thirdColumnStyleTop,
} from "./Bracket.module.css";

const Bracket = () => {
  const [tracks, setTracks] = useState([
    "Alright",
    "The Art of Peer Pressure",
    "Wesley's Theory",
    "Swimming Pools (Drank)",
    "Alright",
    "The Art of Peer Pressure",
    "Wesley's Theory",
    "Swimming Pools (Drank)",
  ]);

  function genDiv(columnStyle, columnStyleTop) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {tracks.map((item, index, array) => {
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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      {genDiv(firstColumnStyle, firstColumnStyle)}
      {genDiv(secondColumnStyle, secondColumnStyleTop)}
      {genDiv(thirdColumnStyle, thirdColumnStyleTop)}
      {genDiv(thirdColumnStyle, thirdColumnStyleTop)}
      {genDiv(secondColumnStyle, secondColumnStyleTop)}
      {genDiv(firstColumnStyle, firstColumnStyle)}
    </div>
  );
};

export default Bracket;
