import React, { useCallback } from "react";
import { useEffect, useState } from "react";
import PlayIcon from "../../assets/svgs/playIcon.svg";
import PauseIcon from "../../assets/svgs/pauseIcon.svg";
import cx from "classnames";

export default function PlayPauseButton({
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
}) {
    const [paused, setPaused] = useState(true);

    const playSnippet = useCallback(() => {
        buttonRef.current.removeEventListener("mouseenter", playSnippet, true);
        setCurrentlyPlayingId(id);
        buttonRef.current.addEventListener("mouseleave", pauseSnippet, true);
    }, [buttonRef, id, setCurrentlyPlayingId]);

    const pauseSnippet = useCallback(() => {
        buttonRef.current.removeEventListener("mouseleave", pauseSnippet, true);
        setCurrentlyPlayingId(null);
        buttonRef.current.addEventListener("mouseenter", playSnippet, true);
    }, [buttonRef, setCurrentlyPlayingId, playSnippet]);

    useEffect(() => {
        if (playbackEnabled && !disabled) {
            const songButton = buttonRef.current;
            songButton.addEventListener("mouseenter", playSnippet, true);
            return () => {
                if (songButton) {
                    songButton.removeEventListener(
                        "mouseenter",
                        playSnippet,
                        true
                    );
                }
            };
        }
    }, [playbackEnabled, disabled, buttonRef, playSnippet]);

    function playPauseAudio() {
        if (paused) {
            setCurrentlyPlayingId(id);
        } else {
            setCurrentlyPlayingId(null);
        }
    }

    useEffect(() => {
        const audio = audioRef.current;
        audio.addEventListener("ended", () => {
            setCurrentlyPlayingId(null);
        });
        return () => {
            audio.removeEventListener("ended", () => {
                setCurrentlyPlayingId(null);
            });
        };
    }, [audioRef, setCurrentlyPlayingId]);

    useEffect(() => {
        if (currentlyPlayingId !== id) {
            if (!audioRef.current.paused) {
                audioRef.current.pause();
            }
            setPaused(true);
        } else {
            try {
                audioRef.current.play().catch((error) => {
                    if (error.name === "NotAllowedError") {
                        alert(
                            "It looks like you haven't given this site permission to play audio. If you are using Safari, please enable autoplay and try again. If that doesn't work, try using Chrome instead!"
                        );
                    } else {
                        console.error(error);
                    }
                    setCurrentlyPlayingId(null);
                    setPaused(true);
                });
                setPaused(false);
            } catch (error) {
                console.error(error);
                setCurrentlyPlayingId(null);
                setPaused(true);
            }
        }
    }, [currentlyPlayingId, audioRef, id, setCurrentlyPlayingId]);

    return (
        <button
            onClick={playPauseAudio}
            title={song ? (paused ? "Play" : "Pause") : "No song selected"}
            className={cx(
                "rounded-[inherit]",
                "bg-green-500",
                "text-white",
                "border-0",
                "w-[25%]",
                "min-h-[var(--buttonheight)]",
                "cursor-[inherit]",
                "text-center",
                "p-0",
                "hover:brightness-95",
                "focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50",
                { "rounded-r-[0]": side },
                { "rounded-l-[0]": !side }
            )}
            style={song ? colorStyle : {}}
            hidden={!song || disabled || editMode}
        >
            {paused ? <PlayIcon /> : <PauseIcon />}
        </button>
    );
}
