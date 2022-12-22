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
    <BracketCard
      image={createBracketPic}
      cardText={"Create Bracket"}
      onClick={createNewBracket}
    >
      {showSearchBar ? <SearchBar setArtist={setArtist} /> : null}
    </BracketCard>
  );
};

export default CreateBracketCard;
