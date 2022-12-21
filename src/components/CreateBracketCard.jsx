import React from "react";
import BracketCard from "./BracketCard";
import createBracketPic from "../assets/images/createBracket.png";
import { v4 as uuidv4 } from "uuid";
import { navigate } from "gatsby";

const CreateBracketCard = ({}) => {
  function createNewBracket() {
    // Generate unique id for new bracket
    const uuid = uuidv4();
    console.log("Create New Bracket with id: " + uuid);

    // Open the bracket editor and pass the unique id off
    navigate("/bracket/" + uuid);
  }

  return (
    <BracketCard
      image={createBracketPic}
      cardText={"Create Bracket"}
      onClick={createNewBracket}
    />
  );
};

export default CreateBracketCard;
