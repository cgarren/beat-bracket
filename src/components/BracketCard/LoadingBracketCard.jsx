import React from "react";
import Card from "./Card";

export default function LoadingBracketCard() {
  return (
    <Card
      imageRequest={{ isPending: true }}
      cardText={<span className="font-bold">Getting brackets...</span>}
      onClick={() => {}}
    />
  );
}
