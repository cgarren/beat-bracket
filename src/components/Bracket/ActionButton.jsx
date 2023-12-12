import React from "react";

import cx from "classnames";

export default function ActionButton({
  onClick = () => {},
  disabled = false,
  icon = null,
  text = "",
  customStyling = "bg-white",
  autoFocus = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // autoFocus={autoFocus}
      className={cx(
        customStyling,
        "border-0 hover:disabled:border-gray-200 flex items-center gap-1 flex-nowrap focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
      )}
    >
      {icon}
      {text}
    </button>
  );
}
