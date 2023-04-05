import { popularitySort, shuffleArray } from "./helpers";
import { loadSpotifyRequest } from "./spotify";

async function seedBracket(trackList, seedingMethod) {
	switch (seedingMethod) {
		case "random":
			return await shuffleArray(trackList);
		case "popularity":
			trackList.sort(popularitySort);
			//console.table(trackList);
			return await arrangeSeeds(trackList);
		default:
			return trackList;
	}
}

async function arrangeSeeds(bracketList) {
	let slice = 1;
	let temp;
	while (slice < bracketList.length / 2) {
		temp = bracketList;
		bracketList = [];

		while (temp.length > 0) {
			bracketList = bracketList.concat(temp.splice(0, slice));  // n from the beginning
			bracketList = bracketList.concat(temp.splice(-slice, slice));  // n from the end
		}

		slice = slice * 2;
	}
	return bracketList;
}

async function selectTrackVersion(numTracks, tracks, featuredList) {
	let highestPop = 0;
	let selectedTrack = null;
	for (let i = 0; i < numTracks; i++) {
		const track = tracks.shift();
		const feature = featuredList.shift();
		if (track.popularity >= highestPop) {
			selectedTrack = track;
			selectedTrack.feature = feature;
			highestPop = track.popularity;
		}
	}
	return selectedTrack;
}

async function makeTrackObject(track) {
	return {
		name: track.name,
		feature: track.feature,
		art: track.album.images[0].url,
		id: track.id,
		popularity: track.popularity,
		preview_url: track.preview_url,
	}
}

async function loadTrackData(idList, trackOptionsAmounts) {
	let templist = [];
	if (idList.length !== 0) {
		let idString = "";
		let featuredList = [];
		for (let i = 0; i < idList.length; i++) {
			idString += idList[i][0];
			if (i !== idList.length - 1) {
				idString += ",";
			}
			featuredList.push(idList[i][1]);

		}
		const url = "https://api.spotify.com/v1/tracks?ids=" + idString;
		const response = await loadSpotifyRequest(url);
		if (response !== 1) {
			if (response.tracks.length > 0) {
				for (let numTracks of trackOptionsAmounts) {
					const selectedTrack = await selectTrackVersion(numTracks, response.tracks, featuredList);
					templist.push(await makeTrackObject(selectedTrack));
				}
			}
		} else {
			return 1;
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
			const temp = await loadTrackData(runningList, trackOptionsAmounts);
			if (temp !== 1) {
				templist = templist.concat(temp);
				runningList = [];
				trackOptionsAmounts = [];
			} else {
				return 1;
			}
		}
		runningList.push(...idList);
		trackOptionsAmounts.push(idList.length);
	}
	const temp = await loadTrackData(runningList, trackOptionsAmounts);
	if (temp !== 1) {
		templist = templist.concat(temp);
	} else {
		return 1;
	}
	return templist;
}

function checkTaylorSwift(trackName, artistId) {
	// Gotta account for Taylor's Version
	if (artistId === "06HL4z0CvFAxyc27GXpf02") {
		return trackName.replace(" (Taylor’s Version)", "").replace(" (Taylor's Version)", "")
	} else {
		return trackName;
	}
}

async function loadTracks(url, songs, artistId) {
	let response = await loadSpotifyRequest(url);
	if (response !== 1) {
		if (response.albums.length > 0) {
			response.albums.forEach((album) => {
				if (album.images.length > 0) {
					// Iterate through the tracks
					album.tracks.items.forEach((track) => {
						// Iterate through the artists to make sure the artist in the bracket is acutally on the track
						for (let i = 0; i < track.artists.length; i++) {
							// Check if the artist is the one we're looking for
							if (track.artists[i].id === artistId) {
								let feature = false;
								if (i !== 0) {
									// Main artist
									feature = true;
								}

								// Check if the track is a Taylor's Version
								track.name = checkTaylorSwift(track.name, artistId);
								// Check if the track already exists
								if (track.name in songs) {
									// If it does, add the id to the list
									songs[track.name].push([track.id, feature]);
								} else {
									// If it doesn't, create a new entry
									songs[track.name] = [[track.id, feature]];
								}
								break;
							}
						}

					})
				}
			});
		}
	} else {
		return 1;
	}
}

async function loadAlbums(url, artistId, songs = {}) {
	let response = await loadSpotifyRequest(url);
	if (response !== 1) {
		if (response.items.length > 0) {
			let albumIds = [];
			response.items.forEach((item) => {
				albumIds.push(item.id);
			});
			let tracksurl =
				"https://api.spotify.com/v1/albums?ids=" + albumIds.join();
			if (await loadTracks(tracksurl, songs, artistId) === 1) {
				return 1;
			}
		}
		if (response.next) {
			if (await loadAlbums(response.next, artistId, songs) === 1) {
				return 1;
			}
		}
		return songs;
	} else {
		return 1;
	}
}

export { seedBracket, loadAlbums, processTracks }