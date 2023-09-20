import React from "react";
import TrackNumber from "./TrackNumber";

export default function CardName({ name, trackNumber, completed }) {
    return (
        <div className="inline-flex gap-0.5">
            {completed ? (
                <span
                    title="Completed"
                    className="text-green-600 text-xs font-medium inline-flex items-center px-0.5 py-0.5 rounded-md"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                </span>
            ) : (
                <div></div>
            )}
            <span>
                {name ? (
                    <>
                        {name} <TrackNumber trackNumber={trackNumber} />
                    </>
                ) : (
                    "Getting brackets..."
                )}
            </span>
        </div>
    );
}
