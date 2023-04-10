import React from "react";
import { useEffect, useState } from "react";
import PlayIcon from "../../assets/svgs/playIcon.svg";
import PauseIcon from "../../assets/svgs/pauseIcon.svg";

const PlayPauseButton = ({
  song,
  id,
  side,
  disabled,
  currentlyPlayingId,
  setCurrentlyPlayingId,
  colorStyle,
  playbackEnabled,
  buttonRef,
  audioRef,
  editMode,
}) => {
  const [paused, setPaused] = useState(true);

  function playSnippet() {
    buttonRef.current.removeEventListener("mouseenter", playSnippet, true);
    setCurrentlyPlayingId(id);
    buttonRef.current.addEventListener("mouseleave", pauseSnippet, true);
  }

  function pauseSnippet() {
    buttonRef.current.removeEventListener("mouseleave", pauseSnippet, true);
    setCurrentlyPlayingId(null);
    buttonRef.current.addEventListener("mouseenter", playSnippet, true);
  }

  useEffect(() => {
    if (playbackEnabled && !disabled) {
      const songButton = buttonRef.current;
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
      if (!audioRef.current.paused) {
        audioRef.current.pause();
      }
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
    <button
      onClick={playPauseAudio}
      title={song ? (paused ? "Play" : "Pause") : "No song selected"}
      className={
        "rounded-[inherit] bg-green-500 text-white border-0 w-[25%] h-full min-h-[var(--buttonheight)] cursor-[inherit] text-center p-0 hover:brightness-95" +
        (side ? " rounded-r-[0] " : " rounded-l-[0] ")
      }
      style={song ? colorStyle : {}}
      hidden={!song || disabled || editMode}
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
    </button>
  );
};

export default PlayPauseButton;
