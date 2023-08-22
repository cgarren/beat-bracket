import React, { useEffect, useState, useCallback, useMemo } from "react";
import SongButton from "./SongButton";
import useWindowSize from "react-use/lib/useWindowSize";
import { getNumberOfColumns } from "../../utilities/bracketGeneration";
import { popularitySort } from "../../utilities/helpers";
import cx from "classnames";

// const styles = [
//     // "mt-[var(--firstColumnSpacing)]",
//     // "mt-[var(--secondColumnSpacing)]",
//     // "mt-[var(--thirdColumnSpacing)]",
//     // "mt-[var(--fourthColumnSpacing)]",
//     // "mt-[var(--fifthColumnSpacing)]",
//     // "mt-[var(--sixthColumnSpacing)]",
//     // "mt-[var(--seventhColumnSpacing)]",
//     // "mt-[var(--eigthColumnSpacing)]",
//     // "mt-[var(--ninthColumnSpacing)]",
// ];

const topStyles = [
    "mt-0",
    "mt-[calc(var(--buttonheight)*.75)]",
    "mt-[calc(var(--buttonheight)*2.25)]",
    "mt-[calc(var(--buttonheight)*5.25)]",
    "mt-[calc(var(--buttonheight)*11.25)]",
    "mt-[calc(var(--buttonheight)*23.25)]",
    "mt-[calc(var(--buttonheight)*47.25)]",
    "mt-[calc(var(--buttonheight)*95.25)]",
    "mt-[calc(var(--buttonheight)*191.25)]",
];

const lineStyles = [
    "h-[var(--firstColumnSpacing)]",
    "h-[var(--secondColumnSpacing)]",
    "h-[var(--thirdColumnSpacing)]",
    "h-[var(--fourthColumnSpacing)]",
    "h-[var(--fifthColumnSpacing)]",
    "h-[var(--sixthColumnSpacing)]",
    "h-[var(--seventhColumnSpacing)]",
    "h-[var(--eigthColumnSpacing)]",
    "h-[var(--ninthColumnSpacing)]",
];

/* 3, 7, 15, 31, 63, 127*/
/*   4  8  16  32  64*/

