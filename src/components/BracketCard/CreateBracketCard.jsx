import React, { useState } from "react";
import BracketCard from "./BracketCard";
import createBracketPic from "../../assets/images/createBracket.png";
import { v4 as uuidv4 } from "uuid";
import ArtistSearchBar from "../Search/ArtistSearchBar";
import { openBracket } from "../../utilities/helpers";
import Modal from "../Modal";
import Tab from "../Tab";

const CreateBracketCard = ({ userId }) => {
    const [showModal, setShowModal] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    function createArtistBracket(artist) {
        if (artist) {
            // Generate unique id for new bracket
            const uuid = uuidv4();
            console.log("Create New Bracket with id: " + uuid);
            openBracket(uuid, userId, { artist: artist });
        }
    }

    function createPlaylistBracket(playlist) {
        if (playlist) {
            // Generate unique id for new bracket
            const uuid = uuidv4();
            console.log("Create New Bracket with id: " + uuid);
            openBracket(uuid, userId, { playlist: playlist });
        }
    }

    return (
        <div>
            <BracketCard
                image={createBracketPic}
                imageAlt="Plus sign"
                cardText={"Create Bracket"}
                onClick={() => {
                    setShowModal(true);
                }}
            ></BracketCard>
            {showModal ? (
                <Modal onClose={() => setShowModal(false)}>
                    <div className="mb-2">
                        <nav className="inline-flex flex-row">
                            <Tab
                                id={0}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                text="Artist"
                            />
                            <Tab
                                id={1}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                text="Playlist"
                            />
                            <Tab
                                id={2}
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                text="Blank"
                                disabled={true}
                            />
                        </nav>
                    </div>
                    {activeTab === 0 ? (
                        <ArtistSearchBar setArtist={createArtistBracket} />
                    ) : null}
                    {activeTab === 1 ? (
                        // <ArtistSearchBar setArtist={createPlaylistBracket} />
                        <button
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            onClick={() =>
                                createPlaylistBracket({
                                    name: "Cooper Garren's top tracks ",
                                    id: "405iv7OQMP5NBWD0f9427e",
                                })
                            }
                        >
                            Create Sample bracket
                        </button>
                    ) : null}
                </Modal>
            ) : null}
        </div>
    );
};

export default CreateBracketCard;
