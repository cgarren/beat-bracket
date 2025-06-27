import React from "react";
import TrackNumber from "./TrackNumber";
import CompletedIcon from "../../assets/svgs/completedIcon.svg";
import DuplicateIcon from "../../assets/svgs/duplicateIcon.svg";
import SecondChanceIcon from "../../assets/svgs/secondChanceIcon.svg";

export default function CardName({ displayName, songSource, numTracks, completed, ownsTemplate, isSecondChance }) {
  return (
    <div className="inline-flex flex-col max-w-full">
      {displayName ? <span className="font-bold">{displayName}</span> : null}
      <div className="inline-flex gap-1 flex-row align-middle items-center w-full">
        {songSource && numTracks ? (
          <>
            <span className="max-w-[65%] block truncate">{songSource[songSource.type].name}</span>{" "}
            <TrackNumber numTracks={numTracks} />
          </>
        ) : (
          "Loading..."
        )}
        {!ownsTemplate && (
          <span
            title="Created from a template by another user"
            className="text-blue-600 text-xs font-medium inline-flex rounded-md w-4 h-4"
          >
            <DuplicateIcon />
          </span>
        )}
        {completed && (
          <span title="Completed" className="text-green-600 text-xs font-medium inline-flex rounded-md w-4 h-4">
            <CompletedIcon />
          </span>
        )}
        {isSecondChance && (
          <span title="Second Chance" className="text-blue-600 text-xs font-medium inline-flex rounded-md w-4 h-4">
            <SecondChanceIcon />
          </span>
        )}
      </div>
    </div>
  );
}
