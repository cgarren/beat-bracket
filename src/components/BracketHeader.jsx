import React from "react";
import DuplicateIcon from "../assets/svgs/duplicateIcon.svg";
import SecondChanceIcon from "../assets/svgs/secondChanceIcon.svg";
import TrackNumber from "./BracketCard/TrackNumber";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function BracketHeader({ songSource, owner, template, bracketTracks, isSecondChance }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex flex-col gap-0 items-center justify-center max-w-[90%]">
        <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
          <h1 className="truncate w-auto font-bold">
            {Boolean(songSource?.type === "artist") ? songSource.artist.name : null}
            {Boolean(songSource?.type === "playlist") ? songSource.playlist.name : null}
          </h1>
          {Boolean(bracketTracks?.length) && <TrackNumber numTracks={bracketTracks.length} />}
          {/* Icon to show that the bracket was created from a template */}
          {Boolean(template?.ownerId !== owner?.id && template?.ownerUsername) && (
            <Popover>
              <PopoverTrigger asChild>
                <span
                  title="Created from a template by another user"
                  className="text-blue-600 text-xs font-medium inline-flex rounded-md cursor-pointer w-4 h-4"
                >
                  <DuplicateIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent className="text-sm w-fit p-1.5 rounded-lg" side="top" align="center">
                Created from a template by {template.ownerUsername}
              </PopoverContent>
            </Popover>
          )}
          {/* Icon to show that the bracket was created using the second chance format */}
          {Boolean(isSecondChance) && (
            <Popover>
              <PopoverTrigger asChild>
                <span
                  title="Second Chance Bracket enabled"
                  className="text-blue-600 text-xs font-medium inline-flex rounded-md cursor-pointer w-4 h-4"
                >
                  <SecondChanceIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent className="text-sm w-fit p-1.5 rounded-lg" side="top" align="center">
                Second Chance Bracket enabled
              </PopoverContent>
            </Popover>
          )}
        </div>
        {owner?.name && <h2 className="text-md font-normal">by {owner.name}</h2>}
        {/* {template?.ownerId !== owner?.id && template?.ownerUsername && (
          <h3 className="text-sm">{`Created from a template by ${template.ownerUsername}`}</h3>
        )} */}
      </div>
    </div>
  );
}
