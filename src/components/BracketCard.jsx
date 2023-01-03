import React from "react";
import LoadingIndicator from "./LoadingIndicator";

const BracketCard = ({
  children,
  image,
  cardText,
  onClick = () => {},
  removeFunc = null,
}) => {
  return (
    <div className="relative">
      {removeFunc && image ? (
        <button
          onClick={removeFunc}
          className="border-0 p-0 w-[30px] h-[30px] bg-white text-black absolute -top-2 -right-2 rounded-full"
        >
          {"✕"}
        </button>
      ) : null}
      <button
        className="text-center p-3"
        onClick={onClick}
        disabled={image ? false : true}
      >
        <div className="rounded-lg w-[320px] h-[320px]">
          {image ? (
            <img
              src={image}
              className="w-[320px] h-[320px]"
              width="320px"
              height="320px"
              alt={cardText}
            />
          ) : (
            <LoadingIndicator loadingText="" hidden={false} />
          )}
        </div>
        {children}
        <div className="">{cardText}</div>
      </button>
    </div>
  );
};

export default BracketCard;
