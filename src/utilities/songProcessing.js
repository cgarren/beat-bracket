import { loadSpotifyRequest, popularitySort, shuffleArray, switchEveryOther } from "./helpers";

function seedBracket(trackList, seedingMethod) {
	switch (seedingMethod) {
		case "random":
			return shuffleArray(trackList);
		case "popularity":
			trackList.sort(popularitySort);
			//console.table(trackList);
			return switchEveryOther(trackList);
		default:
			return trackList;
	}
}

async function selectTrackVersion(numTracks, tracks) {
	let highestPop = 0;
	let selectedTrack = null;
	for (let i = 0; i < numTracks; i++) {
		const track = tracks.shift();
		if (track.popularity >= highestPop) {
			selectedTrack = track;
			highestPop = track.popularity;
		}
	}
	return selectedTrack;
}

async function makeTrackObject(track) {
	return {
		name: track.name,
		art: track.album.images[2].url,
		id: track.id,
		popularity: track.popularity,
		preview_url: track.preview_url
	}
}

async function loadTrackData(idList, trackOptionsAmounts) {
	let templist = [];
	if (idList.length !== 0) {
		const url = "https://api.spotify.com/v1/tracks?ids=" + idList.join();
		const response = await loadSpotifyRequest(url);
		if (!response["error"] && response.tracks.length > 0) {
			for (let numTracks of trackOptionsAmounts) {
				//console.log(numTracks, response.tracks.length, idList);
				const selectedTrack = await selectTrackVersion(numTracks, response.tracks)
				templist.push(await makeTrackObject(selectedTrack));
			}
		}
	}
	return templist;
}

async function processTracks(songs) {
	let templist = [];
	let runningList = [];
	let trackOptionsAmounts = [];
	for (const idList of Object.values(songs)) {
		if (runningList.length + idList.length > 50) {
			templist.push(...await loadTrackData(runningList, trackOptionsAmounts));
			runningList = [];
			trackOptionsAmounts = [];
		}
		runningList.push(...idList);
		trackOptionsAmounts.push(idList.length);
	}
	templist.push(...await loadTrackData(runningList, trackOptionsAmounts));
	return templist;
}

async function loadTracks(url, songs) {
	let response = await loadSpotifyRequest(url);
	if (!response["error"] && response.albums.length > 0) {
		response.albums.forEach((album) => {
			if (album.images.length > 0) {
				// Iterate through the tracks
				album.tracks.items.forEach((track) => {
					// Check if the track already exists
					if (track.name in songs) {
						songs[track.name].push(track.id);
					} else {
						songs[track.name] = [track.id];
					}
				})
			}
		});
	}
}

async function loadAlbums(url, songs = {}) {
	let response = await loadSpotifyRequest(url);
	//console.log(response);
	if (!response["error"] && response.items.length > 0) {
		let albumIds = [];
		response.items.forEach((item) => {
			albumIds.push(item.id);
		});
		let tracksurl =
			"https://api.spotify.com/v1/albums?ids=" + albumIds.join();
		await loadTracks(tracksurl, songs); // saves 
	}
	if (response.next) {
		await loadAlbums(response.next, songs);
	}
	return songs;
}

export { seedBracket, loadAlbums, processTracks }