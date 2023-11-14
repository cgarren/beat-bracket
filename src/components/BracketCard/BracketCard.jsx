import React, { useState, useEffect, useContext } from "react";
import Card from "./Card";
import CardName from "./CardName";
import { useBackend } from "../../hooks/useBackend";
import { useSpotify } from "../../hooks/useSpotify";
import { LoginContext } from "../../context/LoginContext";

export default function BracketCard({ bracket, userId, showAlert }) {
    const { loggedIn } = useContext(LoginContext);
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
        async function getBracketImage() {
            if (bracket.songSource && bracket.songSource.type && loggedIn) {
                try {
                    let image;
                    switch (bracket.songSource.type) {
                        case "artist":
                            image = await getArtistImage(
                                bracket.songSource.artist.id
                            );
                            setCardImage(image);
                            break;
                        case "playlist":
                            image = await getPlaylistImage(
                                bracket.songSource.playlist.id
                            );
                            setCardImage(image);
                            break;
                        default:
                            break;
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        }
        getBracketImage();
    }, [bracket, getArtistImage, getPlaylistImage, loggedIn]);

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
