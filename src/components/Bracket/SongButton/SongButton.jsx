import React, { useRef, useState, useMemo } from "react";
import Vibrant from "node-vibrant";
import cx from "classnames";
import UndoIcon from "../../../assets/svgs/undoIcon.svg";
import PlayPauseButton from "./PlayPauseButton";
import OpenInSpotifyButton from "./OpenInSpotifyButton";
import ReplaceTrackButton from "./ReplaceTrackButton";

export default function SongButton({
  styling,
  song,
  opponentId,
  nextId,
  id,
  side,
  col,
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
  editMode,
  editable,
  replaceTrack,
  undoFunc,
}) {
  const [dragging, setDragging] = useState(false);
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
      }
      // provide support for legacy brackets using old color system
      const tempColor = new Vibrant.Swatch(color.rgb, color.population);
      return {
        backgroundColor: tempColor.getHex(),
        color: tempColor.getBodyTextColor(),
        borderColor: tempColor.getHex(),
      };
    }
    return {
      backgroundColor: "#fff",
      color: "#000",
      borderColor: "#fff",
    };
  }, [color]);

  // Recursive function to mark all previous instances of a song in a bracket as eliminated
  // function eliminatePrevious(thisId) {
  //     let songInfo = getBracket(thisId);
  //     if (songInfo.previousIds.length === 0) {
  //         return;
  //     }
  //     console.log(songInfo);
  //     for (let prevId of songInfo.previousIds) {
  //         if (getBracket(prevId).song === getBracket(thisId).song) {
  //             modifyBracket(prevId, "eliminated", true);
  //             eliminatePrevious(prevId);
  //         }
  //     }
  // }

  function undoChoice() {
    modifyBracket([
      [id, "disabled", false],
      [opponentId, "disabled", false],
      [opponentId, "eliminated", false],
    ]);
    setCurrentlyPlayingId(null);
    // undoEliminatePrevious(opponentId);
    if (nextId) {
      modifyBracket(
        [
          [nextId, "song", null],
          [nextId, "disabled", true],
          [nextId, "color", null],
        ],
        true,
      );
    } else {
      modifyBracket([[id, "winner", false]], true);
    }
  }

  function makeChoice() {
    modifyBracket([
      [id, "disabled", true],
      [opponentId, "disabled", true],
      [opponentId, "eliminated", true],
    ]);
    // eliminatePrevious(opponentId);
    if (nextId) {
      modifyBracket([
        [nextId, "song", song],
        [nextId, "disabled", false],
        [nextId, "color", color, true],
        [nextId, "undoFunc", undoChoice],
      ]);
      setCurrentlyPlayingId(null);
    } else {
      console.log(`Winner is ${song.name}`);
      modifyBracket([[id, "winner", true]], true);
      // setBracketWinner(song);
      setCurrentlyPlayingId(null);
    }
  }

  function songChosen() {
    if (opponentId && getBracket(opponentId).song !== null) {
      makeChoice();
      saveCommand(makeChoice, undoChoice);
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
    // event.dataTransfer.effectAllowed = "move";
    // event.target.style.backgroundColor = "blue";
  }

  function handleDrag(event) {
    // This method runs when the component is being dragged
    // console.log("Dragging...", event);
  }

  function handleDragEnd(event) {
    // console.log(event.dataTransfer.getData("text"));
    // This method runs when the dragging stops
    // console.log("Ended", event);
    // event.target.style.backgroundColor = "";
    setDragging(false);
  }

  function handleDragOver(event) {
    event.preventDefault();
    // event.dataTransfer.dropEffect = "move";
    // return false;
  }

  function handleDrop(event) {
    event.preventDefault();
    // Get the id of the target and add the moved element to the target's DOM
    const switchId = event.dataTransfer.getData("application/plain");
    // switch the songs
    const tempSong = getBracket(switchId).song;
    // switch the colors
    const tempColor = getBracket(switchId).color;
    // modify the bracket
    modifyBracket(
      [
        [switchId, "song", song],
        [id, "song", tempSong],
        [switchId, "color", color],
        [id, "color", tempColor],
      ],
      true,
    );
  }

  return (
    <div className="relative">
      {editable && !editMode && song && !disabled && col !== 0 && undoFunc && (
        <button
          type="button"
          onClick={undoFunc}
          aria-label="Undo"
          className={cx(
            "border-0 w-[26px] h-[26px] p-1 text-xs hover:bg-red-600 hover:text-white bg-transparent text-black absolute rounded-full z-20 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
            {
              "-right-8 top-3": side === "l" && getBracket(opponentId).side === side,
              "-left-8 top-3": side === "r" && getBracket(opponentId).side === side,
              "-bottom-8 left-11": getBracket(opponentId).side !== side,
            },
          )}
        >
          <UndoIcon />
        </button>
      )}
      <div
        className={cx(
          "flex",
          "rounded-2xl",
          "shadow-md",
          "w-[var(--buttonwidth)]",
          "min-w-[var(--buttonwidth)]",
          "h-[var(--buttonheight)]",
          "min-h-[var(--buttonheight)",
          "disabled:w-[var(--buttonwidth)]",
          "relative",
          "hover:h-auto",
          { "cursor-pointer": editable && !editMode && song },
          {
            "cursor-grab animate-wiggle active:cursor-grabbing": editable && editMode && song,
          },
          {
            "bg-white text-black shadow-md border-0 border-gray-400 cursor-default": song == null,
          },
          { "opacity-100": winner },
          { "flex-row-reverse": side },
          { "!cursor-default": disabled },
          {
            "opacity-50 !cursor-default shadow-none": eliminated,
          },
          styling,
        )}
        style={song ? colorStyle : {}}
        id={id}
        disabled={disabled}
        data-opponentid={opponentId}
        data-nextid={nextId}
        ref={buttonRef}
        draggable={editMode && editable && col === 0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDrop={song && !dragging ? handleDrop : null}
        onDragOver={song && !dragging ? handleDragOver : null}
      >
        {/* {song && song.art ? (
                    <div className="absolute top-0 left-0 w-full h-full hover:block">
                        <img
                            src={song.art}
                            alt={song.name}
                            className="w-full h-full object-cover rounded-2xl"
                        />
                    </div>
                ) : null} */}
        {editMode && editable && song && <ReplaceTrackButton replacementFunction={replaceTrack} />}
        {!editMode && song && !disabled && <OpenInSpotifyButton songId={song.id} />}
        <button
          type="button"
          disabled={disabled}
          onClick={editMode || !editable ? null : songChosen}
          hidden={false}
          style={song ? colorStyle : {}}
          className={cx(
            "rounded-[inherit] cursor-[inherit] disabled:rounded-[inherit] bg-white text-black border-0 leading-[1.15em] p-0 text-center overflow-hidden break-words disabled:px-[6px] h-full min-h-[var(--buttonheight)] disabled:w-full z-10 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
            { "opacity-100 active:opacity-100": winner },
            { "w-full": (!winner && editMode) || !song },
            {
              "w-[75%]": !winner && !editMode && song && song.preview_url,
            },
            { "bg-transparent text-black": song === null },
            { "hover:brightness-95": song && !disabled },
            {
              "rounded-[inherit] pr-[6px] pl-[6px] w-full": editMode || (song && !song.preview_url),
            },
            {
              "pr-[6px] rounded-l-[0]": side && !editMode && song && song.preview_url,
            },
            {
              "pl-[6px] rounded-r-[0]": !side,
            },
          )}
        >
          {song !== null ? song.name : ""}
        </button>
        {song && song.preview_url && !disabled && !editMode && (
          <PlayPauseButton
            id={id}
            song={song}
            side={side}
            currentlyPlayingId={currentlyPlayingId}
            setCurrentlyPlayingId={setCurrentlyPlayingId}
            colorStyle={colorStyle}
            audioRef={audioRef}
          />
        )}
        {song?.preview_url && !disabled && !editMode && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={song.preview_url} ref={audioRef} />
        )}
      </div>
    </div>
  );
}