import React, { useCallback } from "react";
import Modal from "../Modal";
import SearchBar from "../Search/SearchBar";

export default function ReplaceTrackModal({ replacementTracks, handleReplacement, setShow, showSongInfo }) {
  const searchSuggestions = useCallback(
    async (searchText) => {
      const templist = [];
      replacementTracks.forEach((track) => {
        if (track.name.toLowerCase().includes(searchText.toLowerCase())) {
          templist.push({
            name: `${track.name}${showSongInfo ? ` by ${track.artist}` : ""}`,
            art: track.art,
            id: track.id,
            onClick: () => {
              handleReplacement(track);
              setShow(false);
            },
          });
        }
      });
      return templist;
    },
    [handleReplacement, replacementTracks, setShow, showSongInfo],
  );

  return (
    <Modal
      onClose={() => {
        setShow(false);
      }}
    >
      <h1 className="font-bold text-xl mb-2">Select a replacement track:</h1>
      <SearchBar searchSuggestions={searchSuggestions} disabled={false} placeholder="Search for a track..." />
    </Modal>
  );
}
