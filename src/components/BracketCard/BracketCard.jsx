import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "./Card";
import CardName from "./CardName";
import useBackend from "../../hooks/useBackend";
import useSpotify from "../../hooks/useSpotify";
import { LoginContext } from "../../context/LoginContext";
import RemoveBracketModal from "../Modals/RemoveBracketModal";

export default function BracketCard({ bracket }) {
  const [showModal, setShowModal] = useState(false);
  const { deleteBracket } = useBackend();
  const { getArtistImage, getPlaylistImage, openBracket } = useSpotify();
  const { loginInfo } = useContext(LoginContext);
  const queryClient = useQueryClient();
  const { data: cardImage, isPending: imageIsLoading } = useQuery({
    queryKey: ["art-large", { spotifyId: bracket?.songSource[bracket.songSource.type]?.id }],
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

  const { isPending, mutate: removeBracketMutation } = useMutation({
    mutationFn: async (bracketId) => {
      await deleteBracket(bracketId);
    },
    meta: {
      errorMessage: "Error deleting bracket",
      successMessage: "Bracket deleted successfully",
    },
    onSettled: async (data, error, bracketId) => {
      queryClient.invalidateQueries({ queryKey: ["brackets", { userId: loginInfo.userId }] });
      queryClient.invalidateQueries({
        queryKey: ["bracket", { bracketId: bracketId, userId: loginInfo.id }],
      });
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

  return (
    <>
      <RemoveBracketModal
        showModal={showModal}
        setShowModal={setShowModal}
        removeBracket={() => {
          setShowModal(false);
          removeBracketMutation(bracket.id);
        }}
        bracketName={name}
      />
      <div className={isPending ? "opacity-50" : ""}>
        <Card
          image={cardImage}
          imageLoading={imageIsLoading}
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
          removeFunc={() => setShowModal(true)}
          onClick={() => {
            openBracket(bracket.id, loginInfo.userId, !bracket.winner ? "fill" : "");
          }}
        />
      </div>
    </>
  );
}
