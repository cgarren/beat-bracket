import React from "react";

const ActionButton = ({
  onClick = () => {},
  disabled = false,
  icon = null,
  text = "",
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="border-l-gray-200 hover:disabled:border-x-gray-200 flex items-center gap-1 flex-nowrap"
    >
      {icon}
      {text}
    </button>
  );
};

export default ActionButton;
