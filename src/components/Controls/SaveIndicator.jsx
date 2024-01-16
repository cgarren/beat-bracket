import React, { useMemo } from "react";
import cx from "classnames";
import CheckmarkIcon from "../../assets/svgs/checkmarkIcon.svg";
import SyncIcon from "../../assets/svgs/syncIcon.svg";
import XIcon from "../../assets/svgs/xIcon.svg";
import WaitingIcon from "../../assets/svgs/waitingIcon.svg";

export default function SaveIndicator({
  saving,
  isSaved,
  lastSaved,
  waitingToSave,
  errorText = "Not Saved",
  waitingText = "Waiting",
  savedText = "Saved",
  savingText = "Saving",
}) {
  const savingState = useMemo(() => {
    if (saving === "error") {
      return "error";
    }
    if (isSaved) {
      return "saved";
    }
    if (saving || (lastSaved && lastSaved.commandsLength !== 0) || waitingToSave) {
      return "saving";
    }
    return "waiting";
  }, [saving, isSaved, lastSaved]);

  return (
    <div
      className={cx(
        "select-none rounded-[6px] text-[14px] leading-[20px] font-normal bg-transparent flex items-center gap-1 flex-nowrap px-[0px] py-[8px]",
        { "!text-red-500 !font-bold": saving === "error" },
      )}
    >
      {savingState === "error" && (
        <>
          <div className="">
            <XIcon />
          </div>
          {errorText}
        </>
      )}{" "}
      {savingState === "waiting" && (
        <>
          <div className="">
            <WaitingIcon />
          </div>
          {waitingText}
        </>
      )}
      {savingState === "saving" && (
        <>
          <div className="animate-spin-reverse">
            <SyncIcon />
          </div>
          {savingText}
        </>
      )}
      {savingState === "saved" && (
        <>
          <CheckmarkIcon />
          {savedText}
        </>
      )}
    </div>
  );
}
