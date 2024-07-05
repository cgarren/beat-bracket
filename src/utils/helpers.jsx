// 100% PURE FUNCTIONS ONLY!!!

export function objectIsEmpty(obj) {
  // eslint-disable-next-line no-restricted-syntax
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

export function generateRandomString(length) {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function popularitySort(track1, track2) {
  if (track1.popularity > track2.popularity) {
    return -1;
  }
  if (track1.popularity < track2.popularity) {
    return 1;
  }
  // sort alphabetically for consistency if popularity is the same
  return track1.name < track2.name ? -1 : track1.name > track2.name;
}

export function switchEveryOther(array) {
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
}

// removes duplicates in an array of objects if a certain key/value is repeated
export function removeDuplicatesWithKey(array, key) {
  const newArray = [...array];
  // init tracking array
  const tempArray = [];
  // loop through given array
  for (let index in newArray) {
    // check to see if element at the key is already in tracking array
    if (tempArray.includes(newArray[index][key])) {
      // remove element at the current position from the array
      newArray.splice(index, 1);
      // deincrement our position to account for the deleted item
      index -= 1;
    } else {
      // add element to our tracking array
      tempArray.push(newArray[index][key]);
    }
  }
  return newArray;
}

export async function shuffleArray(array) {
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
}

export function nearestGreaterPowerOf2(num) {
  let current = 0;
  let j = 0;
  while (current < num) {
    j += 1;
    current = 2 ** (j + 1);
  }
  return current;
}

export function nearestLesserPowerOf2(num) {
  let last = 0;
  let current = 0;
  let j = 0;
  while (current <= num) {
    last = current;
    current = 2 ** (j + 1);
    j += 1;
  }
  return last;
}

export function bracketSorter(a, b) {
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
}

export function isEdgeSong(songObj, bracketGetterFunc) {
  // Check if the song is an "edge" song, meaning it is in the first column or was promoted automatrically due to a previous song not being filled in
  const edgeSong =
    Boolean(songObj?.song?.name && songObj?.col === 0 && Boolean(bracketGetterFunc(songObj.opponentId)?.song?.name)) ||
    Boolean(
      songObj?.song?.name && songObj?.col === 1 && songObj.previousIds.some((id) => !bracketGetterFunc(id).song?.name),
    );
  return edgeSong;
}

export function bracketUnchanged(bracket) {
  if (!(bracket instanceof Map)) {
    return false;
  }
  const values = Array.from(bracket.values());
  return values.every(
    (element) =>
      isEdgeSong(element, (id) => {
        bracket.get(id);
      }) || !element.song,
  );
}

export function camelCaseToTitleCase(str) {
  return str.replace(/([A-Z])/g, " $1").replace(/^./, (tempstr) => tempstr.toUpperCase());
}

// MARK spotify helpers

export function calculateExpiresAt(expiresIn) {
  return Date.now() + parseInt(expiresIn, 10) * 1000;
}

export async function generateCodeChallenge(codeVerifier) {
  function base64encode(string) {
    return window
      .btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);

  return base64encode(digest);
}
