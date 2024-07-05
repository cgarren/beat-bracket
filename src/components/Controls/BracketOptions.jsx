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
          {(hardLimit >= 8 || limit === 8) && <SelectItem value="8">8</SelectItem>}
          {(hardLimit >= 16 || limit === 16) && <SelectItem value="16">16</SelectItem>}
          {(hardLimit >= 32 || limit === 32) && <SelectItem value="32">32</SelectItem>}
          {(hardLimit >= 64 || limit === 64) && <SelectItem value="64">64</SelectItem>}
          {(hardLimit >= 128 || limit === 128) && <SelectItem value="128">128</SelectItem>}
          {(hardLimit >= 256 || limit === 256) && <SelectItem value="256">256</SelectItem>}
          <SelectItem value={String(hardLimit)}>{`Max (${hardLimit})`}</SelectItem>
        </BracketOptionsSelect>
        {limit !== hardLimit && (
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
