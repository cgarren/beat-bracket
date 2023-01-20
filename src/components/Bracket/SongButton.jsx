import React, { useEffect, useRef, useState } from "react";
import PlayPauseButton from "./PlayPauseButton";

import Vibrant from "node-vibrant";

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
  setBracketWinner,
  color,
  playbackEnabled,
}) => {
  const buttonRef = useRef(null);
  const audioRef = useRef(null);
  const [colorStyle, setColorStyle] = useState({
    backgroundColor: "#fff",
    color: "#000",
    borderColor: "#fff",
  });

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

  useEffect(() => {
    if (color) {
      if (color.backgroundColor && color.textColor) {
        setColorStyle({
          backgroundColor: color.backgroundColor,
          color: color.textColor,
          borderColor: color.backgroundColor,
        });
      } else {
        // provide support for legacy brackets using old color system
        const tempColor = new Vibrant.Swatch(color.rgb, color.population);
        setColorStyle({
          backgroundColor: tempColor.getHex(),
          color: tempColor.getBodyTextColor(),
          borderColor: tempColor.getHex(),
        });
      }
    }
  }, [color]);

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
      setBracketWinner(song);
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
      setBracketWinner(null);
    }
  }

  return (
    <div
      className={
        "z-0 flex rounded-2xl shadow-md cursor-pointer w-[var(--buttonwidth)] min-w-[var(--buttonwidth)] h-[var(--buttonheight)] min-h-[var(--buttonheight) disabled:cursor-default disabled:shadow-none disabled:w-[var(--buttonwidth)] relative hover:h-auto " +
        (song == null
          ? " bg-white text-black shadow-md border-0 border-gray-400"
          : " ") +
        (winner ? " opacity-100 " : " ") +
        (side ? " flex-row-reverse " : "") +
        (eliminated ? " opacity-50 " : " ") +
        styling
      }
      style={song ? colorStyle : {}}
      id={id}
      disabled={disabled}
      data-opponentid={opponentId}
      data-nextid={nextId}
      ref={buttonRef}
    >
      <button
        disabled={disabled}
        onClick={songChosen}
        hidden={false}
        style={song ? colorStyle : {}}
        className={
          "rounded-[inherit] disabled:rounded-[inherit] bg-white text-black border-0 leading-[1.15em] p-0 text-center overflow-hidden break-words disabled:px-[6px] h-full min-h-[var(--buttonheight)] disabled:w-full " +
          (winner ? " opacity-100 active:opacity-100" : " w-[70%]") +
          (song == null ? " w-full bg-transparent text-black " : "") +
          (side ? " pr-[6px] rounded-l-[0] " : " pl-[6px] rounded-r-[0]") +
          (eliminated ? " " : "")
        }
      >
        {song !== null ? song.name : ""}
      </button>
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
      />
      <audio
        src={song !== null && !disabled ? song.preview_url : null}
        volume="1"
        className="hidden"
        ref={audioRef}
      ></audio>
    </div>
  );
};

export default SongButton;
