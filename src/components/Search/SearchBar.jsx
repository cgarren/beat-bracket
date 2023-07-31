import React, { useState, useEffect } from "react";
import Suggestion from "./Suggestion";

const SearchBar = ({ searchSuggestions, disabled, placeholder }) => {
    const [searchText, setSearchText] = useState("");
    const [suggestionList, setSuggestionList] = useState([]);

    useEffect(() => {
        let active = true;
        load();
        return () => {
            active = false;
        };

        async function load() {
            //setSuggestionList([]); // this is optional to clear the list when the user updates the search text
            // CONSDIER adding a loading indicator here
            const res = await searchSuggestions(searchText);
            if (!active) {
                return;
            }
            setSuggestionList(res);
        }
    }, [searchText]);

    useEffect(() => {
        document
            .getElementById("searchbar")
            .addEventListener("keydown", (e) => {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (
                        document.getElementById("suggestion-list").children
                            .length > 0
                    ) {
                        document
                            .getElementById("suggestion-list")
                            .firstChild.focus();
                    }
                }
            });
        document
            .getElementById("suggestion-list")
            .addEventListener("keydown", (e) => {
                if (
                    document.getElementById("suggestion-list").children.length >
                    0
                ) {
                    if (e.key === "ArrowUp") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                            document.activeElement ===
                            document.getElementById("suggestion-list")
                                .firstChild
                        ) {
                            document.getElementById("searchbar").focus();
                        } else if (
                            document
                                .getElementById("suggestion-list")
                                .contains(document.activeElement)
                        ) {
                            document.activeElement.previousSibling.focus();
                        }
                    } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                            document
                                .getElementById("suggestion-list")
                                .contains(document.activeElement) &&
                            document.activeElement.nextSibling
                        ) {
                            document.activeElement.nextSibling.focus();
                        }
                    }
                }
            });
    }, []);

    return (
        // <div className="mb-2 max-w-[800px] min-w-[25%] flex flex-col">
        <div className="inline-flex flex-col justify-items-center mb-2 place-items-center border-black border-0 rounded-md ">
            <input
                placeholder={placeholder}
                aria-label={placeholder}
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
                id="suggestion-list"
                // className="m-0 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded"
                className="m-0 mt-1 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded max-h-[70vh] overflow-scroll"
            >
                {suggestionList.map((item) => {
                    return (
                        <Suggestion
                            name={item.name}
                            art={item.art}
                            onClick={() => {
                                setSearchText("");
                                item.onClick();
                            }}
                            key={item.id}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default SearchBar;
