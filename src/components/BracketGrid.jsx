import React from "react";
import cx from "classnames";

export default function BracketGrid({ children, numberOfBrackets }) {
  return (
    <div
      className={cx(
        "pt-3 items-stretch sm:mx-5 gap-5",
        {
          "inline-grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 grid-rows-[auto]": numberOfBrackets >= 3,
        },
        { "flex flex-row flex-wrap justify-center": numberOfBrackets < 3 },
      )}
    >
      {children}
    </div>
  );
}
