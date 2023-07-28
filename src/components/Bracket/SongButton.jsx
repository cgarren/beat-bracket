import React, { useRef, useState, useMemo } from "react";
import PlayPauseButton from "./PlayPauseButton";
import Modal from "../Modal";
import Suggestion from "../Search/Suggestion";

import spotifyIcon from "../../assets/images/Spotify_Icon_RGB_Green.png";

import Vibrant from "node-vibrant";
import { getColorsFromImage } from "../../utilities/bracketGeneration";

import cx from "classnames";

const SongButton = ({
    styling,
    song,
    opponentId,
    nextId,
    id,
    side,
    previousIds,
    disabled,
    currentlyPlayingId,
    setCurrentlyPlayingId,
    modifyBracket,
    saveCommand,
    getBracket,
    eliminated,
    winner,
    color,
    playbackEnabled,
    editMode,
    replacementTracks,
}) => {
    const [dragging, setDragging] = useState(false);
    const [showTrackSelector, setShowTrackSelector] = useState(false);
    const buttonRef = useRef(null);
    const audioRef = useRef(null);
    const colorStyle = useMemo(() => {
        if (color) {
            // uses new color system
            if (color.backgroundColor && color.textColor) {
                return {
                    backgroundColor: color.backgroundColor,
                    color: color.textColor,
                    borderColor: color.backgroundColor,
                };
            } else {
                // provide support for legacy brackets using old color system
                const tempColor = new Vibrant.Swatch(
                    color.rgb,
                    color.population
                );
                return {
                    backgroundColor: tempColor.getHex(),
                    color: tempColor.getBodyTextColor(),
                    borderColor: tempColor.getHex(),
                };
            }
        } else {
            return {
                backgroundColor: "#fff",
                color: "#000",
                borderColor: "#fff",
            };
        }
    }, [color]);

    // Recursive function to mark all previous instances of a song in a bracket as eliminated
    function eliminatePrevious(thisId) {
        let songInfo = getBracket(thisId);
        if (songInfo.previousIds.length === 0) {
            return;
        }
        console.log(songInfo);
        for (let prevId of songInfo.previousIds) {
            if (getBracket(prevId).song === getBracket(thisId).song) {
                modifyBracket(prevId, "eliminated", true);
                eliminatePrevious(prevId);
            }
        }
    }

    function songChosen() {
        if (opponentId && getBracket(opponentId).song !== null) {
            makeChoice();
            saveCommand(makeChoice, undoChoice);
        }
    }

    function makeChoice() {
        modifyBracket(id, "disabled", true);
        modifyBracket(opponentId, "disabled", true);
        modifyBracket(opponentId, "eliminated", true);
        //eliminatePrevious(opponentId);
        if (nextId) {
            modifyBracket(nextId, "song", song);
            modifyBracket(nextId, "disabled", false);
            modifyBracket(nextId, "color", color);
            setCurrentlyPlayingId(null);
        } else {
            console.log("Winner is " + song.name);
            modifyBracket(id, "winner", true);
            //setBracketWinner(song);
            setCurrentlyPlayingId(id);
        }
    }

    function undoChoice() {
        modifyBracket(id, "disabled", false);
        modifyBracket(opponentId, "disabled", false);
        modifyBracket(opponentId, "eliminated", false);
        setCurrentlyPlayingId(null);
        //undoEliminatePrevious(opponentId);
        if (nextId) {
            modifyBracket(nextId, "song", null);
            modifyBracket(nextId, "disabled", true);
            modifyBracket(nextId, "color", null);
        } else {
            modifyBracket(id, "winner", false);
            //setBracketWinner(null);
        }
    }

    // Darg and drop functionality

    function handleDragStart(event) {
        // This method runs when the dragging starts
        setDragging(true);
        event.dataTransfer.clearData();
        // Set the drag's format and data.
        // Use the event target's id for the data
        event.dataTransfer.setData("application/plain", id);
        //event.dataTransfer.effectAllowed = "move";
        //event.target.style.backgroundColor = "blue";
    }

    function handleDrag(event) {
        // This method runs when the component is being dragged
        //console.log("Dragging...", event);
    }

    function handleDragEnd(event) {
        //console.log(event.dataTransfer.getData("text"));
        // This method runs when the dragging stops
        //console.log("Ended", event);
        //event.target.style.backgroundColor = "";
        setDragging(false);
    }

    function handleDragOver(event) {
        event.preventDefault();
        //event.dataTransfer.dropEffect = "move";
        //return false;
    }

    function handleDrop(event) {
        event.preventDefault();
        // Get the id of the target and add the moved element to the target's DOM
        const switchId = event.dataTransfer.getData("application/plain");
        console.log("drop", switchId);
        // switch the songs
        let tempSong = getBracket(switchId).song;
        modifyBracket(switchId, "song", song);
        modifyBracket(id, "song", tempSong);
        // switch the colors
        let tempColor = getBracket(switchId).color;
        modifyBracket(switchId, "color", color);
        modifyBracket(id, "color", tempColor);
    }

    // song replacement functionality

    async function handleReplacement(newSong) {
        console.log("removing", id);
        const newColor = await getColorsFromImage(newSong.art);
        modifyBracket(id, "song", newSong);
        modifyBracket(id, "color", newColor);
    }

    return (
        <>
            {replacementTracks && showTrackSelector ? (
                <Modal
                    onClose={() => {
                        setShowTrackSelector(false);
                    }}
                >
                    <h1 className="font-bold text-xl">
                        Select a replacement track:
                    </h1>
                    <div className="m-0 mt-1 p-0 list-none flex-nowrap gap-0 inline-flex flex-col text-center w-full rounded max-h-[70vh] overflow-scroll">
                        {replacementTracks.map((track) => {
                            return (
                                <Suggestion
                                    artistName={`${track.name}`}
                                    art={track.art}
                                    key={track.id}
                                    onClick={() => {
                                        handleReplacement(track);
                                        setShowTrackSelector(false);
                                    }}
                                />
                            );
                        })}
                    </div>
                </Modal>
            ) : (
                ""
            )}
            <div
                className={cx(
                    "z-0",
                    "flex",
                    "rounded-2xl",
                    "cursor-pointer",
                    "shadow-md",
                    "w-[var(--buttonwidth)]",
                    "min-w-[var(--buttonwidth)]",
                    "h-[var(--buttonheight)]",
                    "min-h-[var(--buttonheight)",
                    "disabled:w-[var(--buttonwidth)]",
                    "relative",
                    "hover:h-auto",
                    {
                        "cursor-grab animate-wiggle active:cursor-grabbing":
                            editMode && song,
                    },
                    {
                        "bg-white text-black shadow-md border-0 border-gray-400 cursor-default":
                            song == null,
                    },
                    { "opacity-100": winner },
                    { "flex-row-reverse": side },
                    { "!cursor-default": disabled },
                    { "opacity-50 !cursor-default shadow-none": eliminated },
                    styling
                )}
                style={song ? colorStyle : {}}
                id={id}
                disabled={disabled}
                data-opponentid={opponentId}
                data-nextid={nextId}
                ref={buttonRef}
                draggable={editMode}
                onDragStart={handleDragStart}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onDrop={song && !dragging ? handleDrop : null}
                onDragOver={song && !dragging ? handleDragOver : null}
            >
                {editMode && song && replacementTracks ? (
                    <button
                        onClick={() => {
                            setShowTrackSelector(true);
                        }}
                        className="border-0 p-0 w-[20px] h-[20px] bg-white text-black absolute -top-2 -right-2 rounded-full z-50"
                    >
                        {"✕"}
                    </button>
                ) : null}
                {!editMode && song && !disabled ? (
                    <button
                        onClick={() => {
                            window.open(
                                `http://open.spotify.com/track/${song.id}`
                            );
                        }}
                        className="border-0 p-0 w-[20px] h-[20px] hover:bg-white bg-black text-white absolute -top-2 -right-2 rounded-full z-50"
                    >
                        <img
                            src={spotifyIcon}
                            alt="Spotify Icon"
                            title="Open in Spotify"
                            className="h-[20px] text-white"
                        />
                    </button>
                ) : null}
                <button
                    disabled={disabled}
                    onClick={editMode ? null : songChosen}
                    hidden={false}
                    style={song ? colorStyle : {}}
                    className={cx(
                        "rounded-[inherit] cursor-[inherit] disabled:rounded-[inherit] bg-white text-black border-0 leading-[1.15em] p-0 text-center overflow-hidden break-words disabled:px-[6px] h-full min-h-[var(--buttonheight)] disabled:w-full",
                        { "opacity-100 active:opacity-100": winner },
                        { "w-full": (!winner && editMode) || !song },
                        {
                            "w-[75%]":
                                !winner &&
                                !editMode &&
                                song &&
                                song.preview_url,
                        },
                        { "bg-transparent text-black": song === null },
                        { "hover:brightness-95": song && !disabled },
                        {
                            "rounded-[inherit] pr-[6px] pl-[6px]":
                                editMode || (song && !song.preview_url),
                        },
                        {
                            "pr-[6px] rounded-l-[0]":
                                side && !editMode && song && song.preview_url,
                        },
                        {
                            "pl-[6px] rounded-r-[0]": !side,
                        }
                    )}
                    // className={
                    //   "rounded-[inherit] cursor-[inherit] disabled:rounded-[inherit] bg-white text-black border-0 leading-[1.15em] p-0 text-center overflow-hidden break-words disabled:px-[6px] h-full min-h-[var(--buttonheight)] disabled:w-full " +
                    //   (winner
                    //     ? " opacity-100 active:opacity-100 "
                    //     : editMode
                    //     ? " w-full "
                    //     : song && song.preview_url
                    //     ? " w-[75%] "
                    //     : " w-full ") +
                    //   (song == null
                    //     ? " w-full bg-transparent text-black "
                    //     : !disabled
                    //     ? " hover:brightness-95 "
                    //     : " ") +
                    //   (editMode || (song && !song.preview_url)
                    //     ? " rounded-[inherit] pr-[6px] pl-[6px] "
                    //     : side
                    //     ? " pr-[6px] rounded-l-[0] "
                    //     : " pl-[6px] rounded-r-[0] ") +
                    //   (eliminated ? " " : " ")
                    // }
                >
                    {song !== null ? song.name : ""}
                </button>
                {song && song.preview_url ? (
                    <PlayPauseButton
                        id={id}
                        song={song}
                        side={side}
                        disabled={disabled}
                        currentlyPlayingId={currentlyPlayingId}
                        setCurrentlyPlayingId={setCurrentlyPlayingId}
                        colorStyle={colorStyle}
                        playbackEnabled={playbackEnabled}
                        buttonRef={buttonRef}
                        audioRef={audioRef}
                        editMode={editMode}
                    />
                ) : null}
                {song && song.preview_url ? (
                    <audio
                        src={
                            song !== null && !disabled ? song.preview_url : null
                        }
                        volume="1"
                        className="hidden"
                        ref={audioRef}
                    ></audio>
                ) : null}
            </div>
        </>
    );
};

export default SongButton;
