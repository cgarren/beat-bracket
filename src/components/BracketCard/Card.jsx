import React from "react";
import LoadingIndicator from "../LoadingIndicator";
import CornerButton from "./CornerButton";

export default function Card({
  children,
  image,
  imageLoading,
  imageAlt,
  cardText,
  onClick = () => {},
  removeFunc = null,
}) {
  return (
    <div className="relative">
      {removeFunc && image ? <CornerButton removeFunc={removeFunc} /> : null}
      <button className="text-center p-3 bg-white" onClick={onClick} disabled={imageLoading} type="button">
        <div className="rounded-lg w-[320px] h-[320px]">
          {!image && !imageLoading && <div className="w-[320px] h-[320px] rounded-lg bg-gray-200">Error</div>}
          {imageLoading && <LoadingIndicator loadingText="" hidden={false} />}
          {image && (
            <img
              src={image}
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
