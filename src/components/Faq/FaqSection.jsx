import React from "react";
import cx from "classnames";
import QuestionMarkIcon from "../../assets/svgs/questionMarkIcon.svg";
import CarrotIcon from "../../assets/svgs/carrotIcon.svg";

export default function FaqSection({ question, answer, expanded, toggleExpanded }) {
  return (
    // <div className="mb-5">
    //   <h2 className="font-bold text-xl text-white">{question}</h2>
    //   <div className="text-lg text-zinc-300">{answer}</div>
    // </div>
    <div className={cx({ "bg-zinc-900": expanded })}>
      <h2 className={cx({ "border-b border-gray-700": expanded })}>
        <button
          type="button"
          className={cx(
            "flex",
            "items-center",
            "justify-between",
            "w-full",
            "p-5",
            "text-xl",
            "text-left",
            "border-none",
            "text-gray-400",
            "hover:bg-inherit",
            "hover:text-gray-200",
            { "text-gray-200": expanded },
          )}
          onClick={toggleExpanded}
        >
          <span className="flex items-center">
            <div className="w-5 h-5 mr-2 shrink-0">
              <QuestionMarkIcon />
            </div>
            {question}
          </span>
          <div
            className={cx("w-6", "h-6", "shrink-0", {
              "rotate-180": expanded,
            })}
          >
            <CarrotIcon />
          </div>
        </button>
      </h2>
      <div className={cx({ hidden: !expanded })}>
        <div className="px-5 py-5">
          <div className="mb-2 text-gray-200 text-lg">{answer}</div>
        </div>
      </div>
    </div>
  );
}
