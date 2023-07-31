import React from "react";
import { loadSpotifyRequest } from "../../utilities/spotify";
import SearchBar from "./SearchBar";

const SpotifySearchBar = ({ type, setFunc, disabled }) => {
    console.log(type);
    const placeholder = (() => {
        switch (type) {
            case "artist":
                return "Search for an artist...";
            case "album":
                return "Search for an album...";
            case "track":
                return "Search for a track...";
            default:
                return "Search...";
        }
    })();
    async function searchSuggestions(searchText) {
        if (searchText.trim() !== "") {
            var params = { q: searchText, type: type, limit: 5 };
            var url =
                "https://api.spotify.com/v1/search/?" +
                new URLSearchParams(params).toString();
            let response = await loadSpotifyRequest(url);

            if (response !== 1 && response.artists.items.length > 0) {
                let templist = [];
                response.artists.items.forEach((item) => {
                    if (item.images.length > 0) {
                        templist.push({
                            name: item.name,
                            art: item.images[2].url,
                            id: item.id,
                            onClick: () => {
                                setFunc({
                                    name: item.name,
                                    id: item.id,
                                    art: item.images[2].url,
                                });
                            },
                        });
                    }
                });
                return templist;
            } else {
                return [];
            }
        } else {
            return [];
        }
    }

    return (
        <SearchBar
            searchSuggestions={searchSuggestions}
            disabled={disabled}
            placeholder={placeholder}
        />
    );
};

export default SpotifySearchBar;
