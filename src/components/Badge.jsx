import React from "react";
import cx from "classnames";

const Badge = ({ text, textColor, backgroundColor, customStyles }) => {
    return (
        <span
            className={cx(
                "text-sm font-medium px-2.5 py-0.5 rounded-lg",
                textColor,
                backgroundColor,
                customStyles
            )}
        >
            {text}
        </span>
    );
};

export default Badge;
