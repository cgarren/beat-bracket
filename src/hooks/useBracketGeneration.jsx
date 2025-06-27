// Library to get prominent colors from images (for coloring bracket spaces according to album art)
import { Vibrant } from "node-vibrant/browser";
import { useCallback } from "react";
import { nearestGreaterPowerOf2, objectIsEmpty } from "../utils/helpers";
import useSongProcessing from "./useSongProcessing";

export default function useBracketGeneration() {
  const { sortTracks, arrangeSeeds, seedBracket } = useSongProcessing();
  // Function to get the prominent colors from an image
  const getColorsFromImage = useCallback(async (image) => {
    // const color = await new FastAverageColor().getColorAsync(image)
    const palette = await Vibrant.from(image).getPalette();
    const color = palette.Vibrant;
    if (!color) {
      return null;
    }
    return {
      // backgroundColor: color.hex,
      // textColor: color.isDark ? 'white' : 'black'
      backgroundColor: color.hex,
      textColor: color.bodyTextColor,
    };
  }, []);

  const relateSongs = useCallback(
    async (colLength, theTracks, col, side, otherSide, oldBracketMap) => {
      const colMap = new Map();
      for (let i = 0; i < colLength; i += 1) {
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
          if (objectIsEmpty(song)) {
            song = null;
          }
        }

        colMap.set(side + col + i, {
          song: song,
          seed: seed,
          opponentId: colLength <= 1 ? otherSide + col + 0 : side + col + (i % 2 === 0 ? i + 1 : i - 1),
          nextId: colLength <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
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

        // if the opponent has a song and the current song is empty, disable the current song and eliminate the opponent
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

        // promote songs from previous rounds if all previous songs are disabled
        if (col === 1) {
          if (colMap.get(side + col + i).previousIds.length > 0) {
            if (colMap.get(side + col + i).previousIds.some((id) => !oldBracketMap.get(id)?.song?.name)) {
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
        // calculate the number of tracks to use for the current column
        const colLength = nearestGreaterPowerOf2(tracks.length) / 2 ** (i + 1);
        let theTracks = new Array(colLength);
        if (i >= cols - 1) {
          if (!repeated) {
            repeated = true;
            temp = new Map([...(await relateSongs(colLength, theTracks, i, "r", "l", temp)), ...temp]);
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
          temp = new Map([...(await relateSongs(colLength, theTracks, i, "r", "l", temp)), ...temp]);
          i += 1;
        } else {
          temp = new Map([...(await relateSongs(colLength, theTracks, i, "l", "r", temp)), ...temp]);
          i += 1;
        }
      }
      return temp;
    },
    [relateSongs],
  );

  const getNumberOfColumns = useCallback((numItems) => {
    const cols = Math.ceil(Math.log(nearestGreaterPowerOf2(numItems)) / Math.log(2));
    return cols;
  }, []);

  const getNumberOfSongs = useCallback((bracketSize) => {
    // return 2 ** bracketSize - 1;
    for (let i = 0; i < bracketSize; i += 1) {
      if (2 ** i > bracketSize) {
        return 2 ** (i - 1);
      }
    }
    return null;
  }, []);

  const changeBracket = useCallback(
    async (allTracks, limit, seedingMethod, inclusionMethod) => {
      const greaterPower = nearestGreaterPowerOf2(limit);

      // sort the list by inclusion method
      let newAllTracks = await sortTracks(allTracks, inclusionMethod);

      // limit the list to the selected limit
      newAllTracks = newAllTracks.slice(0, limit);

      // sort the list by seeding method
      newAllTracks = await sortTracks(newAllTracks, seedingMethod);

      // add seed numbers
      newAllTracks = newAllTracks.map((track, index) => {
        const newTrack = { ...track, seed: index + 1 };
        return newTrack;
      });

      // calculate the number of tracks to use for the base bracket, before byes
      const numTracks = Number(limit) === greaterPower ? limit : greaterPower;

      // fill in the bracket with byes
      for (let i = newAllTracks.length; i < numTracks; i += 1) {
        newAllTracks.push({ seed: i + 1 });
      }

      // arrange the seeds
      newAllTracks = await arrangeSeeds(newAllTracks);

      if (newAllTracks?.length > 0) {
        // create the bracket and relate songs
        const temp = await fillBracket(newAllTracks, getNumberOfColumns(newAllTracks.length));
        return temp;
      }
      return null;
    },
    [sortTracks, seedBracket, fillBracket, getNumberOfColumns],
  );

  // Create blank second chance bracket (with 2 songs less than main bracket and blank)
  const createSecondChanceBracket = useCallback(async (numberOfBracketSongs) => {
    const numSecondChanceBracketSongs = numberOfBracketSongs - 2;
    const blankTracks = Array(numSecondChanceBracketSongs)
      .fill(null)
      .map((_, index) => ({ name: "TBD" }));

    const secondChanceBracket = await changeBracket(blankTracks, numSecondChanceBracketSongs, "random", "random");

    // disable all songs in second chance bracket to start
    secondChanceBracket.forEach((value, key) => {
      if (value.song?.name === "TBD" && !value.disabled) {
        secondChanceBracket.set(key, { ...value, disabled: true, placeholder: true, song: { name: "placeholder" } });
      } else {
        secondChanceBracket.set(key, { ...value, disabled: true });
      }
    });

    // // calculate the number of tracks to use for the base bracket, before byes
    // const numTracks = Number(limit) === greaterPower ? limit : greaterPower;

    // // fill in the bracket with byes
    // for (let i = blankTracks.length; i < numSecondChanceBracketSongs; i += 1) {
    //   blankTracks.push({});
    // }
    // console.log("blankTracks with byes", blankTracks);
    // const secondChanceBracket = await fillBracket(blankTracks, numSecondChanceBracketColumns);
    return secondChanceBracket;
  }, []);

  return {
    fillBracket,
    getNumberOfColumns,
    getNumberOfSongs,
    getColorsFromImage,
    changeBracket,
    createSecondChanceBracket,
  };
}
