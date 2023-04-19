import React from "react";

export default function CornerButton({ removeFunc, autoPosition = true }) {
  return (
    <button
      onClick={removeFunc}
      className={
        "border-0 p-0 w-[30px] h-[30px] bg-white text-black rounded-full " +
        (autoPosition ? "absolute -top-2 -right-2" : "")
      }
      title="Delete bracket"
    >
      {"✕"}
    </button>
  );
}
