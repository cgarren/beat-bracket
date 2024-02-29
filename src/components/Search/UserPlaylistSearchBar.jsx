import React, { useCallback } from "react";
import SearchBar from "./SearchBar";
import { getArt } from "../../utils/spotify";

export default function UserPlaylistSearchBar({ allPlaylists, setPlaylist }) {
  const searchSuggestions = useCallback(
    async (searchText) => {
      const templist = [];
      allPlaylists.forEach(async (playlist) => {
        if (playlist.name.toLowerCase().includes(searchText.toLowerCase())) {
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
    },
    [allPlaylists, setPlaylist],
  );

  return allPlaylists.length > 0 ? (
    <SearchBar searchSuggestions={searchSuggestions} disabled={false} placeholder="Search for a playlist..." />
  ) : (
    <div className="">No playlists found. Add some to your Spotify library to get started.</div>
  );
}
