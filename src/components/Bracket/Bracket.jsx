import React, { useEffect, useCallback, useMemo, useState, createElement } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import cx from "classnames";
import useBracketGeneration from "../../hooks/useBracketGeneration";
import { isEdgeSong } from "../../utils/helpers";

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

/* 3, 7, 15, 31, 63, 127 */
/*   4  8  16  32  64 */

export default function Bracket({
  showBracket,
  setShowBracket,
  bracket,
  bracketSize,
  songSourceType,
  songButtonType,
  songButtonProps,
  greyBackground,
}) {
  const { width } = useWindowSize(); // can also get height if needed
  const { getNumberOfColumns } = useBracketGeneration();

  const generateComponentArray = useCallback(
    (side, columns, bracketArray, currentBracket) => [
      new Array(columns).fill(undefined).map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="flex flex-col w-fit" key={side + i}>
          {bracketArray.map((entry) => {
            const [mykey, value] = entry;
            const colExpression = side === "l" ? i : columns - 1 - i;
            if (value.side === side && value.col === colExpression) {
              // Logic to determine whether to show the button or a placeholder
              const hideButton =
                (!value.song?.name || !Boolean(currentBracket.get(value.opponentId)?.song?.name)) && value.col === 0;
              return (
                <div key={mykey} className={cx("w-[var(--buttonwidth)]", "min-w-[var(--buttonwidth)]")}>
                  {/* Create the element for the song button */}
                  {!hideButton &&
                    createElement(
                      songButtonType,
                      {
                        ...songButtonProps,
                        styling: cx({
                          [`${topStyles[colExpression]}`]: value.index === 0,
                          // [`${styles[colExpression]}`]:
                          //     value.index !== 0 &&
                          //     value.index % 2 === 0,
                        }),
                        song: value.song,
                        id: value.id,
                        col: value.col,
                        nextId: value.nextId,
                        opponentId: value.opponentId,
                        previousIds: value.previousIds,
                        side: side,
                        color: value.color,
                        eliminated: value.eliminated,
                        winner: value.winner,
                        undoFunc: value.undoFunc,
                        disabled: songButtonProps.editable && value.song?.name ? value.disabled : true,
                      },
                      null,
                    )}

                  {/* If the button is hidden, show a placeholder */}
                  {hideButton && (
                    <div
                      className={cx({
                        "w-[var(--buttonwidth)] h-[var(--buttonheight)]": true,
                      })}
                    />
                  )}

                  <div
                    className={cx({
                      [`w-[var(--buttonwidth)] relative ${lineStyles[colExpression]}`]: currentBracket.has(
                        side + value.col + (value.index + 1),
                      ),
                    })}
                  >
                    {/* Show bracket line */}
                    {!hideButton && value.index % 2 === 0 && value.nextId != null ? (
                      <div
                        className={cx({
                          [`${lineStyles[colExpression]}`]: true,
                          "bg-gray-500 w-[var(--lineWidth)] rounded": true,
                          absolute: true,
                          "right-0": side === "l",
                          "left-0": side === "r",
                        })}
                        key={`${mykey}line`}
                      />
                    ) : null}

                    {/* If button is hidden, show placehodler for bracket line */}
                    {hideButton && (
                      <div
                        className={cx({
                          [`${lineStyles[colExpression]}`]: true,
                          absolute: true,
                        })}
                      />
                    )}

                    {/* Show the song or artist name */}
                    {!hideButton &&
                    value.song &&
                    isEdgeSong(value, (id) => currentBracket.get(id)) &&
                    songSourceType ? (
                      <div className="px-1 text-center text-black text-xs text-ellipsis line-clamp-1 break-all">
                        {/* {value.seed + " "} */}
                        {songSourceType === "playlist" && value.song.artist}
                        {songSourceType === "artist" && value.song.album}
                      </div>
                    ) : null}

                    {/* If button is hidden, show placeholder for song or artist name */}
                    {hideButton && (
                      <div className="px-1 text-center text-black text-xs text-ellipsis line-clamp-1 break-all" />
                    )}
                  </div>
                </div>
              );
            }
            return null;
          })}
        </div>
      )),
    ],
    [songButtonType, songSourceType, songButtonProps],
  );

  const renderArray = useMemo(() => {
    if (bracket instanceof Map && bracket.size !== 0) {
      const columns = getNumberOfColumns(bracketSize);
      const bracketArray = bracket instanceof Map ? Array.from(bracket.entries()) : null;
      const [leftArray] = generateComponentArray("l", columns, bracketArray, bracket);
      const [rightArray] = generateComponentArray("r", columns, bracketArray, bracket);
      return [leftArray, rightArray];
    }
    return [];
  }, [bracket, bracketSize, generateComponentArray, getNumberOfColumns]);

  const [bracketWidth, setBracketWidth] = useState(0);

  useEffect(() => {
    if (renderArray.length > 0) {
      setShowBracket(true);
    }
  }, [renderArray, setShowBracket]);

  useEffect(() => {
    if (showBracket) {
      const calculatedWidth =
        document && document.getElementById("bracketHolder") && document.getElementById("bracketHolder").offsetWidth;
      setBracketWidth(calculatedWidth);
    }
  }, [showBracket]);

  return (
    <div hidden={!showBracket || renderArray.length === 0}>
      <div
        className={cx({
          "overflow-x-auto flex": true,
          "justify-center": bracketWidth <= width,
          "justify-start": bracketWidth > width,
        })}
      >
        <div
          className={cx({
            "block w-fit flex-col p-2": true,
            "bg-gray-800/25 rounded-2xl": greyBackground,
          })}
          id="bracketHolder"
        >
          <div className="flex flex-row gap-[10px] justify-start p-[5px]" id="bracket">
            {renderArray}
          </div>
        </div>
      </div>
    </div>
  );
}

// 128 -> 7
// 64 -> 6
// 32 -> 5
// 16 -> 4
// 8 -> 3
// 4 -> 2
// 2 -> 1
