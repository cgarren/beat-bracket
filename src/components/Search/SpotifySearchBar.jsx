import React from "react";
import { loadSpotifyRequest } from "../../utilities/spotify";
import SearchBar from "./SearchBar";
import { getArt } from "../../utilities/spotify";

const SpotifySearchBar = ({ type, setFunc, disabled }) => {
    const placeholder = (() => {
        switch (type) {
            case "artist":
                return "Search for an artist...";
            case "album":
                return "Search for an album...";
            case "track":
                return "Search for a track...";
            case "playlist":
                return "Search for a playlist...";
            default:
                return "Search...";
        }
    })();

    async function searchSuggestions(searchText) {
        const pluralIdentifier = type + "s";
        if (searchText.trim() !== "") {
            var params = { q: searchText, type: type, limit: 5 };
            var url =
                "https://api.spotify.com/v1/search/?" +
                new URLSearchParams(params).toString();
            let response = await loadSpotifyRequest(url);

            if (response !== 1 && response[pluralIdentifier].items.length > 0) {
                let templist = [];
                response[pluralIdentifier].items.forEach(async (item) => {
                    const art = await getArt(item.images, type);
                    if (item.images.length > 0) {
                        templist.push({
                            name: item.name,
                            art: art,
                            id: item.id,
                            onClick: () => {
                                setFunc({
                                    name: item.name,
                                    id: item.id,
                                    art: art,
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
