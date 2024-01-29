import React from "react";
import TrackNumber from "./BracketCard/TrackNumber";

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
        </div>
        {owner?.name && <h2 className="text-md">by {owner.name}</h2>}
        {template?.ownerId !== owner?.id && template?.ownerUsername && (
          <h3 className="text-sm">{`Created from a template by ${template.ownerUsername}`}</h3>
        )}
      </div>
    </div>
  );
}
