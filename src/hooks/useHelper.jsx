// Screnshot library
import { useCallback } from "react";
import { navigate } from "gatsby";

export default function useHelper() {
  const debounce = useCallback((func, timeout = 300) => {
    let timer;
    return (...args) => {
      console.debug("clearing debounce timeout", timer);
      clearTimeout(timer);
      console.debug("setting debounce timeout again");
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }, []);

  const generateRandomString = useCallback((length) => {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i += 1) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }, []);

  const popularitySort = useCallback((track1, track2) => {
    if (track1.popularity > track2.popularity) {
      return -1;
    }
    if (track1.popularity < track2.popularity) {
      return 1;
    }
    // sort alphabetically for consistency if popularity is the same
    return track1.name < track2.name ? -1 : track1.name > track2.name;
  }, []);

  const switchEveryOther = useCallback((array) => {
    const newArray = [...array];
    for (let i = 1; i < newArray.length / 2; i += 2) {
      if (i % 2 !== 0) {
        // console.log("switching", newArray[newArray.length - i].name, "AND", newArray[i].name);
        const temp = newArray[i];
        newArray[i] = newArray[newArray.length - i];
        newArray[newArray.length - i] = temp;
      }
    }
    return newArray;
  }, []);

  // removes duplicates in an array of objects if a certain key/value is repeated
  const removeDuplicatesWithKey = useCallback((theArray, key) => {
    // init tracking array
    const tempArray = [];
    // loop through given array
    for (let index in theArray) {
      // check to see if element at the key is already in tracking array
      if (tempArray.includes(theArray[index][key])) {
        // remove element at the current position from the array
        theArray.splice(index, 1);
        // deincrement our position to account for the deleted item
        index -= 1;
      } else {
        // add element to our tracking array
        tempArray.push(theArray[index][key]);
      }
    }
    return theArray;
  }, []);

  const shuffleArray = useCallback(async (array) => {
    const newArray = [...array];
    let currentIndex = newArray.length;
    let randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      // And swap it with the current element.
      [newArray[currentIndex], newArray[randomIndex]] = [newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
  }, []);

  const nearestGreaterPowerOf2 = useCallback((num) => {
    let current = 0;
    let j = 0;
    while (current <= num) {
      current = 2 ** (j + 1);
      j += 1;
    }
    return current;
  }, []);

  const nearestLesserPowerOf2 = useCallback((num) => {
    let last = 0;
    let current = 0;
    let j = 0;
    while (current <= num) {
      last = current;
      current = 2 ** (j + 1);
      j += 1;
    }
    return last;
  }, []);

  const bracketSorter = useCallback((a, b) => {
    const value1 = a[1];
    const value2 = b[1];

    // r > l
    // for r, sort col increasing
    // for l, sort col decreasing
    // always sort row increasing

    if (value1.side === "r" && value2.side === "l") {
      return -1;
    }
    if (value1.side === "l" && value2.side === "r") {
      return 1;
    }
    if (value1.side === "l" && value2.side === "l") {
      if (value1.col > value2.col) {
        return -1;
      }
      if (value1.col < value2.col) {
        return 1;
      }
      if (value1.index > value2.index) {
        return 1;
      }
      if (value1.index < value2.index) {
        return -1;
      }
      return 0;
    }
    if (value1.side === "r" && value2.side === "r") {
      if (value1.col > value2.col) {
        return 1;
      }
      if (value1.col < value2.col) {
        return -1;
      }
      if (value1.index > value2.index) {
        return 1;
      }
      if (value1.index < value2.index) {
        return -1;
      }
      return 0;
    }
    throw new Error(`Found bracket with invalid side: ${value1.side} or ${value2.side}`);
  }, []);

  const bracketUnchanged = useCallback((bracket) => {
    if (!(bracket instanceof Map)) {
      return false;
    }
    const values = Array.from(bracket.values());
    return values.every((element) => element.col === 0 || !element.song);
  }, []);

  const handleNaviagtionAttempt = useCallback((path, noChanges) => {
    if (noChanges(true)) {
      console.log("navigating to", path);
      navigate(path);
    }
  }, []);

  const camelCaseToTitleCase = useCallback(
    (str) => str.replace(/([A-Z])/g, " $1").replace(/^./, (tempstr) => tempstr.toUpperCase()),
    [],
  );

  return {
    debounce,
    generateRandomString,
    popularitySort,
    switchEveryOther,
    removeDuplicatesWithKey,
    shuffleArray,
    nearestGreaterPowerOf2,
    nearestLesserPowerOf2,
    bracketSorter,
    bracketUnchanged,
    handleNaviagtionAttempt,
    camelCaseToTitleCase,
  };
}
