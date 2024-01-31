import React, { useState, useContext, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useQuery } from "@tanstack/react-query";
import { navigate } from "gatsby";
import ArtistSearchBar from "../Search/ArtistSearchBar";
import UserPlaylistSearchBar from "../Search/UserPlaylistSearchBar";
import Modal from "./Modal";
import Tab from "../Controls/Tab";
import useSongProcessing from "../../hooks/useSongProcessing";
import { LoginContext } from "../../context/LoginContext";
import useSpotify from "../../hooks/useSpotify";
import LoadingIndicator from "../LoadingIndicator";
import mixpanel from "mixpanel-browser";
// import Badge from "../Badge";

export default function CreateBracketModal({ showModal, setShowModal }) {
  const [activeTab, setActiveTab] = useState(0);
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
        // navigate(`/user/${loginInfo.userId}/bracket/${uuid}/create`, {
        //   state: state,
        // });
      }
    },
    [loginInfo.userId, openBracket],
  );

  return (
    <div>
      {showModal && (
        <Modal
          onClose={() => {
            setShowModal(false);
            setActiveTab(0);
          }}
        >
          <h1 className="text-xl font-bold">Create Bracket</h1>
          <div className="mb-2">
            <nav className="inline-flex flex-row items-center gap-0">
              <Tab id={0} activeTab={activeTab} setActiveTab={setActiveTab} content="Artist" />
              {/* <span className="font-bold">OR</span> */}
              <Tab
                id={1}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                content={
                  <div className="flex gap-1 align-middle">
                    Playlist{" "}
                    {/* <Badge
                          text="New"
                          backgroundColor="bg-green-100"
                          textColor="text-green-800"
                        /> */}
                  </div>
                }
              />
              <Tab
                id={2}
                activeTab={activeTab}
                setActiveTab={(id) => {
                  mixpanel.track("Create Bracket - Top Artists");
                  setActiveTab(id);
                }}
                content={
                  <div className="flex gap-1 align-middle">
                    Your top tracks{" "}
                    {/* <Badge
                          text="New"
                          backgroundColor="bg-green-100"
                          textColor="text-green-800"
                        /> */}
                  </div>
                }
              />
            </nav>
          </div>
          {activeTab === 0 && (
            <ArtistSearchBar
              setArtist={(artist) => {
                createBracket({ type: "artist", artist: artist });
              }}
            />
          )}
          {activeTab === 1 && isError && <div className="mt-2">The was a problem loading your playlists!</div>}
          {activeTab === 1 && isPending && (
            <div className="mt-2">
              <LoadingIndicator />
              Loading playlists...
            </div>
          )}
          {activeTab === 1 && isSuccess && (
            <UserPlaylistSearchBar
              setPlaylist={(playlist) => {
                console.debug("Selected playlist:", playlist);
                createBracket({ type: "playlist", playlist: playlist });
              }}
              allPlaylists={userPlaylists}
            />
          )}
          {activeTab === 2 && (
            <div className="mt-2">
              <p>Coming soon!</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
