import React from "react";
import LoadingIndicator from "../LoadingIndicator";
import CornerButton from "./CornerButton";

export default function Card({ children, imageRequest, imageAlt, cardText, onClick = () => {}, removeFunc = null }) {
  return (
    <div className="relative">
      {removeFunc && imageRequest?.isSuccess ? <CornerButton removeFunc={removeFunc} /> : null}
      <button className="text-center p-3 bg-white" onClick={onClick} disabled={!imageRequest?.isSuccess} type="button">
        <div className="rounded-lg w-[320px] h-[320px]">
          {imageRequest?.isError && <div className="w-[320px] h-[320px] rounded-lg bg-gray-200">Error</div>}
          {imageRequest?.isPending && <LoadingIndicator loadingText="" hidden={false} />}
          {imageRequest?.data && (
            <img
              src={imageRequest?.data}
              className="w-[320px] h-[320px] rounded-lg"
              width="320px"
              height="320px"
              alt={imageAlt || "Bracket image"}
            />
          )}
        </div>
        {children}
        <div className="w-[320px] pt-1">{cardText}</div>
      </button>
    </div>
  );
}
