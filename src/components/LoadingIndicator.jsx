import React from "react";
import { loadingStyle } from "./LoadingIndicator.module.css";

const LoadingIndicator = ({ hidden, loadingText }) => {
  return (
    <div className={loadingStyle} hidden={hidden}>
      {loadingText}
    </div>
  );
};

export default LoadingIndicator;
