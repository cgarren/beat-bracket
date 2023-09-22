import React from "react";
import Badge from "../Badge";

export default function TrackNumber({ trackNumber }) {
    return (
        <Badge
            text={`${trackNumber} tracks`}
            customStyles={"border border-gray-800"}
            textColor={"text-black"}
        />
    );
}
