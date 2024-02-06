import React, { useContext, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery } from "@tanstack/react-query";
import mixpanel from "mixpanel-browser";
import ArtistSearchBar from "../Search/ArtistSearchBar";
import UserPlaylistSearchBar from "../Search/UserPlaylistSearchBar";
import useSongProcessing from "../../hooks/useSongProcessing";
import { LoginContext } from "../../context/LoginContext";
import useSpotify from "../../hooks/useSpotify";
import LoadingIndicator from "../LoadingIndicator";
import { Tabs, TabsTrigger, TabsList, TabsContent } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
// import Badge from "../Badge";

export default function CreateBracketModal({ showModal, setShowModal }) {
  const { loginInfo } = useContext(LoginContext);
  const { openBracket } = useSpotify();
  const { loadPlaylists } = useSongProcessing();
  const {
    data: userPlaylists,
    isPending,
    isSuccess,
    isError,
  } = useQuery({
    queryKey: ["playlists", { userId: loginInfo.userId }],
    queryFn: () => loadPlaylists("https://api.spotify.com/v1/me/playlists?limit=50"),
    staleTime: 1000 * 60 * 60, // 1 hour
    meta: {
      errorMessage: "Error loading playlists",
    },
  });

  const createBracket = useCallback(
    (state) => {
      if (state) {
        // Generate unique id for new bracket
        const uuid = uuidv4();
        console.debug(`Creating new bracket with id: ${uuid}`);
        openBracket(uuid, loginInfo.userId, "create", state);
      }
    },
    [loginInfo.userId, openBracket],
  );

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Bracket</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <Tabs
            defaultValue="artist"
            onValueChange={(value) => {
              // const searchbar = document.getElementById("searchbar");
              // if (searchbar) searchbar.focus();
              if (value === "topMusic") mixpanel.track("Click", { item: "TopMusicTab" });
            }}
          >
            <TabsList className="mb-0">
              <TabsTrigger value="artist">Artist</TabsTrigger>
              <TabsTrigger value="playlist">Playlist</TabsTrigger>
              {/* <TabsTrigger value="topMusic">Your top music</TabsTrigger> */}
            </TabsList>
            <Separator className="my-3" />
            <TabsContent value="artist">
              <ArtistSearchBar
                id="searchbar"
                setArtist={(artist) => {
                  createBracket({ type: "artist", artist: artist });
                }}
              />
            </TabsContent>
            <TabsContent value="playlist">
              {isError && <div className="mt-2">The was a problem loading your playlists!</div>}
              {isPending && (
                <div className="mt-2">
                  <LoadingIndicator />
                  Loading playlists...
                </div>
              )}
              {isSuccess && (
                <UserPlaylistSearchBar
                  id="searchbar"
                  setPlaylist={(playlist) => {
                    console.debug("Selected playlist:", playlist);
                    createBracket({ type: "playlist", playlist: playlist });
                  }}
                  allPlaylists={userPlaylists}
                />
              )}
            </TabsContent>
            <TabsContent value="topMusic">
              <div className="mt-2">
                <p>Coming soon!</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
