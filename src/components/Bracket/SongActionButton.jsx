import React from "react";

export default function SongButtonAction({ children, actionFunction, label, extraClasses = "" }) {
  return (
    <button
      type="button"
      onClick={actionFunction}
      className={`${extraClasses} border-0 p-0 w-[20px] h-[20px] absolute -top-2 -right-2 rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50`}
      aria-label={label}
    >
      {children}
    </button>
  );
}
