import React from "react";
import Badge from "../Badge";

export default function TrackNumber({ trackNumber }) {
    const colorMapping = {
        8: {
            backgroundColor: "bg-green-200",
            textColor: "text-black",
        },
        16: {
            backgroundColor: "bg-blue-200",
            textColor: "text-black",
        },
        32: {
            backgroundColor: "bg-yellow-200",
            textColor: "text-black",
        },
        64: {
            backgroundColor: "bg-orange-200",
            textColor: "text-black",
        },
        128: {
            backgroundColor: "bg-red-200",
            textColor: "text-black",
        },
        256: {
            backgroundColor: "bg-purple-200",
            textColor: "text-black",
        },
    };
    return (
        <Badge
            text={`${trackNumber}`}
            backgroundColor={
                colorMapping[trackNumber]
                    ? colorMapping[trackNumber].backgroundColor
                    : "bg-gray-100"
            }
            textColor={
                colorMapping[trackNumber]
                    ? colorMapping[trackNumber].textColor
                    : "text-gray-800"
            }
        />
    );
}