const Bracket = ({
    allTracks,
    showBracket,
    setShowBracket,
    saveCommand,
    playbackEnabled,
    bracket,
    setBracket,
    editable,
    editMode,
    bracketTracks,
    currentlyPlayingId,
    setCurrentlyPlayingId,
    songSource,
    setSeedingMethod,
    setInclusionMethod,
}) => {
    const { width, height } = useWindowSize();
    const replacementTracks = useMemo(() => {
        const bracketIds = [];
        for (let track of bracketTracks) {
            bracketIds.push(track.id);
        }
        return allTracks
            .filter((track) => !bracketIds.includes(track.id))
            .sort(popularitySort);
    }, [allTracks, bracketTracks]);
    const renderArray = useMemo(() => {
        const columns = getNumberOfColumns(bracketTracks.length);
        const bracketArray = Array.from(bracket.entries());
        return bracket instanceof Map && bracket.size !== 0
            ? [
                  generateComponentArray(
                      "l",
                      currentlyPlayingId,
                      setCurrentlyPlayingId,
                      columns,
                      bracketArray
                  ),
                  generateComponentArray(
                      "r",
                      currentlyPlayingId,
                      setCurrentlyPlayingId,
                      columns,
                      bracketArray
                  ),
              ]
            : [];
    }, [
        bracket,
        currentlyPlayingId,
        editMode,
        editable,
        replacementTracks,
        bracketTracks,
        playbackEnabled,
    ]);
    const [bracketRef, setBracketRef] = useState(null);
    const bracketCallback = useCallback(
        (node) => {
            setBracketRef({ current: node });
        },
        [showBracket]
    );

    function generateComponentArray(
        side,
        mycurrentlyPlayingId,
        mysetCurrentlyPlayingId,
        columns,
        bracketArray
    ) {
        return Array.apply(null, { length: columns }).map((e, i) => (
            <div className="flex flex-col" key={side + i}>
                {bracketArray.map((entry) => {
                    const [mykey, value] = entry;
                    const colExpression = side === "l" ? i : columns - 1 - i;
                    if (value.side === side && value.col === colExpression) {
                        return (
                            <div key={mykey}>
                                <SongButton
                                    editMode={editMode}
                                    playbackEnabled={playbackEnabled}
                                    modifyBracket={modifyBracket}
                                    saveCommand={saveCommand}
                                    getBracket={getBracket}
                                    opponentId={value.opponentId}
                                    nextId={value.nextId}
                                    song={value.song}
                                    id={value.id}
                                    col={value.col}
                                    setInclusionMethod={setInclusionMethod}
                                    currentlyPlayingId={mycurrentlyPlayingId}
                                    setCurrentlyPlayingId={
                                        mysetCurrentlyPlayingId
                                    }
                                    side={side}
                                    styling={cx({
                                        [`${topStyles[colExpression]}`]:
                                            value.index === 0,
                                        // [`${styles[colExpression]}`]:
                                        //     value.index !== 0 &&
                                        //     value.index % 2 === 0,
                                    })}
                                    color={value.color}
                                    key={mykey}
                                    eliminated={value.eliminated}
                                    disabled={editable ? value.disabled : true}
                                    winner={value.winner}
                                    //setBracketWinner={setBracketWinner}
                                    replacementTracks={replacementTracks}
                                    showSongInfo={
                                        songSource &&
                                        songSource.type === "playlist"
                                    }
                                />
                                {((value.song && value.col === 0) ||
                                    bracket.has(
                                        side + value.col + (value.index + 1)
                                    )) && (
                                    <div
                                        className={`w-[var(--buttonwidth)] relative ${lineStyles[colExpression]}`}
                                    >
                                        {value.index % 2 === 0 &&
                                        value.nextId != null ? (
                                            <div
                                                className={cx({
                                                    [`${lineStyles[colExpression]}`]: true,
                                                    "bg-gray-500 w-[var(--lineWidth)] rounded": true,
                                                    absolute: true,
                                                    "right-0": side === "l",
                                                    "left-0": side === "r",
                                                })}
                                                key={mykey + "line"}
                                            ></div>
                                        ) : null}
                                        {value.song &&
                                        value.col === 0 &&
                                        songSource ? (
                                            <div className="px-1 text-center text-black text-xs text-ellipsis line-clamp-1 break-all">
                                                {songSource.type === "playlist"
                                                    ? value.song.artist
                                                    : songSource.type ===
                                                      "artist"
                                                    ? value.song.album
                                                    : null}
                                                {/* {`${value.song.popularity} | ${value.song.artist}`} */}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
        ));
    }

    useEffect(() => {
        if (renderArray.length > 0) {
            setShowBracket(true);
        }
    }, [renderArray, setShowBracket]);

    function modifyBracket(key, attribute, value) {
        const payload = getBracket(key);
        if (attribute === "song" && key[1] === "0") {
            setSeedingMethod("custom");
        }
        payload[attribute] = value;
        setBracket(new Map(bracket.set(key, payload)));
    }

    function getBracket(key) {
        return bracket.get(key);
    }

    return (
        <div hidden={!showBracket || renderArray.length === 0}>
            <div
                className={cx({
                    "overflow-x-scroll flex": true,
                    "justify-center":
                        bracketRef && bracketRef.current.offsetWidth <= width,
                    "justify-start":
                        bracketRef && bracketRef.current.offsetWidth > width,
                })}
            >
                <div
                    ref={bracketCallback}
                    className={cx({
                        "block w-fit flex-col p-2": true,
                        "bg-gray-800/25 rounded-2xl": editMode,
                    })}
                >
                    <div
                        className="flex flex-row gap-[10px] justify-start p-[5px]"
                        id="bracket"
                    >
                        {renderArray}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Bracket;

// 128 -> 7
// 64 -> 6
// 32 -> 5
// 16 -> 4
// 8 -> 3
// 4 -> 2
// 2 -> 1
