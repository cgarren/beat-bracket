import React from "react";
import LoadingIndicator from "../LoadingIndicator";
import CornerButton from "./CornerButton";
import { Card as UICard } from "../ui/card";
import { Button } from "../ui/button";

export default function Card({
  children,
  image,
  imageLoading,
  imageAlt,
  cardText,
  onClick = () => {},
  removeFunc = null,
  badge = null,
}) {
  return (
    <div className="relative h-full">
      {removeFunc && image ? <CornerButton removeFunc={removeFunc} /> : null}
      {badge && <div className="absolute top-2 left-2 z-10">{badge}</div>}
      <UICard className="text-center bg-white shadow-lg h-full">
        <Button onClick={onClick} disabled={imageLoading} variant="ghost" className="h-full flex-col p-3">
          {/* <button className="text-center p-3 bg-white" onClick={onClick} disabled={imageLoading} type="button"> */}
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
        </Button>
      </UICard>
      {/* </button> */}
    </div>
  );
}
