// Guest profile pic
import guestProfileImage from "../assets/images/guestProfileImage.png";
import { checkAuth } from "./helpers";

async function loadSpotifyRequest(url, params) {
	if (checkAuth()) {
		if (params) {
			url = url + "?" + new URLSearchParams(params);
		}
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
			}
		});

		if (response.ok) {
			return response.json(); // parses JSON response into native JavaScript objects
		} else {
			return 1;
		}
	} else {
		return 1;
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
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
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
			'Authorization': 'Bearer ' + sessionStorage.getItem('accessToken')
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
	const response = await loadSpotifyRequest("https://api.spotify.com/v1/me");
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

async function getUserInfo(userId = undefined) {
	let url = "https://api.spotify.com/v1/me";
	if (userId) {
		url = "https://api.spotify.com/v1/users/" + userId;
	}
	const response = await loadSpotifyRequest(url);
	if (response !== 1) {
		if (response.images.length === 0) {
			response.images.push({
				url: guestProfileImage,
			});
		}
		return response;
	} else {
		return 1;
	}
}

async function isCurrentUser(userId) {
	const currentUser = await getUserInfo();
	if (userId === currentUser.id) {
		return true;
	} else {
		return false;
	}
}

export {
	loadSpotifyRequest,
	postRequest,
	putRequest,
	addTracksToPlaylist,
	createPlaylist,
	getUserInfo,
	isCurrentUser
}