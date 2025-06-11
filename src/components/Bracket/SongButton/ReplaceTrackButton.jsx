import React from "react";
import SwapIcon from "../../../assets/svgs/swapIcon.svg";
import SongButtonAction from "./SongButtonAction";

export default function ReplaceTrackButton({ replacementFunction }) {
  return (
    <SongButtonAction
      actionFunction={replacementFunction}
      extraClasses="flex items-center justify-center hover:bg-gray-200 bg-white text-black"
      label="Replace track"
    >
      <div className="w-[16px] h-[16px] text-black">
        <SwapIcon />
      </div>
    </SongButtonAction>
  );
  // return (
  //   <button
  //   type="button"
  //   onClick={() => {
  //     // setShowTrackSelector(true);
  //     replaceTrack();
  //   }}
  //   className="border-0 p-0 w-[20px] h-[20px] absolute -top-2 -right-2 rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50      flex items-center justify-center hover:bg-gray-200 bg-white text-black"
  //   aria-label="Replace track"
  // >
  //   <div className="w-[16px] h-[16px]">
  //     <SwapIcon />
  //   </div>
  // </button>
  // );
}
