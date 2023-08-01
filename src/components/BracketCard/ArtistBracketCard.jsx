import React, { useState, useEffect } from "react";
import BracketCard from "./BracketCard";
import CardName from "./CardName";
import { openBracket } from "../../utilities/helpers";
import { deleteBracket } from "../../utilities/backend";
import { loadSpotifyRequest } from "../../utilities/spotify";

const ArtistBracketCard = ({ bracket, userId }) => {
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
        if (response === 1 || response.images.length === 0) {
            return null;
        }
        return response.images[0].url;
    }

    async function getPlaylistImage(playlistId) {
        const url = "https://api.spotify.com/v1/playlists/" + playlistId;
        const response = await loadSpotifyRequest(url);
        if (response === 1 || response.images.length === 0) {
            return null;
        }
        return response.images[0].url;
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
        <BracketCard
            image={cardImage}
            imageAlt={`${name} bracket`}
            cardText={
                <CardName
                    name={name}
                    tracks={bracket.tracks}
                    completed={bracket.completed || bracket.winner}
                />
            }
            removeFunc={removeBracket}
            onClick={() => {
                openBracket(bracket.id, userId);
            }}
        />
    );
};

export default ArtistBracketCard;
