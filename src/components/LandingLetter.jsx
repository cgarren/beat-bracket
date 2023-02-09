import React from "react";

export default function LandingLetter({ letter, animation }) {
  return (
    <div
      className={
        "inline-block mb-0.5 font-bold font-display text-8xl text-black " +
        (animation ? animation : "")
      }
    >
      {letter}
    </div>
  );
}
