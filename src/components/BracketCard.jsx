import React, { useState } from "react";
import LoadingIndicator from "./LoadingIndicator";

const BracketCard = ({ image, cardText, onClick = () => {} }) => {
  return (
    <button
      className="text-center p-3"
      onClick={onClick}
      disabled={image ? false : true}
    >
      <div className="rounded-lg w-[320px] h-[320px]">
        {image ? (
          <img src={image} className="" />
        ) : (
          <LoadingIndicator loadingText="" hidden={false} />
        )}
      </div>
      <div className="">{cardText}</div>
    </button>
  );
};

export default BracketCard;
