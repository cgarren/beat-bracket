import React, { useState, useEffect } from "react";
import ArtistSuggestionList from "./ArtistSuggestionList";
import { loadRequest } from "../utilities/helpers";

import { barStyle } from "./SearchBar.module.css";

const SearchBar = ({ setArtist }) => {
  const [searchText, setSearchText] = useState("");
  const [artistSuggestionList, setArtistSuggestionList] = useState([]);

  async function searchSuggestions() {
    if (searchText.trim() !== "") {
      var params = { q: searchText, type: "artist", limit: 5 };
      var url =
        "https://api.spotify.com/v1/search/?" +
        new URLSearchParams(params).toString();
      let response = await loadRequest(url);
      //console.log(response);
      if (!response["error"] && response.artists.items.length > 0) {
        let templist = [];
        response.artists.items.map((item) => {
          if (item.images.length > 0) {
            templist.push({
              name: item.name,
              art: item.images[2].url,
              id: item.id,
              onClick: () => {
                setArtist({ name: item.name, id: item.id });
                setSearchText("");
              },
            });
          }
        });
        setArtistSuggestionList(templist);
      } else {
        console.log("no results for search");
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
    <div>
      <input
        placeholder="Search for an artist..."
        aria-label="Search for an artist..."
        size="lg"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className={barStyle}
      />
      <ArtistSuggestionList artistList={artistSuggestionList} />
    </div>
  );
};

export default SearchBar;
