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
  setBracketWinner,
  color,
  playbackEnabled,
}) => {
  const [paused, setPaused] = useState(true);
  const thebutton = useRef(null);
  const audioRef = useRef(null);

  const winnerStyle = ""; //"overflow-hidden w-[calc(var(--buttonwidth))] h-[calc(var(--buttonheight))] before:box-border box-border before:content-[''] before:absolute before:left-[-50%] before:top-[calc(-1*var(--buttonwidth)+22px)] before:w-[calc(2*var(--buttonwidth)+6px)] before:h-[calc(2*var(--buttonwidth)+6px)] before:bg-no-repeat before:bg-white before:[background-size:50%_50%,50%_50%] before:[background-position:0_0,100%_0,100%_100%,0_100%] before:[background-image:linear-gradient(black,black),linear-gradient(white,white),linear-gradient(black,black),linear-gradient(white,white)] before:animate-steam before:-z-20 before:rounded-2xl";

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
        setCurrentlyPlayingId(null);
      } else {
        console.log("Winner is " + song.name);
        modifyBracket(id, "winner", true);
        setBracketWinner(song);
        setCurrentlyPlayingId(id);
      }
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
    if (playbackEnabled && !disabled) {
      const songButton = thebutton.current;
      songButton.addEventListener("mouseenter", playSnippet, true);
      return () => {
        if (songButton) {
          songButton.removeEventListener("mouseenter", playSnippet, true);
        }
      };
    }
  }, [playbackEnabled, disabled]);

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
        audioRef.current.play().catch((error) => {
          console.log(error.name);
          if (error.name === "NotAllowedError") {
            alert(
              "It looks like you haven't given this site permission to play audio. If you are using Safari, please enable autoplay and try again. If that doesn't work, try using Chrome instead!"
            );
          } else {
            console.log(error);
          }
          setCurrentlyPlayingId(null);
          setPaused(true);
        });
        setPaused(false);
      } catch (error) {
        console.log(error);
        setCurrentlyPlayingId(null);
        setPaused(true);
      }
    }
  }, [currentlyPlayingId]);

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
      disabled={disabled}
      data-opponentid={opponentId}
      data-nextid={nextId}
      ref={thebutton}
    >
      <button
        disabled={disabled}
        onClick={songChosen}
        hidden={false}
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
          "rounded-[inherit] disabled:rounded-[inherit] bg-white text-black border-0 leading-[1.15em] p-0 text-center overflow-hidden break-words disabled:px-[6px]" +
          (winner
            ? " opacity-100 active:opacity-100"
            : " disabled:w-full w-[70%] h-full min-h-[var(--buttonheight)]") +
          (song == null ? " w-full bg-transparent text-black " : "") +
          (side ? " pr-[6px] rounded-l-[0] " : " pl-[6px] rounded-r-[0]") +
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
        src={song !== null && !disabled ? song.preview_url : null}
        volume="1"
        className="hidden"
        ref={audioRef}
      ></audio>
    </div>
  );
};

export default SongButton;
