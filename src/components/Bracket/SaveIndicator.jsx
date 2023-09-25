import React from "react";
import CheckmarkIcon from "../../assets/svgs/checkmarkIcon.svg";
import SyncIcon from "../../assets/svgs/syncIcon.svg";
import XIcon from "../../assets/svgs/xIcon.svg";

import cx from "classnames";

export const SaveIndicator = ({ saving, isReady }) => {
    return (
        <div
            className={cx(
                "select-none rounded-[6px] text-[14px] leading-[20px] font-normal bg-transparent flex items-center gap-1 flex-nowrap px-[0px] py-[8px]",
                { "!text-red-500": saving === "error" }
            )}
        >
            {saving === "error" ? (
                <XIcon />
            ) : saving || !isReady() ? (
                <div className="animate-spin-reverse">
                    <SyncIcon />
                </div>
            ) : (
                <CheckmarkIcon />
            )}
            {saving === "error"
                ? "Not saved"
                : saving || !isReady()
                ? "Saving"
                : "Saved"}
        </div>
    );
};
