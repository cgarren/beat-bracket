import React from "react";

import cx from "classnames";

export default function ActionButton({
  onClick = () => {},
  disabled = false,
  icon = null,
  text = "",
  variant = "white",
  customStyling = "",
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
        { "bg-gray-800 text-white hover:bg-black": variant === "primary" },
        { "bg-gray-200 text-black hover:bg-gray-300": variant === "secondary" },
        { "bg-white text-black hover:bg-gray-100": variant === "white" },
        { "bg-red-600 text-white hover:bg-red-700": variant === "danger" },
        "border-0 hover:disabled:border-gray-200 flex items-center gap-1 flex-nowrap focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
      )}
    >
      {icon}
      {text}
    </button>
  );
}
