// Screnshot library
import html2canvas from "html2canvas";

import { navigate } from "gatsby";

import { getUserInfo } from "./spotify";

function generateRandomString(length) {
	let text = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

async function getParamsFromURL(new_url) {
	try {
		let hashParams = getHashParams()
		if (hashParams.raw_hash !== '') {
			window.history.replaceState({}, document.title, new_url);
			hashParams.expires_at = Date.now() + (parseInt(hashParams.expires_in) * 1000);
			delete hashParams.expires_in;
			return hashParams;
		}
		return {};
	} catch (err) {
		console.error(err.message);
		return {};
	}
}

function getHashParams() {
	let hashParams = {};
	let e, r = /([^&;=]+)=?([^&;]*)/g,
		q = window.location.hash.substring(1);
	hashParams['raw_hash'] = window.location.hash;
	while (e = r.exec(q)) {
		hashParams[e[1]] = decodeURIComponent(e[2]);
	}
	return hashParams;
}

function checkSpotifyAuth(timer = undefined) {
	let mydate = new Date(parseInt(sessionStorage.getItem("expireTime")));
	if (
		sessionStorage.getItem("expireTime") === null ||
		sessionStorage.getItem("accessToken") === null ||
		mydate.toString() === "Invalid Date" ||
		Date.now() > mydate
	) {
		if (timer) {
			clearInterval(timer);
		}
		return false;
	} else {
		return true;
	}
}

function popularitySort(track1, track2) {
	if (track1.popularity > track2.popularity) { return -1 };
	if (track1.popularity < track2.popularity) { return 1 };
	// sort alphabetically for consistency if popularity is the same
	return track1.name < track2.name ? -1 : track1.name > track2.name;
}

function switchEveryOther(array) {
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
function removeDuplicatesWithKey(theArray, key) {
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

function shuffleArray(array) {
	let currentIndex = array.length, randomIndex;
	// While there remain elements to shuffle.
	while (currentIndex !== 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}
	return array;
}

function nearestGreaterPowerOf2(num) {
	let current = 0;
	let j = 0;
	while (current <= num) {
		current = 2 ** (j + 1);
		j++;
	}
	return current;
}

function nearestLesserPowerOf2(num) {
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

function bracketSorter(a, b) {
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

function openBracket(uuid, userId = undefined, state = {}) {
	console.log("Opening Bracket: " + uuid);
	//open the bracket editor and pass the bracket id off
	navigate("/" + (userId ? userId : getUserInfo().id) + "/brackets/" + uuid, { state: state });
}

function downloadBracket(bracketId, artistName) {
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
		createEl.download = artistName + " bracket from Song Coliseum";
		createEl.click();
		createEl.remove();
	});
}

export {
	popularitySort,
	removeDuplicatesWithKey,
	nearestGreaterPowerOf2,
	nearestLesserPowerOf2,
	switchEveryOther,
	shuffleArray,
	getParamsFromURL,
	generateRandomString,
	downloadBracket,
	openBracket,
	bracketSorter,
	checkSpotifyAuth
}