import React from "react";
import cx from "classnames";

const FaqSection = ({ question, answer, expanded, toggleExpanded }) => {
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
            "hover:text-white",
            { "text-white": expanded }
          )}
          onClick={toggleExpanded}
        >
          <span className="flex items-center">
            <svg
              className="w-5 h-5 mr-2 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              ></path>
            </svg>
            {question}
          </span>
          <svg
            className={cx("w-6", "h-6", "shrink-0", { "rotate-180": expanded })}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </h2>
      <div className={cx({ hidden: !expanded })}>
        <div className="px-5 py-5">
          <div className="mb-2 text-gray-400 text-lg">{answer}</div>
        </div>
      </div>
    </div>
  );
};

export default FaqSection;
