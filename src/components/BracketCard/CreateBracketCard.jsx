import React, { useState } from "react";
import Card from "./Card";
import createBracketPic from "../../assets/images/createBracket.png";
import CreateBracketModal from "../Modals/CreateBracketModal";

export default function CreateBracketCard() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div>
      <Card
        image={createBracketPic}
        imageAlt="Plus sign"
        cardText="Create Bracket"
        onClick={() => {
          setShowModal(true);
        }}
      />
      <CreateBracketModal showModal={showModal} setShowModal={setShowModal} />
    </div>
  );
}
