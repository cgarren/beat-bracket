import React from "react";

const FAQSection = ({ question, answer }) => {
  return (
    <div className="mb-5">
      <h2 className="font-bold text-xl text-white">{question}</h2>
      <div className="text-lg text-zinc-300">{answer}</div>
    </div>
  );
};

export default FAQSection;
