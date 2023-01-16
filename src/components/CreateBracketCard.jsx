import React, { useEffect, useState } from "react";
import BracketCard from "./BracketCard";
import createBracketPic from "../assets/images/createBracket.png";
import { v4 as uuidv4 } from "uuid";
import SearchBar from "./SearchBar";
import { openBracket } from "../utilities/helpers";

const CreateBracketCard = ({ userId }) => {
  const [artist, setArtist] = useState(undefined);
  const [showSearchBar, setShowSearchBar] = useState(false);
  function createNewBracket() {
    setShowSearchBar(true);
  }

  useEffect(() => {
    if (artist) {
      // Generate unique id for new bracket
      const uuid = uuidv4();
      console.log("Create New Bracket with id: " + uuid);
      openBracket(uuid, userId, { artist: artist });
    }
  }, [artist]);

  return (
    <div>
      <BracketCard
        image={createBracketPic}
        cardText={"Create Bracket"}
        onClick={createNewBracket}
      ></BracketCard>
      {/* <div className="absolute top-0 left-0">
        <SearchBar setArtist={setArtist} />
      </div> */}
      {showSearchBar ? (
        <div
          tabIndex="-1"
          className="fixed top-0 left-0 right-0 z-50 p-4 overflow-x-hidden overflow-y-auto inset-0 h-modal h-full bg-black bg-opacity-50"
        >
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-auto">
            <div className="relative bg-white rounded-lg shadow">
              <button
                type="button"
                className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
                onClick={() => setShowSearchBar(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-6 text-center">
                <SearchBar setArtist={setArtist} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default CreateBracketCard;