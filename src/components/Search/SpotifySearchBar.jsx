import React, { useCallback } from "react";
import useSpotify from "../../hooks/useSpotify";
import SearchBar from "./SearchBar";

export default function SpotifySearchBar({ type, setFunc, disabled }) {
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

  const { search, getArt } = useSpotify();

  const searchSuggestions = useCallback(
    async (searchText) => {
      const pluralIdentifier = `${type}s`;
      if (searchText.trim() !== "") {
        const result = await search(searchText, type, 5);
        if (result[pluralIdentifier].items.length > 0) {
          const templist = [];
          result[pluralIdentifier].items.forEach(async (item) => {
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
        }
        return [];
      }
      return [];
    },
    [search, getArt, type, setFunc],
  );

  return <SearchBar searchSuggestions={searchSuggestions} disabled={disabled} placeholder={placeholder} />;
}
