import React from "react";

const BracketWinnerInfo = ({ bracketWinner }) => {
  return (
    <div className="text-center text-lg">
      <img
        src={bracketWinner.art}
        className="w-[120px] h-[120px] mx-auto rounded"
        width="120px"
        height="120px"
        alt={bracketWinner.name}
      />
      <span className="font-bold">Winner: </span>
      {bracketWinner.name}
      <div>
        <span>Popularity:</span> {bracketWinner.popularity}
      </div>
    </div>
  );
};

export default BracketWinnerInfo;
