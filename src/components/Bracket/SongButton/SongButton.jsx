import React, { useRef, useMemo } from "react";
import Vibrant from "node-vibrant";
import cx from "classnames";
import PlayPauseButton from "./PlayPauseButton";

export default function SongButton({
  styling,
  song,
  id,
  side,
  disabled,
  currentlyPlayingId,
  setCurrentlyPlayingId,
  eliminated,
  winner,
  color,
  editMode,
  editable,
  clickFunction,
  showPlayPauseButton,
  actionButton,
}) {
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

  return (
    <div className="w-fit">
      {actionButton}
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
            "cursor-grab active:cursor-grabbing": editable && editMode && song,
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
      >
        <button
          type="button"
          disabled={disabled}
          onClick={clickFunction}
          hidden={false}
          style={song ? colorStyle : {}}
          className={cx(
            "rounded-[inherit] cursor-[inherit] disabled:rounded-[inherit] bg-white text-black border-0 leading-[1.15em] p-0 text-center overflow-hidden break-words disabled:px-[6px] h-full min-h-[var(--buttonheight)] disabled:w-full z-10 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 text-[.875rem]",
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
        {showPlayPauseButton && song?.preview_url && !disabled && (
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
        {song?.preview_url && !disabled && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <audio src={song.preview_url} className="hidden" ref={audioRef} />
        )}
      </div>
    </div>
  );
}
