import React, { useState } from "react";
import FaqSection from "./FaqSection";
import questions from "./Questions";

export default function Faq({ path }) {
  const [expandedSection, setExpandedSection] = useState(path === "/" ? 0 : null);

  return (
    <div className="mx-4 text-left">
      {/* <h1 className="pt-5 pl-5 text-4xl text-white font-bold">FAQs</h1> */}
      {questions.map((question, index) => {
        for (let i = 0; i < question.paths.length; i += 1) {
          const regex = new RegExp(question.paths[i].replace("*", ".*"));
          if (regex.test(path)) {
            return (
              <FaqSection
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                question={question.question}
                answer={question.answer}
                expanded={expandedSection === index}
                toggleExpanded={() => {
                  setExpandedSection(expandedSection === index ? null : index);
                }}
              />
            );
          }
        }
        return null;
      })}
    </div>
  );
}
