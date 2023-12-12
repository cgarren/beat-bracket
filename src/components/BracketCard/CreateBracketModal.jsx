import React, { useState, useEffect, useContext, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import ArtistSearchBar from "../Search/ArtistSearchBar";
import UserPlaylistSearchBar from "../Search/UserPlaylistSearchBar";
import Modal from "../Modal";
import Tab from "../Tab";
import useSongProcessing from "../../hooks/useSongProcessing";
import { LoginContext } from "../../context/LoginContext";
import useSpotify from "../../hooks/useSpotify";
// import Badge from "../Badge";

export default function CreateBracketModal({ showModal, setShowModal }) {
  const [activeTab, setActiveTab] = useState(0);
  const [allPlaylists, setAllPlaylists] = useState([]);
  const { loginInfo } = useContext(LoginContext);
  const { openBracket } = useSpotify();
  const { loadPlaylists } = useSongProcessing();

  const createArtistBracket = useCallback(
    (artist) => {
      if (artist) {
        // Generate unique id for new bracket
        const uuid = uuidv4();
        console.debug(`Create New Bracket with id: ${uuid}`);
        openBracket(uuid, loginInfo.userId, {
          type: "artist",
          artist: artist,
        });
      }
    },
    [loginInfo.userId, openBracket],
  );

  const createPlaylistBracket = useCallback(
    (playlist) => {
      if (playlist) {
        // Generate unique id for new bracket
        const uuid = uuidv4();
        console.debug(`Create New Bracket with id: ${uuid}`);
        openBracket(uuid, loginInfo.userId, {
          type: "playlist",
          playlist: playlist,
        });
      }
    },
    [loginInfo.userId, openBracket],
  );

  useEffect(() => {
    if (showModal && allPlaylists.length === 0) {
      const url = "https://api.spotify.com/v1/me/playlists?limit=50";
      loadPlaylists(url).then((playlists) => {
        if (playlists) {
          setAllPlaylists(playlists);
        }
      });
    }
  }, [showModal, allPlaylists, loadPlaylists]);

  return (
    <div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
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
              {/* <Tab
                                id={2}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                text="Blank"
                                disabled={true}
                            /> */}
            </nav>
          </div>
          {activeTab === 0 ? <ArtistSearchBar setArtist={createArtistBracket} /> : null}
          {activeTab === 1 ? (
            <UserPlaylistSearchBar setPlaylist={createPlaylistBracket} allPlaylists={allPlaylists} />
          ) : null}
        </Modal>
      )}
    </div>
  );
}
