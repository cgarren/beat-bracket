import React from "react";
import cx from "classnames";

export default function CornerButton({ removeFunc, autoPosition = true }) {
  return (
    <button
      onClick={removeFunc}
      className={cx(
        "border-0 p-0 w-[30px] h-[30px] bg-white text-black rounded-full",
        { "absolute -top-2 -right-2": autoPosition }
      )}
      title="Delete bracket"
      aria-label="Delete bracket"
    >
      {"✕"}
    </button>
  );
}
