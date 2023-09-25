import React, { useState } from "react";
import BracketCard from "./BracketCard";
import createBracketPic from "../../assets/images/createBracket.png";
import { CreateBracketModal } from "./CreateBracketModal";

const CreateBracketCard = ({ userId }) => {
    const [showModal, setShowModal] = useState(false);
    return (
        <div>
            <BracketCard
                image={createBracketPic}
                imageAlt="Plus sign"
                cardText={"Create Bracket"}
                onClick={() => {
                    setShowModal(true);
                }}
            />
            <CreateBracketModal
                showModal={showModal}
                userId={userId}
                setShowModal={setShowModal}
            />
        </div>
    );
};

export default CreateBracketCard;
