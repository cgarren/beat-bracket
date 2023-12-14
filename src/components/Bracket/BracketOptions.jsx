import React, { useState } from "react";

import OptionsDropdown from "./OptionsDropdown";

import ActionButton from "./ActionButton";
import StartBracketModal from "./StartBracketModal";

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
      <div className="flex flex-row gap-1 overflow-x-scroll w-screen py-2 items-center min-[450px]:justify-center justify-start">
        <OptionsDropdown
          label="Size"
          value={limit}
          onChange={limitChange}
          disabled={!showBracket}
          minWidth="min-w-[80px]"
        >
          {hardLimit >= 8 || limit === 8 ? <option value="8">8</option> : null}
          {hardLimit >= 16 || limit === 16 ? <option value="16">16</option> : null}
          {hardLimit >= 32 || limit === 32 ? <option value="32">32</option> : null}
          {hardLimit >= 64 || limit === 64 ? <option value="64">64</option> : null}
          {hardLimit >= 128 || limit === 128 ? <option value="128">128</option> : null}
          {hardLimit >= 256 || limit === 256 ? <option value="256">256</option> : null}
        </OptionsDropdown>
        <OptionsDropdown
          label="Songs to include"
          value={inclusionMethod}
          onChange={inclusionChange}
          disabled={!showBracket}
          minWidth="min-w-[111px]"
        >
          <option value="popularity">Most popular</option>
          <option value="random">Random</option>
          {songSourceType === "playlist" ? <option value="playlist">First {limit} tracks of playlist</option> : null}
          {inclusionMethod === "custom" ? <option value="custom">Custom</option> : null}
        </OptionsDropdown>
        <OptionsDropdown
          label="Seed by"
          value={seedingMethod}
          onChange={seedingChange}
          disabled={!showBracket}
          minWidth="min-w-[67px]"
        >
          <option value="popularity">Popularity</option>
          <option value="random">Random</option>
          {songSourceType === "playlist" && inclusionMethod === "playlist" ? (
            <option value="playlist">Playlist order (track 1 vs {limit})</option>
          ) : null}
          {seedingMethod === "custom" ? <option value="custom">Custom</option> : null}
        </OptionsDropdown>
        <div className="min-w-fit h-full font-bold">
          <ActionButton
            onClick={() => setShowModal(true)}
            disabled={false}
            // icon={<RocketIcon />}
            text="Start Bracket"
          />
        </div>
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
