import React from "react";
import CheckmarkIcon from "../../assets/svgs/checkmarkIcon.svg";
import SyncIcon from "../../assets/svgs/syncIcon.svg";
import XIcon from "../../assets/svgs/xIcon.svg";

import cx from "classnames";

export const SaveIndicator = ({ saving, isReady, waitingToSave }) => {
    return (
        <div
            className={cx(
                "select-none rounded-[6px] text-[14px] leading-[20px] font-normal bg-transparent flex items-center gap-1 flex-nowrap px-[0px] py-[8px]",
                { "!text-red-500 !font-bold": saving === "error" }
            )}
        >
            {saving === "error" ? (
                <div className="">
                    <XIcon />
                </div>
            ) : saving || !isReady() || waitingToSave ? (
                <div className="animate-spin-reverse">
                    <SyncIcon />
                </div>
            ) : (
                <CheckmarkIcon />
            )}
            {saving === "error"
                ? "Not saved"
                : saving || !isReady() || waitingToSave
                ? "Saving"
                : "Saved"}
        </div>
    );
};
