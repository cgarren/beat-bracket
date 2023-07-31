import React from "react";
import Modal from "../Modal";
import SearchBar from "../Search/SearchBar";

const ReplaceTrackModal = ({
    replacementTracks,
    handleReplacement,
    setShow,
}) => {
    async function searchSuggestions(searchText) {
        let templist = [];
        replacementTracks.forEach((track) => {
            if (track.name.toLowerCase().includes(searchText.toLowerCase())) {
                templist.push({
                    name: track.name,
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
            <h1 className="font-bold text-xl">Select a replacement track:</h1>
            <SearchBar
                searchSuggestions={searchSuggestions}
                disabled={false}
                placeholder="Search for a track..."
            />
            {/* <div className="m-0 mt-1 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded max-h-[70vh] overflow-scroll">
                {replacementTracks.map((track) => {
                    return (
                        <Suggestion
                            name={`${track.name}`}
                            art={track.art}
                            key={track.id}
                            onClick={() => {
                                handleReplacement(track);
                                setShow(false);
                            }}
                        />
                    );
                })}
            </div> */}
        </Modal>
    );
};

export default ReplaceTrackModal;
