import React, { useEffect, useContext, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "./Card";
import CardName from "./CardName";
import useBackend from "../../hooks/useBackend";
import useSpotify from "../../hooks/useSpotify";

export default function BracketCard({ bracket, userId }) {
  const { deleteBracket } = useBackend();
  const { getArtistImage, getPlaylistImage, openBracket } = useSpotify();
  const cardImage = useQuery({
    queryKey: ["bracketImage", { bracketId: bracket.id }],
    queryFn: () => {
      switch (bracket?.songSource?.type) {
        case "artist":
          return getArtistImage(bracket.songSource.artist.id);
        case "playlist":
          return getPlaylistImage(bracket.songSource.playlist.id);
        default:
          return null;
      }
    },
    staleTime: 3600000,
    meta: {
      errorMessage: "Error loading bracket image",
    },
  });

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

  const removeBracket = useCallback(async () => {
    if (window.confirm(`Are you sure you want to permanently delete this ${name} bracket?`)) {
      try {
        await deleteBracket(bracket.id, userId);
        window.location.reload();
      } catch (error) {
        if (error.cause && error.cause.code === 429) {
          // showAlert("Error deleting bracket. Please try again in a couple of minutes.", "error", false);
        } else if (error.message) {
          // showAlert(error.message, "error", false);
        } else {
          // showAlert("Unkown error deleting bracket", "error", false);
        }
      }
    }
  }, [bracket.id, deleteBracket, name, userId]);

  return (
    <Card
      imageRequest={cardImage}
      imageAlt={name}
      cardText={
        <CardName
          displayName={bracket.displayName}
          songSource={bracket.songSource}
          numTracks={bracket && bracket.tracks ? bracket.tracks.length : null}
          ownsTemplate={bracket.ownerId === bracket.templateOwnerId}
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
