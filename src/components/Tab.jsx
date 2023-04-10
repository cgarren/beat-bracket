import React from "react";

const Tab = ({ text, activeTab, id, setActiveTab }) => {
  return (
    <button
      title={`${text} tab`}
      className={
        "py-4 px-6 block bg-transparent hover:bg-transparent border-transparent hover:text-blue-700 hover:border-blue-700 focus:outline-none border-b-2 border-x-0 border-t-0 rounded-none font-medium " +
        (activeTab === id ? "text-blue-700 border-blue-700" : "text-gray-600")
      }
      onClick={() => setActiveTab(id)}
    >
      {text}
    </button>
  );
};

export default Tab;
