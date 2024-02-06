import React from "react";
import TrackNumber from "./TrackNumber";
import CompletedIcon from "../../assets/svgs/completedIcon.svg";
import DuplicateIcon from "../../assets/svgs/duplicateIcon.svg";

export default function CardName({ displayName, songSource, numTracks, completed, ownsTemplate }) {
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
            className="text-blue-600 text-xs font-medium inline-flex rounded-md"
          >
            <DuplicateIcon />
          </span>
        )}
        {completed && (
          <span title="Completed" className="text-green-600 text-xs font-medium inline-flex rounded-md">
            <CompletedIcon />
          </span>
        )}
      </div>
    </div>
  );
}
