import React from "react";

import cx from "classnames";

const ActionButton = ({
    onClick = () => {},
    disabled = false,
    icon = null,
    text = "",
    customStyling = "",
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cx(
                "border-0 hover:disabled:border-gray-200 flex items-center gap-1 flex-nowrap",
                customStyling
            )}
        >
            {icon}
            {text}
        </button>
    );
};

export default ActionButton;
