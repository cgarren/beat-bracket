import React, { useState } from "react";
import { loadRequest } from "../utilities/helpers";
import BracketCard from "./BracketCard";
import { openBracket } from "../utilities/helpers";

const ArtistBracketCard = ({ bracket }) => {
  const [cardImage, setCardImage] = useState(null);
  const [cardName, setCardName] = useState("");

  React.useEffect(() => {
    if (bracket.artistId) {
      setCardName(makeCardName());
      getArtistImage().then((image) => {
        setCardImage(image);
      });
    }
  }, [bracket]);

  async function getArtistImage() {
    const url = "https://api.spotify.com/v1/artists/" + bracket.artistId;
    console.log(url);
    const response = await loadRequest(url);
    return response.images[0].url;
  }

  function makeCardName() {
    return (
      <div className="inline-flex gap-0.5">
        <span>
          {bracket.artistName
            ? bracket.artistName + " (" + bracket.tracks + " tracks)"
            : "Getting brackets..."}
        </span>
        {bracket.complete ? (
          <span className="text-green-600 text-xs font-medium inline-flex items-center px-0.5 py-0.5 rounded-md">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </span>
        ) : (
          <div></div>
        )}
      </div>
    );
  }

  return (
    <BracketCard
      image={cardImage}
      cardText={cardName}
      onClick={() => {
        openBracket(bracket.id);
      }}
    />
  );
};

export default ArtistBracketCard;
