import React from "react";

const BracketCard = ({ bracketName, image }) => {
  return (
    <div className="text-center">
      <div className="bg-white p-3 rounded-lg">
        <img src={image} width="700px" height="310px" />
      </div>
      <div>bracketName</div>
    </div>
  );
};

export default BracketCard;
