import React, { useState, useEffect } from "react";
import Card from "./Card";
import CardName from "./CardName";
import { useBackend } from "../../hooks/useBackend";
import { useSpotify } from "../../hooks/useSpotify";

export default function BracketCard({ bracket, userId, showAlert }) {
    const [cardImage, setCardImage] = useState(null);
    const { deleteBracket } = useBackend();
    const { getArtistImage, getPlaylistImage, openBracket } = useSpotify();
    const name = (() => {
        if (bracket.songSource && bracket.songSource.type) {
            switch (bracket.songSource.type) {
                case "artist":
                    return bracket.songSource.artist.name;
                case "playlist":
                    return bracket.songSource.playlist.name;
                default:
                    return "Something went wrong getting this bracket :(";
            }
        } else if (bracket.artistName) {
            return bracket.artistName;
        }
        return null;
    })();

    useEffect(() => {
        if (bracket.songSource && bracket.songSource.type) {
            switch (bracket.songSource.type) {
                case "artist":
                    getArtistImage(bracket.songSource.artist.id).then(
                        (image) => {
                            setCardImage(image);
                        }
                    );
                    break;
                case "playlist":
                    getPlaylistImage(bracket.songSource.playlist.id).then(
                        (image) => {
                            setCardImage(image);
                        }
                    );
                    break;
                default:
                    break;
            }
        } else if (bracket.artistId) {
            getArtistImage(bracket.artistId).then((image) => {
                setCardImage(image);
            });
        }
    }, [bracket, getArtistImage, getPlaylistImage]);

    async function removeBracket() {
        if (
            window.confirm(
                `Are you sure you want to permanently delete this ${name} bracket?`
            )
        ) {
            try {
                console.log("removing bracket");
                await deleteBracket(bracket.id, userId);
                window.location.reload();
            } catch (error) {
                if (error.cause && error.cause.code === 429) {
                    showAlert(
                        "Error deleting bracket. Please try again in a couple of minutes.",
                        "error",
                        false
                    );
                } else if (error.message) {
                    showAlert(error.message, "error", false);
                } else {
                    showAlert("Unkown error deleting bracket", "error", false);
                }
            }
        }
    }

    return (
        <Card
            image={cardImage}
            imageAlt={`${name} bracket`}
            cardText={
                <CardName
                    displayName={bracket.displayName}
                    songSource={bracket.songSource}
                    numTracks={
                        bracket && bracket.tracks ? bracket.tracks.length : null
                    }
                    completed={bracket.completed || bracket.winner}
                />
            }
            removeFunc={removeBracket}
            onClick={() => {
                openBracket(bracket.id, userId);
            }}
        />
    );
}
