import React from "react";

const LoadingIndicator = ({ hidden, loadingText }) => {
  return (
    <div className="font-bold" hidden={hidden}>
      {loadingText}
    </div>
  );
};

export default LoadingIndicator;
