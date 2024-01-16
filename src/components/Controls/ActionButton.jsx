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
  const buttonVariants = {
    primary: "text-white disabled:text-white bg-gray-800 hover:enabled:bg-gray-700 hover:disabled:bg-gray-800",
    secondary: "text-black disabled:text-black bg-gray-200 hover:bg-gray-300 disabled:hover:bg-gray-200",
    white: "text-black disabled:text-black bg-white hover:bg-gray-100 disabled:hover:bg-white",
    danger: "text-white disabled:text-white bg-red-600 hover:bg-red-700 disabled:hover:bg-red-600",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // autoFocus={autoFocus}
      className={cx(
        // "hover:bg-gray-700",
        customStyling,
        buttonVariants[variant],
        "disabled:opacity-100 disabled:cursor-not-allowed border-0 flex justify-center items-center gap-1 flex-nowrap focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
      )}
      style={{ "--custom": "inherit" }}
    >
      {icon}
      {text}
    </button>
  );
}
