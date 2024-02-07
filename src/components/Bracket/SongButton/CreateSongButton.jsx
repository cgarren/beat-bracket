import React, { useState, useContext } from "react";
import SongButton from "./SongButton";
import ReplaceTrackButton from "./ReplaceTrackButton";
import { MixpanelContext } from "../../../context/MixpanelContext";

export default function CreateSongButton({
  styling,
  song,
  id,
  side,
  col,
  disabled,
  modifyBracket,
  getBracket,
  eliminated,
  winner,
  color,
  replaceTrack,
}) {
  const [dragging, setDragging] = useState(false);
  const mixpanel = useContext(MixpanelContext);

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
    // track the drop
    mixpanel.track("Switch Track", {
      "From Id": switchId,
      "To Id": id,
    });
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
      <div
        draggable={col === 0}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onDrop={song && !dragging ? handleDrop : null}
        onDragOver={song && !dragging ? handleDragOver : null}
      >
        <SongButton
          actionButton={
            song?.name &&
            replaceTrack && (
              <ReplaceTrackButton
                replacementFunction={() => {
                  replaceTrack(id);
                }}
              />
            )
          }
          clickFunction={() => {}}
          showPlayPauseButton={false}
          styling={styling}
          song={song}
          id={id}
          side={side}
          disabled={disabled}
          currentlyPlayingId={null}
          setCurrentlyPlayingId={() => {}}
          eliminated={eliminated}
          winner={winner}
          color={color}
          editMode
          editable
        />
      </div>
    </div>
  );
}
