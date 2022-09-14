import React from "react";
import { useEffect, useRef, useState } from "react";
import PlayIcon from "../assets/svgs/playIcon.svg";
import PauseIcon from "../assets/svgs/pauseIcon.svg";

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
  setBracketComplete,
  color,
  playbackEnabled,
}) => {
  const [paused, setPaused] = useState(true);
  const thebutton = useRef(null);
  const audioRef = useRef(null);
  const blankAudio =
    "https://github.com/anars/blank-audio/raw/master/2-seconds-of-silence.mp3";

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
    makeChoice();
    saveCommand(makeChoice, undoChoice);
  }

  function makeChoice() {
    if (opponentId && getBracket(opponentId).song !== null) {
      modifyBracket(id, "disabled", true);
      modifyBracket(opponentId, "disabled", true);
      modifyBracket(opponentId, "eliminated", true);
      //eliminatePrevious(opponentId);
      if (nextId) {
        modifyBracket(nextId, "song", song);
        modifyBracket(nextId, "disabled", false);
        modifyBracket(nextId, "color", color);
      } else {
        console.log("Winner is " + song.name);
        modifyBracket(id, "winner", true);
        setBracketComplete(true);
      }
    }
  }

  function undoChoice() {
    modifyBracket(id, "disabled", false);
    modifyBracket(opponentId, "disabled", false);
    modifyBracket(opponentId, "eliminated", false);
    //undoEliminatePrevious(opponentId);
    if (nextId) {
      modifyBracket(nextId, "song", null);
      modifyBracket(nextId, "disabled", true);
      modifyBracket(nextId, "color", null);
    } else {
      modifyBracket(id, "winner", false);
      setBracketComplete(false);
    }
  }

  function playSnippet() {
    thebutton.current.removeEventListener("mouseenter", playSnippet, true);
    setCurrentlyPlayingId(id);
    thebutton.current.addEventListener("mouseleave", pauseSnippet, true);
  }

  function pauseSnippet() {
    thebutton.current.removeEventListener("mouseleave", pauseSnippet, true);
    setCurrentlyPlayingId(null);
    thebutton.current.addEventListener("mouseenter", playSnippet, true);
  }

  useEffect(() => {
    if (playbackEnabled) {
      const songButton = thebutton.current;
      songButton.addEventListener("mouseenter", playSnippet, true);
      return () => {
        if (songButton) {
          songButton.removeEventListener("mouseenter", playSnippet, true);
        }
      };
    }
  }, [playbackEnabled]);

  function playPauseAudio() {
    if (paused) {
      setCurrentlyPlayingId(id);
    } else {
      setCurrentlyPlayingId(null);
    }
  }

  useEffect(() => {
    audioRef.current.addEventListener("ended", () => {
      setCurrentlyPlayingId(null);
    });
  }, []);

  useEffect(() => {
    if (currentlyPlayingId !== id) {
      audioRef.current.pause();
      setPaused(true);
    } else {
      try {
        audioRef.current.play();
        setPaused(false);
      } catch (error) {
        console.log(error);
        setCurrentlyPlayingId(null);
        setPaused(true);
      }
    }
  }, [currentlyPlayingId]);

  useEffect(() => {
    if (disabled) {
      setCurrentlyPlayingId(null);
    }
  }, [disabled]);

  return (
    <div
      className={
        "flex rounded-2xl border-0 shadow-md cursor-pointer w-[var(--buttonwidth)] min-w-[var(--buttonwidth)] h-[var(--buttonheight)] min-h-[var(--buttonheight) hover:h-auto hover:flex] disabled:cursor-default disabled:shadow-none disabled:w-[var(--buttonwidth)]" +
        (song == null
          ? " bg-white text-black shadow-md border-0 border-gray-400"
          : " ") +
        (winner ? "opacity-100" : " ") +
        (side ? " flex-row-reverse " : "") +
        (eliminated ? " opacity-50 " : " ") +
        styling
      }
      style={
        color
          ? {
              backgroundColor: color.getHex(),
              color: color.getBodyTextColor(),
              borderColor: color.getHex(),
            }
          : {}
      }
      id={id}
      data-opponentid={opponentId}
      data-nextid={nextId}
      ref={thebutton}
    >
      <button
        disabled={disabled}
        onClick={songChosen}
        style={
          color
            ? {
                backgroundColor: color.getHex(),
                color: color.getBodyTextColor(),
                borderColor: color.getHex(),
              }
            : {}
        }
        className={
          "rounded-[inherit] disabled:rounded-[inherit] bg-red-500 text-white border-0 w-[70%] h-full min-h-[var(--buttonheight)] leading-[1.2em] p-0 text-center overflow-hidden break-words disabled:w-full disabled:px-[6px]" +
          (song == null ? " w-full bg-transparent text-black" : "") +
          (winner ? " opacity-100 " : "") +
          (side ? " pr-[6px] rounded-l-[0] " : " pl-[6px] rounded-r-[0] ") +
          (eliminated ? " " : "")
        }
      >
        {song !== null ? song.name : ""}
      </button>
      <button
        onClick={playPauseAudio}
        className={
          "rounded-[inherit] bg-green-500 text-white border-0 w-[30%] h-full min-h-[var(--buttonheight)] cursor-[inherit] text-center p-0" +
          (side ? " rounded-r-[0] " : " rounded-l-[0] ")
        }
        style={
          color
            ? {
                backgroundColor: color.getHex(),
                color: color.getBodyTextColor(),
                borderColor: color.getHex(),
              }
            : {}
        }
        hidden={song === null || disabled}
      >
        {paused ? <PlayIcon /> : <PauseIcon />}
      </button>
      <audio
        src={song !== null && !disabled ? song.preview_url : blankAudio}
        volume="1"
        ref={audioRef}
      ></audio>
    </div>
  );
};

export default SongButton;
