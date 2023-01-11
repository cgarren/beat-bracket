import React from "react";

const Tab = ({ text, activeTab, id, setActiveTab }) => {
  return (
    <button
      className={
        "text-gray-600 py-4 px-6 block bg-transparent hover:bg-transparent border-transparent hover:text-blue-500 hover:border-blue-500 focus:outline-none border-b-2 border-x-0 border-t-0 rounded-none font-medium " +
        (activeTab === id ? "text-blue-500 border-blue-500" : "")
      }
      onClick={() => setActiveTab(id)}
    >
      {text}
    </button>
  );
};

export default Tab;
