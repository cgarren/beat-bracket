import React from "react";
import Badge from "../Badge";

export default function TrackNumber({ numTracks }) {
    return (
        <Badge
            text={`${numTracks} tracks`}
            customStyles={"border border-gray-800 whitespace-nowrap"}
            textColor={"text-black"}
        />
    );
}
