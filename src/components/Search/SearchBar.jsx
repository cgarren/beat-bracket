import React, { useState, useEffect } from "react";
import Suggestion from "./Suggestion";
import { loadSpotifyRequest } from "../../utilities/spotify";

const SearchBar = ({ setArtist, disabled }) => {
  const [searchText, setSearchText] = useState("");
  const [artistSuggestionList, setArtistSuggestionList] = useState([]);

  async function searchSuggestions() {
    if (searchText.trim() !== "") {
      var params = { q: searchText, type: "artist", limit: 5 };
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
                setArtist({
                  name: item.name,
                  id: item.id,
                  art: item.images[2].url,
                });
                setSearchText("");
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

  useEffect(() => {
    document.getElementById("searchbar").addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (document.getElementById("artist-list").children.length > 0) {
          document.getElementById("artist-list").firstChild.focus();
        }
      }
    });
    document.getElementById("artist-list").addEventListener("keydown", (e) => {
      if (document.getElementById("artist-list").children.length > 0) {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          e.stopPropagation();
          if (
            document.activeElement ===
            document.getElementById("artist-list").firstChild
          ) {
            document.getElementById("searchbar").focus();
          } else if (
            document
              .getElementById("artist-list")
              .contains(document.activeElement)
          ) {
            document.activeElement.previousSibling.focus();
          }
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          e.stopPropagation();
          if (
            document
              .getElementById("artist-list")
              .contains(document.activeElement) &&
            document.activeElement.nextSibling
          ) {
            document.activeElement.nextSibling.focus();
          }
        }
      }
    });
  }, []);

  // $("#myDropdown, .dropbtn").on("keydown", function (e) {
  //   if (e.which == 40) {
  //     //down
  //     pos = pos == maxpos ? 0 : pos + 1;
  //     $("#myDropdown a").eq(pos).trigger("focus");
  //   }
  //   if (e.which == 38) {
  //     //up
  //     pos = pos == 0 ? maxpos : pos - 1;
  //     $("#myDropdown a").eq(pos).trigger("focus");
  //   }
  //   return false; //cancel scrolling
  // });

  return (
    // <div className="mb-2 max-w-[800px] min-w-[25%] flex flex-col">
    <div className="inline-flex flex-col justify-items-center mb-2 place-items-center border-black border-0 rounded-md ">
      <input
        placeholder="Search for an artist..."
        aria-label="Search for an artist..."
        size="search"
        id="searchbar"
        type="search"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        autoFocus={true}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className={
          "text-black text-2xl font-bar w-full p-1 border-2 border-gray-500 rounded focus:z-10 pl-3 mousetrap focus-visible:outline-none focus-visible:border-blue-500 focus-visible:border-1"
        }
        disabled={disabled}
      />
      <div
        id="artist-list"
        className="m-0 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded"
      >
        {artistSuggestionList.map((item) => {
          return (
            <Suggestion
              artistName={item.name}
              art={item.art}
              onClick={item.onClick}
              key={item.id}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SearchBar;
