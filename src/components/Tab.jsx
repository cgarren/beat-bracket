import React from "react";
import cx from "classnames";

const Tab = ({ text, activeTab, id, setActiveTab }) => {
  return (
    <button
      title={`${text} tab`}
      className={cx(
        "py-4 px-6 block bg-transparent hover:bg-transparent hover:text-blue-700 hover:border-blue-700 focus:outline-none border-b-2 border-x-0 border-t-0 rounded-none font-medium",
        { "text-blue-700 border-blue-700": activeTab === id },
        { "text-gray-600 border-transparent": activeTab !== id }
      )}
      onClick={() => setActiveTab(id)}
    >
      {text}
    </button>
  );
};

export default Tab;