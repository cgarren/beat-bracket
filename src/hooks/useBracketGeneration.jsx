// Library to get prominent colors from images (for coloring bracket spaces according to album art)
import Vibrant from "node-vibrant";
import { useCallback } from "react";
import useHelper from "./useHelper";

export default function useBracketGeneration() {
  const { nearestGreaterPowerOf2, nearestLesserPowerOf2 } = useHelper();

  // Function to get the prominent colors from an image
  const getColorsFromImage = useCallback(async (image) => {
    // const color = await new FastAverageColor().getColorAsync(image)
    const color = (await Vibrant.from(image).getPalette()).Vibrant;
    if (!color) {
      return null;
    }
    return {
      // backgroundColor: color.hex,
      // textColor: color.isDark ? 'white' : 'black'
      backgroundColor: color.getHex(),
      textColor: color.getBodyTextColor(),
    };
  }, []);

  const relateSongs = useCallback(
    async (len, theTracks, col, side, otherSide, oldBracketMap) => {
      const colMap = new Map();
      for (let i = 0; i < len; i += 1) {
        let colorObj = null;
        if (theTracks?.[i]?.art) {
          colorObj = await getColorsFromImage(theTracks[i].art);
        }
        let song = null;
        let seed = null;
        if (theTracks?.[i]) {
          seed = theTracks[i].seed;
          song = theTracks[i];
          delete song.seed;
        }

        colMap.set(side + col + i, {
          song: song,
          seed: seed,
          opponentId: len <= 1 ? otherSide + col + 0 : side + col + (i % 2 === 0 ? i + 1 : i - 1),
          nextId: len <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
          previousIds:
            col === 0 ? [] : [side + (col - 1) + Math.ceil(i * 2), side + (col - 1) + (Math.ceil(i * 2) + 1)],
          id: side + col + i,
          col: col,
          side: side,
          index: i,
          disabled: !(col === 0 && theTracks[i]),
          winner: false,
          eliminated: false,
          color: colorObj,
          undoFunc: null,
        });

        if (col === 0) {
          const opponentId = colMap.get(side + col + i)?.opponentId;
          if (colMap.get(opponentId)?.song?.name && !song?.name) {
            colMap.set(opponentId, {
              ...colMap.get(opponentId),
              eliminated: true,
              disabled: true,
            });
            colMap.set(side + col + i, {
              ...colMap.get(side + col + i),
              disabled: true,
            });
          }
        }

        if (col === 1) {
          if (colMap.get(side + col + i).previousIds.length > 0) {
            // console.log(
            //   colMap.get(side + col + i).previousIds.every((id) => {
            //     console.log(id, oldBracketMap.get(id));
            //     return oldBracketMap.get(id)?.disabled;
            //   }),
            // );
            if (colMap.get(side + col + i).previousIds.every((id) => oldBracketMap.get(id)?.disabled)) {
              colMap.get(side + col + i).previousIds.forEach((id) => {
                // console.log(oldBracketMap.get(id));
                if (oldBracketMap.get(id).song?.name) {
                  // console.log(oldBracketMap.get(id).song?.name, "setting disabled");
                  colMap.set(side + col + i, {
                    ...colMap.get(side + col + i),
                    song: oldBracketMap.get(id).song,
                    color: oldBracketMap.get(id).color,
                    seed: oldBracketMap.get(id).seed,
                    disabled: false,
                  });
                }
              });
            }
          }
        }
      }
      // console.log(colMap);
      return colMap;
    },
    [getColorsFromImage],
  );

  const fillBracket = useCallback(
    async (tracks, cols) => {
      let i = 0;
      let forward = true;
      let repeated = false;
      let temp = new Map();

      while (i < cols) {
        const len = nearestGreaterPowerOf2(tracks.length) / 2 ** (i + 1) / 2;
        let theTracks = new Array(len);
        if (i >= cols - 1) {
          if (!repeated) {
            repeated = true;
            temp = new Map([...(await relateSongs(len, theTracks, i, "r", "l", temp)), ...temp]);
            forward = false;
            i = 0;
            continue;
          }
        }

        if (i === 0) {
          if (forward) {
            theTracks = tracks.slice(0, Math.ceil(tracks.length / 2));
          } else {
            theTracks = tracks.slice(-Math.floor(tracks.length / 2));
          }
        }

        if (forward) {
          temp = new Map([...(await relateSongs(len, theTracks, i, "r", "l", temp)), ...temp]);
          i += 1;
        } else {
          temp = new Map([...(await relateSongs(len, theTracks, i, "l", "r", temp)), ...temp]);
          i += 1;
        }
      }
      return temp;
    },
    [relateSongs, nearestGreaterPowerOf2],
  );

  const getNumberOfColumns = useCallback(
    (numItems) => {
      const cols = Math.ceil(Math.log(nearestLesserPowerOf2(numItems)) / Math.log(2));
      return cols;
    },
    [nearestLesserPowerOf2],
  );

  const getNumberOfSongs = useCallback((bracketSize) => {
    // return 2 ** bracketSize - 1;
    for (let i = 0; i < bracketSize; i += 1) {
      if (2 ** i > bracketSize) {
        return 2 ** (i - 1);
      }
    }
    return null;
  }, []);

  return {
    fillBracket,
    getNumberOfColumns,
    getNumberOfSongs,
    getColorsFromImage,
  };
}
