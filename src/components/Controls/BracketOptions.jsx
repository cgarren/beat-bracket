import React, { useState } from "react";
import { SelectItem } from "../ui/select";

import BracketOptionsSelect from "./BracketOptionsSelect";

import StartBracketModal from "../Modals/StartBracketModal";
import { Button } from "../ui/button";

export default function BracketOptions({
  songSourceType,
  limitChange,
  showBracket,
  limit,
  hardLimit,
  seedingChange,
  seedingMethod,
  inclusionChange,
  inclusionMethod,
  maxBracketSize,
  totalTracks,
  // playbackChange,
  // playbackEnabled,
  startBracket,
}) {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <StartBracketModal showModal={showModal} setShowModal={setShowModal} startBracket={startBracket} />
      <div className="flex flex-row gap-1 overflow-x-auto w-screen py-2 items-center min-[450px]:justify-center justify-start">
        <BracketOptionsSelect
          label="Size"
          value={limit}
          onChange={limitChange}
          disabled={!showBracket}
          minWidth="min-w-[80px]"
        >
          {/* generate the below code (for select options) automatically */}

          {Array.from({ length: Math.log2(maxBracketSize) }, (_, i) => {
            const value = Math.pow(2, i + 3);
            if (value > maxBracketSize || value >= totalTracks) return null;
            return (
              // (hardLimit >= value || limit === value) && (
              <SelectItem key={value} value={String(value)}>
                {value}
              </SelectItem>
              // )
            );
          })}
          {(Math.log2(hardLimit) % 1 !== 0 || totalTracks === maxBracketSize || totalTracks === hardLimit) && (
            <SelectItem value={String(hardLimit)}>{`Max (${hardLimit})`}</SelectItem>
          )}
        </BracketOptionsSelect>
        {limit !== totalTracks && (
          <BracketOptionsSelect
            label="Songs to include"
            value={inclusionMethod}
            onChange={inclusionChange}
            disabled={!showBracket}
            minWidth="min-w-[111px]"
          >
            <SelectItem value="popularity">Most popular</SelectItem>
            <SelectItem value="random">Random</SelectItem>
            {songSourceType === "playlist" ? (
              <SelectItem value="playlist">First {limit} tracks of playlist</SelectItem>
            ) : null}
            {inclusionMethod === "custom" ? <SelectItem value="custom">Custom</SelectItem> : null}
          </BracketOptionsSelect>
        )}
        <BracketOptionsSelect
          label="Seed by"
          value={seedingMethod}
          onChange={seedingChange}
          disabled={!showBracket}
          minWidth="min-w-[67px]"
        >
          <SelectItem value="popularity">Popularity</SelectItem>
          <SelectItem value="random">Random</SelectItem>
          {songSourceType === "playlist" && inclusionMethod === "playlist" ? (
            <SelectItem value="playlist">Playlist order (track 1 vs {limit})</SelectItem>
          ) : null}
          {seedingMethod === "custom" ? <SelectItem value="custom">Custom</SelectItem> : null}
        </BracketOptionsSelect>
        <Button onClick={() => setShowModal(true)}>Start Bracket</Button>
        {/* <div className={""}>
          <label htmlFor="playback-select">Hover preview (beta): </label>
          <input
            type="checkbox"
            id="playback-select"
            checked={playbackEnabled}
            onChange={playbackChange}
            disabled={!showBracket}
            name="playback-select"
          ></input>
        </div> */}
      </div>
    </>
  );
}
