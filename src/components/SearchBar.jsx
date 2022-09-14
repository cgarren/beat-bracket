import React, { useState, useEffect } from "react";
import ArtistSuggestion from "./ArtistSuggestion";
import { loadRequest } from "../utilities/helpers";

const SearchBar = ({ setArtist, noChanges, disabled }) => {
  const [searchText, setSearchText] = useState("");
  const [artistSuggestionList, setArtistSuggestionList] = useState([]);

  async function searchSuggestions() {
    if (searchText.trim() !== "") {
      var params = { q: searchText, type: "artist", limit: 5 };
      var url =
        "https://api.spotify.com/v1/search/?" +
        new URLSearchParams(params).toString();
      let response = await loadRequest(url);

      if (!response["error"] && response.artists.items.length > 0) {
        let templist = [];
        response.artists.items.forEach((item) => {
          if (item.images.length > 0) {
            templist.push({
              name: item.name,
              art: item.images[2].url,
              id: item.id,
              onClick: () => {
                if (noChanges()) {
                  setArtist({
                    name: item.name,
                    id: item.id,
                    art: item.images[2].url,
                  });
                  setSearchText("");
                }
              },
            });
          }
        });
        setArtistSuggestionList(templist);
      } else {
        setArtistSuggestionList([]);
      }
    } else {
      setArtistSuggestionList([]);
    }
  }

  useEffect(() => {
    searchSuggestions();
    //console.log(searchText);
  }, [searchText]);

  return (
    // <div className="mb-2 max-w-[800px] min-w-[25%] flex flex-col">
    <div className="inline-flex flex-col justify-items-center mb-2 place-items-center min-w-[800px]">
      <input
        placeholder="Search for an artist..."
        aria-label="Search for an artist..."
        size="search"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className={
          "text-black text-2xl font-bar w-full p-1 border-0 rounded focus:z-10 pl-3 mousetrap"
        }
        disabled={disabled}
      />
      <ul className="m-0 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded">
        {artistSuggestionList.map((item) => {
          return (
            <ArtistSuggestion
              artistName={item.name}
              art={item.art}
              onClick={item.onClick}
              key={item.id}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default SearchBar;
