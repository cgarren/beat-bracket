import React from "react";

const FAQSection = ({ question, answer }) => {
  return (
    <div className="mb-5">
      <h1 className="font-bold text-xl text-white">{question}</h1>
      <p className="text-lg text-zinc-300">{answer}</p>
    </div>
  );
};

export default FAQSection;
