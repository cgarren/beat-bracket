import React, { useState, useEffect, forwardRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Suggestion from "./Suggestion";
import { Input } from "../ui/input";

export default forwardRef(({ searchSuggestions, disabled, placeholder, id = "searchbar" }, ref) => {
  const [searchText, setSearchText] = useState("");
  const {
    data: suggestionList,
    isError,
    isPending,
    isSuccess,
  } = useQuery({
    queryKey: ["spotify", "suggestions", { searchText: searchText }],
    queryFn: async () => {
      const mylist = await searchSuggestions(searchText);
      return mylist;
    },
    meta: {
      errorMessage: "Error loading suggestions",
    },
  });

  // useEffect(() => {
  //   let active = true;
  //   async function load() {
  //     // setSuggestionList([]); // this is optional to clear the list when the user updates the search text
  //     // CONSDIER adding a loading indicator here
  //     const res = await searchSuggestions(searchText);
  //     if (!active) {
  //       return;
  //     }
  //     setSuggestionList(res);
  //   }

  //   load();
  //   return () => {
  //     active = false;
  //   };
  // }, [searchText, searchSuggestions]);

  function searchBarListener(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (document.getElementById("suggestion-list").children.length > 0) {
        document.getElementById("suggestion-list").firstChild.focus();
      }
    }
  }

  function suggestionListListener(e) {
    if (document.getElementById("suggestion-list").children.length > 0) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        if (document.activeElement === document.getElementById("suggestion-list").firstChild) {
          document.getElementById(id).focus();
        } else if (document.getElementById("suggestion-list").contains(document.activeElement)) {
          document.activeElement.previousSibling.focus();
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        if (
          document.getElementById("suggestion-list").contains(document.activeElement) &&
          document.activeElement.nextSibling
        ) {
          document.activeElement.nextSibling.focus();
        }
      }
    }
  }

  useEffect(() => {
    document.getElementById(id).focus();
    document.getElementById(id).addEventListener("keydown", searchBarListener);
    document.getElementById("suggestion-list").addEventListener("keydown", suggestionListListener);
    return () => {
      if (id && document.getElementById(id)) {
        document.getElementById(id).removeEventListener("keydown", searchBarListener);
      }
      if (document.getElementById("suggestion-list")) {
        document.getElementById("suggestion-list").removeEventListener("keydown", suggestionListListener);
      }
    };
  }, [id]);

  return (
    // <div className="mb-2 max-w-[800px] min-w-[25%] flex flex-col">
    <div className="inline-flex flex-col justify-items-center mb-2 place-items-center border-black border-0 rounded-md max-w-[90%]">
      <div className="flex">
        <Input
          data-loading={isPending}
          className="text-2xl w-full p-1 border-2 border-gray-500 rounded focus:z-10 pl-3 mousetrap bg-[length:25px_25px] bg-[right_center] bg-no-repeat data-[loading=true]:bg-[url('https://i.gifer.com/ZKZg.gif')]"
          disabled={disabled}
          placeholder={placeholder}
          title={placeholder}
          value={searchText}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          id={id}
          ref={ref}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      {isError && <div className="text-md text-gray-600 mb-2 mt-2">Error loading search suggestions!</div>}
      {/* {isSuccess && suggestionList.length === 0 && (
        <div className="text-md text-gray-600 mb-2 mt-2">No suggestions found</div>
      )} */}

      <div
        id="suggestion-list"
        // className="m-0 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded"
        className="m-0 mt-1 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded max-h-[70vh] overflow-y-scroll"
      >
        {isSuccess &&
          suggestionList.map((item) => (
            <Suggestion
              name={item.name}
              art={item.art}
              onClick={() => {
                setSearchText("");
                item.onClick();
              }}
              key={item.id}
            />
          ))}
      </div>
    </div>
  );
});
