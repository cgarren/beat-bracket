import React from "react";
import SearchBar from "../Search/SearchBar";
import { getArt } from "../../utilities/spotify";
import LoadingIndicator from "../LoadingIndicator";

const UserPlaylistSearchBar = ({ allPlaylists, setPlaylist }) => {
    async function searchSuggestions(searchText) {
        let templist = [];
        allPlaylists.forEach(async (playlist) => {
            if (
                playlist.name.toLowerCase().includes(searchText.toLowerCase())
            ) {
                templist.push({
                    name: playlist.name,
                    art: await getArt(playlist.images, "playlist"),
                    id: playlist.id,
                    onClick: () => {
                        setPlaylist(playlist);
                    },
                });
            }
        });
        return templist;
    }

    return allPlaylists.length > 0 ? (
        <SearchBar
            searchSuggestions={searchSuggestions}
            disabled={false}
            placeholder="Search for a playlist..."
        />
    ) : (
        <div className="">
            <LoadingIndicator /> Loading Playlists...
        </div>
    );
};

export default UserPlaylistSearchBar;
