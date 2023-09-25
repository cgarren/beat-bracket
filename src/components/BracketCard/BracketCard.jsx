import React, { useState, useEffect } from "react";
import Card from "./Card";
import CardName from "./CardName";
import { openBracket } from "../../utilities/helpers";
import { deleteBracket } from "../../utilities/backend";
import { getArt, loadSpotifyRequest } from "../../utilities/spotify";

export default function BracketCard({ bracket, userId }) {
    const [cardImage, setCardImage] = useState(null);
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
    }, [bracket]);

    async function getArtistImage(artistId) {
        const url = "https://api.spotify.com/v1/artists/" + artistId;
        const response = await loadSpotifyRequest(url);
        return getArt(response.images, "artist", true);
    }

    async function getPlaylistImage(playlistId) {
        const url = "https://api.spotify.com/v1/playlists/" + playlistId;
        const response = await loadSpotifyRequest(url);
        return getArt(response.images, "playlist", true);
    }

    async function removeBracket() {
        if (
            window.confirm(
                `Are you sure you want to permanently delete this ${name} bracket?`
            )
        ) {
            console.log("removing bracket");
            if ((await deleteBracket(bracket.id, userId)) === 0) {
                window.location.reload();
            } else {
                //show error removing bracket alert
            }
        }
    }

    return (
        <Card
            image={cardImage}
            imageAlt={`${name} bracket`}
            cardText={
                <CardName
                    name={name}
                    trackNumber={
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
