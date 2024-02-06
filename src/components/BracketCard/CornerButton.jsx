import React from "react";
import cx from "classnames";
import { Button } from "../ui/button";

export default function CornerButton({ removeFunc, autoPosition = true }) {
  return (
    <Button
      onClick={removeFunc}
      variant="destructive"
      className={cx(
        "border-0 p-0 w-[30px] h-[30px] hover:text-white bg-white text-black rounded-full focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
        { "absolute -top-2 -right-2": autoPosition },
      )}
      title="Delete bracket"
    >
      ✕
    </Button>
  );
}
