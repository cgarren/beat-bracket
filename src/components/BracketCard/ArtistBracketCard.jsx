import React, { useState } from "react";
import BracketCard from "./BracketCard";
import CardName from "./CardName";
import { openBracket } from "../../utilities/helpers";
import { deleteBracket } from "../../utilities/backend";
import { loadSpotifyRequest } from "../../utilities/spotify";

const ArtistBracketCard = ({ bracket, userId }) => {
  const [cardImage, setCardImage] = useState(null);

  React.useEffect(() => {
    if (bracket.artistId) {
      getArtistImage().then((image) => {
        setCardImage(image);
      });
    }
  }, [bracket]);

  async function getArtistImage() {
    const url = "https://api.spotify.com/v1/artists/" + bracket.artistId;
    const response = await loadSpotifyRequest(url);
    if (response === 1) {
      return null;
    }
    return response.images[0].url;
  }

  async function removeBracket() {
    if (
      window.confirm(
        `Are you sure you want to permanently delete this ${bracket.artistName} bracket?`
      )
    ) {
      console.log("removing bracket");
      if ((await deleteBracket(bracket.id, userId)) === 0) {
        window.location.reload();
      } else {
        //show error removing bracket alert
      }
    }
  }

  return (
    <BracketCard
      image={cardImage}
      cardText={
        bracket.artistId ? <CardName bracket={bracket} /> : "Loading..."
      }
      removeFunc={removeBracket}
      onClick={() => {
        openBracket(bracket.id, userId);
      }}
    />
  );
};

export default ArtistBracketCard;
