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
    primary: {
      backgroundColor: "bg-gray-800",
      textColor: "text-white",
      hoverBackgroundColor: "bg-gray-700",
    },
    secondary: {
      backgroundColor: "bg-gray-200",
      textColor: "text-black",
      hoverBackgroundColor: "bg-gray-300",
    },
    white: {
      backgroundColor: "bg-white",
      textColor: "text-black",
      hoverBackgroundColor: "bg-gray-100",
    },
    danger: {
      backgroundColor: "bg-red-600",
      textColor: "text-white",
      hoverBackgroundColor: "bg-red-700",
    },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      // autoFocus={autoFocus}
      className={cx(
        customStyling,
        buttonVariants[variant].backgroundColor,
        buttonVariants[variant].textColor,
        `hover:enabled:${buttonVariants[variant].hoverBackgroundColor}`,
        `hover:disabled:${buttonVariants[variant].backgroundColor}`,
        `disabled:${buttonVariants[variant].textColor}`,
        "disabled:opacity-100 disabled:cursor-not-allowed border-0 flex justify-center items-center gap-1 flex-nowrap focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
      )}
    >
      {icon}
      {text}
    </button>
  );
}
