import React from "react";

export default function ExpandedDetails({ question, answer, onClickHandler }) {
  return (
    // <div className="mb-5">
    //   <h2 className="font-bold text-xl text-white">{question}</h2>
    //   <div className="text-lg text-zinc-300">{answer}</div>
    // </div>
    <div className="w-fit mx-auto">
      <details className="rounded-lg open:bg-white open:p-3 open:ring-black/5 open:ring-1 open:shadow-lg">
        <summary
          onClick={onClickHandler}
          className="text-sm leading-6 text-black font-semibold select-none cursor-pointer"
        >
          {question}
        </summary>
        <div className="text-sm leading-6 text-black">
          <div>{answer}</div>
        </div>
      </details>
    </div>
  );
}
