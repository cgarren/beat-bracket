import React, { useEffect, useCallback, useMemo, useState, createElement } from "react";
import useWindowSize from "react-use/lib/useWindowSize";
import cx from "classnames";
import useBracketGeneration from "../../hooks/useBracketGeneration";

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
    (side, columns, bracketArray, currentBracket) =>
      new Array(columns).fill(undefined).map((e, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <div className="flex flex-col" key={side + i}>
          {bracketArray.map((entry) => {
            const [mykey, value] = entry;
            const colExpression = side === "l" ? i : columns - 1 - i;
            if (value.side === side && value.col === colExpression) {
              return (
                <div key={mykey}>
                  {createElement(
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
                      disabled: songButtonProps.editable ? value.disabled : true,
                    },
                    null,
                  )}
                  {((value.song && value.col === 0) || currentBracket.has(side + value.col + (value.index + 1))) && (
                    <div className={`w-[var(--buttonwidth)] relative ${lineStyles[colExpression]}`}>
                      {value.index % 2 === 0 && value.nextId != null ? (
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
                      {value.song && value.col === 0 && songSourceType ? (
                        <div className="px-1 text-center text-black text-xs text-ellipsis line-clamp-1 break-all">
                          {songSourceType === "playlist" && value.song.artist}
                          {songSourceType === "artist" && value.song.album}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            }
            return null;
          })}
        </div>
      )),
    [songButtonType, songSourceType, songButtonProps],
  );

  const renderArray = useMemo(() => {
    const columns = getNumberOfColumns(bracketSize);
    const bracketArray = bracket instanceof Map ? Array.from(bracket.entries()) : null;
    return bracket instanceof Map && bracket.size !== 0
      ? [
          generateComponentArray("l", columns, bracketArray, bracket),
          generateComponentArray("r", columns, bracketArray, bracket),
        ]
      : [];
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
          "overflow-x-scroll flex": true,
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
