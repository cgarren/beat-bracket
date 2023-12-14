import React from "react";
import cx from "classnames";

export default function Badge({ text, textColor, backgroundColor, customStyles }) {
  return (
    <span className={cx("text-sm font-medium px-2.5 py-0.5 rounded-lg", textColor, backgroundColor, customStyles)}>
      {text}
    </span>
  );
}
