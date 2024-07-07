import React, { useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import SearchBar from "../Search/SearchBar";
import defaultPlaylistImage from "../../assets/images/defaultPlaylistImage.png";

export default function ReplaceTrackModal({
  replacementTracks,
  handleReplacement,
  showModal,
  setShowModal,
  showSongInfo,
}) {
  const searchSuggestions = useCallback(
    async (searchText) => {
      const templist = [];
      replacementTracks.forEach((track, i) => {
        if (`${track.name} ${track.artist}`.toLowerCase().includes(searchText.toLowerCase())) {
          templist.push({
            name: `${track.name}${showSongInfo ? ` by ${track.artist}` : ""}`,
            art: track.art ?? defaultPlaylistImage,
            id: track?.id ?? i,
            onClick: () => {
              handleReplacement(track);
              setShowModal(false);
            },
          });
        }
      });
      return templist;
    },
    [handleReplacement, replacementTracks, setShowModal, showSongInfo],
  );

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select a replacement track</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <SearchBar searchSuggestions={searchSuggestions} disabled={false} placeholder="Search for a track..." />
        </div>
      </DialogContent>
    </Dialog>
  );
}
