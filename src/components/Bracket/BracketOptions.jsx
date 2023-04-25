import React from "react";

const BracketOptions = ({
  limitChange,
  showBracket,
  limit,
  seedingChange,
  seedingMethod,
  playbackChange,
  playbackEnabled,
}) => {
  return (
    <div className="inline-flex flex-col max-w-[800px] items-end">
      <div className={""}>
        <label htmlFor="limit-select">Maximum tracks: </label>
        <select
          name="limit"
          id="limit-select"
          value={limit}
          onChange={limitChange}
          disabled={!showBracket}
          className="border-0 rounded border-black"
        >
          <option value="8">8</option>
          <option value="16">16</option>
          <option value="32">32</option>
          <option value="64">64</option>
          {/* <option value="128">128</option> */}
          {/* <option value="256">256</option> */}
        </select>
      </div>
      <div>
        <label htmlFor="seeding-select">Seed by: </label>
        <select
          name="seeding"
          id="seeding-select"
          value={seedingMethod}
          onChange={seedingChange}
          disabled={!showBracket}
          className="border-0 rounded border-black"
        >
          <option value="random">Random</option>
          <option value="popularity">Popularity</option>
        </select>
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
  );
};

export default BracketOptions;
