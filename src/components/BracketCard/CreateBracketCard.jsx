import React, { useEffect, useState } from "react";
import BracketCard from "./BracketCard";
import createBracketPic from "../../assets/images/createBracket.png";
import { v4 as uuidv4 } from "uuid";
import SearchBar from "../Search/SearchBar";
import { openBracket } from "../../utilities/helpers";
import Modal from "../Modal";

const CreateBracketCard = ({ userId }) => {
  const [showSearchBar, setShowSearchBar] = useState(false);

  function handleArtistChange(artist) {
    if (artist) {
      // Generate unique id for new bracket
      const uuid = uuidv4();
      console.log("Create New Bracket with id: " + uuid);
      openBracket(uuid, userId, { artist: artist });
    }
  }

  return (
    <div>
      <BracketCard
        image={createBracketPic}
        cardText={"Create Bracket"}
        onClick={() => {
          setShowSearchBar(true);
        }}
      ></BracketCard>
      {showSearchBar ? (
        <Modal onClose={() => setShowSearchBar(false)}>
          <SearchBar setArtist={handleArtistChange} />
        </Modal>
      ) : null}
    </div>
  );
};

export default CreateBracketCard;
