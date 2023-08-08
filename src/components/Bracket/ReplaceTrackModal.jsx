import React from "react";
import Modal from "../Modal";
import SearchBar from "../Search/SearchBar";

const ReplaceTrackModal = ({
    replacementTracks,
    handleReplacement,
    setShow,
    showSongInfo,
}) => {
    async function searchSuggestions(searchText) {
        let templist = [];
        replacementTracks.forEach((track) => {
            if (track.name.toLowerCase().includes(searchText.toLowerCase())) {
                templist.push({
                    name: `${track.name}${
                        showSongInfo ? " by " + track.artist : ""
                    }`,
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
    }
    return (
        <Modal
            onClose={() => {
                setShow(false);
            }}
        >
            <h1 className="font-bold text-xl mb-2">
                Select a replacement track:
            </h1>
            <SearchBar
                searchSuggestions={searchSuggestions}
                disabled={false}
                placeholder="Search for a track..."
            />
        </Modal>
    );
};

export default ReplaceTrackModal;
