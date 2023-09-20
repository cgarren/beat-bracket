import React from "react";
import cx from "classnames";

const Badge = ({ text, textColor, backgroundColor }) => {
    return (
        <span
            className={cx(
                backgroundColor,
                textColor,
                "text-sm font-medium px-2.5 py-0.5 rounded-lg"
            )}
        >
            {text}
        </span>
    );
};

export default Badge;
