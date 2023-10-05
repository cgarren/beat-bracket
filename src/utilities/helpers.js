// Screnshot library
import html2canvas from "html2canvas";

import { navigate } from "gatsby";

import { getUserInfo } from "./spotify";

export function debounce(func, timeout = 300) {
	let timer;
	return (...args) => {
		console.log("clearing timeout", timer)
		clearTimeout(timer);
		console.log("setting timeout again")
		timer = setTimeout(() => { func.apply(this, args); }, timeout);
	};
}

export function generateRandomString(length) {
	let text = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function popularitySort(track1, track2) {
	if (track1.popularity > track2.popularity) { return -1 };
	if (track1.popularity < track2.popularity) { return 1 };
	// sort alphabetically for consistency if popularity is the same
	return track1.name < track2.name ? -1 : track1.name > track2.name;
}

export function switchEveryOther(array) {
	for (let i = 1; i < array.length / 2; i += 2) {
		if (i % 2 !== 0) {
			//console.log("switching", array[array.length - i].name, "AND", array[i].name);
			let temp = array[i];
			array[i] = array[array.length - i];
			array[array.length - i] = temp;
		}
	}
	return array;
}

// removes duplicates in an array of objects if a certain key/value is repeated
export function removeDuplicatesWithKey(theArray, key) {
	console.log(theArray);
	// init tracking array
	let tempArray = [];
	//loop through given array
	for (let index in theArray) {
		if (theArray[index][key] === "Jail") {
			console.log(tempArray);
			console.log(index);
		}
		//check to see if element at the key is already in tracking array
		if (tempArray.includes(theArray[index][key])) {
			console.log(theArray[index][key])
			// remove element at the current position from the array
			theArray.splice(index, 1);
			// deincrement our position to account for the ddeleted item
			index--;
		} else {
			// add element to our tracking array
			tempArray.push(theArray[index][key]);
		}
	}
	return theArray;
}

export async function shuffleArray(array) {
	let newArray = [...array];
	let currentIndex = newArray.length, randomIndex;
	// While there remain elements to shuffle.
	while (currentIndex !== 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[newArray[currentIndex], newArray[randomIndex]] = [
			newArray[randomIndex], newArray[currentIndex]];
	}
	return newArray;
}

export function nearestGreaterPowerOf2(num) {
	let current = 0;
	let j = 0;
	while (current <= num) {
		current = 2 ** (j + 1);
		j++;
	}
	return current;
}

export function nearestLesserPowerOf2(num) {
	let last = 0;
	let current = 0;
	let j = 0;
	while (current <= num) {
		last = current
		current = 2 ** (j + 1);
		j++;
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
	} else if (value1.side === "l" && value2.side === "r") {
		return 1;
	} else if (value1.side === "l" && value2.side === "l") {
		if (value1.col > value2.col) {
			return -1;
		} else if (value1.col < value2.col) {
			return 1;
		} else {
			if (value1.index > value2.index) {
				return 1;
			} else if (value1.index < value2.index) {
				return -1;
			} else {
				return 0;
			}
		}
	} else if (value1.side === "r" && value2.side === "r") {
		if (value1.col > value2.col) {
			return 1;
		} else if (value1.col < value2.col) {
			return -1;
		} else {
			if (value1.index > value2.index) {
				return 1;
			} else if (value1.index < value2.index) {
				return -1;
			} else {
				return 0;
			}
		}
	} else {
		throw new Error("Found bracket with invalid side: " + value1.side + " or " + value2.side);
	}
}

export async function openBracket(uuid, userId = undefined, state = {}) {
	console.log("Opening Bracket: " + uuid);
	//open the bracket editor and pass the bracket id off
	navigate("/user/" + (userId ? userId : getUserInfo().id) + "/bracket/" + uuid, { state: state });
}

export function downloadBracket(bracketId, artistName) {
	let bracketEl = document.getElementById(bracketId);
	html2canvas(bracketEl, {
		scale: 4,
		scrollX: -bracketEl.offsetLeft,
		scrollY: -bracketEl.offsetTop,
		logging: false,
	}).then(function (canvas) {
		//canvas = document.body.appendChild(canvas); // used for debugging
		//console.log(canvas.width, canvas.height);
		let ctx = canvas.getContext("2d");
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "black";
		ctx.font = "bold 30px sans-serif";
		ctx.fillText(artistName, canvas.width / 8, canvas.height / 16, 225);
		ctx.font = "8px sans-serif";
		ctx.fillText(
			"Bracket made at cgarren.github.io/song-coliseum",
			canvas.width / 8,
			canvas.height / 16 + 20,
			225
		);
		const createEl = document.createElement("a");
		createEl.href = canvas.toDataURL("image/svg+xml");
		createEl.download = artistName + " bracket from Beat Bracket";
		createEl.click();
		createEl.remove();
	});
}

export function bracketUnchanged(bracket) {
	console.log(!(bracket instanceof Map));
	if (!(bracket instanceof Map)) {
		console.log("bracket is not a map");
		return false
	};
	for (let element of bracket.values()) {
		if (element.col !== 0 && element.song) {
			return false;
		}
	}
	return true;
}