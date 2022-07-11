import React, { useEffect, useState } from "react";

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
} from "./BracketColumn.module.css";

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

const BracketColumn = ({ columnNum, songList }) => {
  useEffect(() => {
    console.log(songList);
  }, [songList]);

  return (
    <div className={columnStyle}>
      {songList.map((item, index, array) => {
        return (
          <SongButton
            disabled={false}
            key={index}
            song={item}
            styling={index != 0 ? styles[columnNum] : topStyles[columnNum]}
          />
        );
      })}
    </div>
  );
};

export default BracketColumn;
