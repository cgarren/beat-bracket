// Screnshot library
import html2canvas from "html2canvas";
// Guest profile pic
import guestProfileImage from "../assets/images/guestProfileImage.png";

async function loadRequest(url, params) {
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	const response = await fetch(url, {
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
		}
	});

	if (response.ok) {
		return response.json(); // parses JSON response into native JavaScript objects
	} else if (response.status === 429) {
		throw new Error("Too many requests. Code: " + response.status);
	} else {
		throw new Error("Unknown request error. Code: " + response.status);
	}
}

async function postRequest(url, params, data) {
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
		},
		body: JSON.stringify(data)
	});

	if (response.ok) {
		return response.json(); // parses JSON response into native JavaScript objects
	} else if (response.status === 429) {
		throw new Error("Too many requests. Code: " + response.status);
	} else {
		throw new Error("Unknown request error. Code: " + response.status);
	}
}

async function putRequest(url, params, data) {
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'image/jpeg',
			'Authorization': 'Bearer ' + sessionStorage.getItem('access_token')
		},
		///body: data
	});

	if (response.ok) {
		return response.json(); // parses JSON response into native JavaScript objects
	} else if (response.status === 429) {
		throw new Error("Too many requests. Code: " + response.status);
	} else {
		throw new Error("Unknown request error. Code: " + response.status);
	}
}

async function createPlaylist(name = "New Playlist", description = "", isPublic = true, isCollaborative = false) {
	const response = await loadRequest("https://api.spotify.com/v1/me");
	if (!response["error"]) {
		const url = "https://api.spotify.com/v1/users/" + response.id + "/playlists"
		return await postRequest(url, {}, {
			"name": name,
			"public": isPublic,
			"collaborative": isCollaborative,
			"description": description
		})
	}
	return response;
}

async function addTracksToPlaylist(playlistId, trackUris) {
	const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks"
	return await postRequest(url, {
		"uris": trackUris
	})
}

async function addCoverImageToPlaylist(playlistId, imageUrl) {
	const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/images"
	return await putRequest(url, {}, base64FromImageUrl(imageUrl))
}

function base64FromImageUrl(url) {
	return "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="
}

function generateRandomString(length) {
	let text = '';
	let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

function getParamsFromURL(new_url) {
	try {
		let hashParams = getHashParams()
		if (hashParams["raw_hash"] !== '') {
			sessionStorage.setItem('access_token', hashParams["access_token"]);
			sessionStorage.setItem('received_state', hashParams["state"]);
			sessionStorage.setItem('raw_hash', hashParams["raw_hash"]);
			sessionStorage.setItem('expires_at', Date.now() + (parseInt(hashParams["expires_in"]) * 1000));
		}
		window.history.replaceState({}, document.title, new_url);
		return true;
	} catch (err) {
		console.log(err.message)
		return false;
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

async function getUserInfo() {
	const url = "https://api.spotify.com/v1/me";
	const response = await loadRequest(url);
	if (!response["error"]) {
		if (response.images.length == 0) {
			response.images.push({
				url: guestProfileImage,
			});
		}
		return response;
	}
}

function shareBracket(bracketId, artistName) {
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
	loadRequest,
	postRequest,
	putRequest,
	popularitySort,
	removeDuplicatesWithKey,
	nearestGreaterPowerOf2,
	nearestLesserPowerOf2,
	switchEveryOther,
	shuffleArray,
	getParamsFromURL,
	generateRandomString,
	createPlaylist,
	addTracksToPlaylist,
	addCoverImageToPlaylist,
	shareBracket,
	getUserInfo
}