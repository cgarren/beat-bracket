import React from "react";
import { useEffect, useRef, useState } from "react";
import PlayIcon from "../assets/svgs/playIcon.svg";
import PauseIcon from "../assets/svgs/pauseIcon.svg";

import {
  songButtonStyle,
  playButtonStyle,
  songDivStyle,
  unfilledStyle,
  winnerStyle,
  eliminatedStyle,
  disabledStyle,
  leftStyle,
  rightStyle,
} from "./SongButton.module.css";

const SongButton = ({
  styling,
  song,
  opponentId,
  nextId,
  id,
  side,
  previousIds,
  disabled,
  modifyBracket,
  saveCommand,
  getBracket,
  eliminated,
  winner,
  setBracketComplete,
  color,
  playbackEnabled,
}) => {
  const thebutton = useRef(null);
  const audioRef = useRef(null);
  const [paused, setPaused] = useState(true);

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
    setPaused(false);
    thebutton.current.addEventListener("mouseleave", pauseSnippet, true);
  }

  function pauseSnippet() {
    thebutton.current.removeEventListener("mouseleave", pauseSnippet, true);
    setPaused(true);
    thebutton.current.addEventListener("mouseenter", playSnippet, true);
  }

  useEffect(() => {
    if (playbackEnabled) {
      thebutton.current.addEventListener("mouseenter", playSnippet, true);
      return () => {
        if (thebutton.current) {
          thebutton.current.removeEventListener(
            "mouseenter",
            playSnippet,
            true
          );
        }
      };
    }
  }, [playbackEnabled]);

  function playPauseAudio() {
    if (paused) {
      setPaused(false);
    } else {
      setPaused(true);
    }
  }

  useEffect(() => {
    audioRef.current.addEventListener("ended", () => {
      setPaused(true);
    });
  }, []);

  useEffect(() => {
    if (paused) {
      audioRef.current.pause();
    } else {
      try {
        audioRef.current.play();
      } catch (error) {
        console.log(error);
        setPaused(true);
      }
    }
  }, [paused]);

  useEffect(() => {
    if (disabled) {
      setPaused(true);
    }
  }, [disabled]);

  return (
    <div
      className={
        songDivStyle +
        (song == null ? " " + unfilledStyle + " " : " ") +
        (winner ? " " + winnerStyle + " " : " ") +
        (disabled ? " " + disabledStyle + " " : " ") +
        (side ? " " + leftStyle + " " : " " + rightStyle + " ") +
        (eliminated ? " " + eliminatedStyle + " " : " ") +
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
          songButtonStyle +
          (song == null ? " " + unfilledStyle + " " : " ") +
          (winner ? " " + winnerStyle + " " : " ") +
          (side ? " " + leftStyle + " " : " " + rightStyle + " ") +
          (eliminated ? " " + eliminatedStyle + " " : " ")
        }
      >
        {song !== null ? song.name : ""}
      </button>
      <button
        onClick={playPauseAudio}
        className={
          playButtonStyle +
          (side ? " " + leftStyle + " " : " " + rightStyle + " ")
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
        src={song !== null ? song.preview_url : ""}
        volume="1"
        ref={audioRef}
      ></audio>
    </div>
  );
};

export default SongButton;
