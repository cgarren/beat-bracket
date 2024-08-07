import React, { useCallback, useMemo, useState, useContext } from "react";
import { MixpanelContext } from "../../context/MixpanelContext";
import { popularitySort } from "../../utils/helpers";
import useBracketGeneration from "../../hooks/useBracketGeneration";
import Bracket from "./Bracket";
import CreateSongButton from "./SongButton/CreateSongButton";
import ReplaceTrackModal from "../Modals/ReplaceTrackModal";

export default function CreateBracket({
  allTracks,
  showBracket,
  setShowBracket,
  bracketTracks,
  songSource,
  bracket,
  setBracket,
  setSeedingMethod,
  setInclusionMethod,
}) {
  const mixpanel = useContext(MixpanelContext);
  const { getColorsFromImage } = useBracketGeneration();
  const bracketIds = useMemo(() => bracketTracks.map((track) => track.id), [bracketTracks]);
  const replacementTracks = useMemo(
    () => allTracks?.filter((track) => !bracketIds.includes(track.id)).sort(popularitySort),
    [allTracks, bracketIds],
  );
  const [buttonReplacementId, setButtonReplacementId] = useState(null);
  const getBracket = useCallback((key) => bracket.get(key), [bracket]);
  const modifyBracket = useCallback(
    (modificationTriples, save = false) => {
      const bracketCopy = new Map(bracket);
      modificationTriples.forEach(([key, attribute, value]) => {
        const payload = bracketCopy.get(key);
        if (attribute === "song" && key[1] === "0") {
          setSeedingMethod("custom");
        }
        payload[attribute] = value;
        bracketCopy.set(key, payload);
      });
      if (save) {
        setBracket(new Map(bracketCopy));
      } else {
        setBracket(new Map(bracketCopy));
      }
    },
    [bracket, getBracket, setBracket, setSeedingMethod],
  );

  // song replacement functionality

  const handleReplacement = useCallback(
    async (id, newSong) => {
      mixpanel.track("Replace Track", {
        "Replacement Location Id": id,
        "New Song Id": newSong.id,
        "New Song Name": newSong.name,
      });
      const newColor = newSong?.art && (await getColorsFromImage(newSong.art));
      modifyBracket(
        [
          [id, "song", newSong],
          [id, "color", newColor],
        ],
        true,
      );
      setInclusionMethod("custom");
    },
    [modifyBracket, getColorsFromImage, setInclusionMethod],
  );

  return (
    <>
      <ReplaceTrackModal
        showModal={buttonReplacementId && replacementTracks}
        setShowModal={(show) => {
          if (!show) {
            setButtonReplacementId(null);
          }
        }}
        replacementTracks={replacementTracks}
        handleReplacement={async (newSong) => {
          await handleReplacement(buttonReplacementId, newSong);
          setButtonReplacementId(null);
        }}
        showSongInfo={songSource && songSource.type === "playlist"}
      />
      <Bracket
        bracket={bracket}
        bracketSize={bracketTracks.length}
        setShowBracket={setShowBracket}
        showBracket={showBracket}
        songSourceType={songSource?.type}
        songButtonType={CreateSongButton}
        greyBackground
        songButtonProps={useMemo(
          () => ({
            modifyBracket: modifyBracket,
            saveCommand: () => {},
            getBracket: getBracket,
            replaceTrack: replacementTracks.length > 0 ? (id) => setButtonReplacementId(id) : null,
            editable: true,
          }),
          [modifyBracket, getBracket],
        )}
      />
    </>
  );
}

// 128 -> 7
// 64 -> 6
// 32 -> 5
// 16 -> 4
// 8 -> 3
// 4 -> 2
// 2 -> 1
