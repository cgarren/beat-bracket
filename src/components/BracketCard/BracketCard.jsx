import React, { useState, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Card from "./Card";
import CardName from "./CardName";
import { getArtistImage, getPlaylistImage } from "../../utils/spotify";
import { UserInfoContext } from "../../context/UserInfoContext";
import RemoveBracketModal from "../Modals/RemoveBracketModal";
import { openBracket } from "../../utils/impureHelpers";
import { deleteBracket } from "../../utils/backend";

export default function BracketCard({ bracket }) {
  const [showModal, setShowModal] = useState(false);
  const userInfo = useContext(UserInfoContext);
  const queryClient = useQueryClient();
  const { data: cardImage, isPending: imageIsLoading } = useQuery({
    queryKey: ["spotify", "art-large", { spotifyId: bracket?.songSource[bracket.songSource.type]?.id }],
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
      queryClient.invalidateQueries({ queryKey: ["backend", "brackets", { userId: userInfo.id }] });
      queryClient.invalidateQueries({
        queryKey: ["backend", "bracket", { bracketId: bracketId, userId: userInfo.id }],
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
            openBracket(bracket.id, userInfo.id, !bracket.winner ? "fill" : "");
          }}
        />
      </div>
    </>
  );
}
