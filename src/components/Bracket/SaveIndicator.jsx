import React from "react";
import cx from "classnames";
import CheckmarkIcon from "../../assets/svgs/checkmarkIcon.svg";
import SyncIcon from "../../assets/svgs/syncIcon.svg";
import XIcon from "../../assets/svgs/xIcon.svg";

export default function SaveIndicator({ saving, isSaved, lastSaved }) {
  return (
    <div
      className={cx(
        "select-none rounded-[6px] text-[14px] leading-[20px] font-normal bg-transparent flex items-center gap-1 flex-nowrap px-[0px] py-[8px]",
        { "!text-red-500 !font-bold": saving === "error" },
      )}
    >
      {saving === "error" && (
        <>
          <div className="">
            <XIcon />
          </div>
          Not Saved
        </>
      )}{" "}
      {!saving && !isSaved && lastSaved.time === 0 && (
        <>
          <div className="animate-spin-reverse">
            <SyncIcon />
          </div>
          Waiting
        </>
      )}
      {saving !== "error" && !isSaved && (
        <>
          <div className="animate-spin-reverse">
            <SyncIcon />
          </div>
          Saving
        </>
      )}
      {saving !== "error" && isSaved && (
        <>
          <CheckmarkIcon />
          Saved
        </>
      )}
    </div>
  );
}
