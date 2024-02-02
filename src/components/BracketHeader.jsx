import React from "react";
import DuplicateIcon from "../assets/svgs/duplicateIcon.svg";
import TrackNumber from "./BracketCard/TrackNumber";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export default function BracketHeader({ songSource, owner, template, bracketTracks }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex flex-col gap-0 items-center justify-center max-w-[90%]">
        <div className="flex flex-row text-xl items-center justify-center gap-1 max-w-full">
          <h1 className="truncate w-auto font-bold">
            {Boolean(songSource?.type === "artist") ? songSource.artist.name : null}
            {Boolean(songSource?.type === "playlist") ? songSource.playlist.name : null}
          </h1>
          {Boolean(bracketTracks?.length) && <TrackNumber numTracks={bracketTracks.length} />}
          {Boolean(template?.ownerId !== owner?.id && template?.ownerUsername) && (
            <Popover>
              <PopoverTrigger asChild>
                <span
                  title="Created from a template by another user"
                  className="text-blue-600 text-xs font-medium inline-flex rounded-md cursor-pointer"
                >
                  <DuplicateIcon />
                </span>
              </PopoverTrigger>
              <PopoverContent className="text-sm w-fit" side="right">
                Created from a template by {template.ownerUsername}
              </PopoverContent>
            </Popover>
          )}
        </div>
        {owner?.name && <h2 className="text-md">by {owner.name}</h2>}
        {/* {template?.ownerId !== owner?.id && template?.ownerUsername && (
          <h3 className="text-sm">{`Created from a template by ${template.ownerUsername}`}</h3>
        )} */}
      </div>
    </div>
  );
}
