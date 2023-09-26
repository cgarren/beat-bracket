// Guest profile pic
import guestProfileImage from "../assets/images/guestProfileImage.png";
import defaultPlaylistImage from "../assets/images/defaultPlaylistImage.png";
import { generateRandomString } from "./helpers";
import { getAccessToken, getUserId, isLoggedIn } from "./authentication";

//auth storage keys
const codeVerifierKey = "spotify_auth_code_verifier";
const stateKey = "spotify_auth_state";
//auth constants
const clientId = "fff2634975884bf88e3d3c9c2d77763d";
const redirectUri = typeof window !== 'undefined' ? window.location.origin + "/my-brackets" : "https://www.beatbracket.com/my-brackets";
const scope =
	"playlist-modify-private playlist-modify-public user-read-private playlist-read-private playlist-read-collaborative";
const codeChallengeMethod = "S256";

export async function loadSpotifyRequest(url, params) {
	if (isLoggedIn() !== false) { // keep going if logged in or if login is processing
		if (params) {
			url = url + "?" + new URLSearchParams(params);
		}
		const response = await fetch(url, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + getAccessToken()
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

export async function postRequest(url, params, data) {
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + getAccessToken()
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

export async function putRequest(url, params, data) {
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'image/jpeg',
			'Authorization': 'Bearer ' + getAccessToken()
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

export async function getArt(imageArray, type, getlargest = false) {
	if (imageArray && imageArray.length > 0) {
		if (getlargest) {
			for (let i = 0; i < imageArray.length; i++) {
				if (imageArray[i].url) {
					return imageArray[i].url;
				}
			}
		} else {
			for (let i = imageArray.length - 1; i >= 0; i--) {
				if (imageArray[i].url) {
					return imageArray[i].url;
				}
			}
		}
	}
	if (type === "playlist") {
		return defaultPlaylistImage;
	}
	return null;
}

export async function createPlaylist(name = "New Playlist", description = "", isPublic = true, isCollaborative = false) {
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

export async function addTracksToPlaylist(playlistId, trackUris) {
	const url = "https://api.spotify.com/v1/playlists/" + playlistId + "/tracks"
	return await postRequest(url, {
		"uris": trackUris
	})
}

export async function getUserInfo(userId = undefined) {
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

export function isCurrentUser(userId) {
	if (userId === getUserId()) {
		return true;
	} else {
		return false;
	}
}

async function generateCodeChallenge(codeVerifier) {
	function base64encode(string) {
		return window.btoa(String.fromCharCode.apply(null, new Uint8Array(string)))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	}

	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);
	const digest = await window.crypto.subtle.digest('SHA-256', data);

	return base64encode(digest);
}

//AUTH FUNCTIONS

export async function login() {
	// Generate and save state
	const state = generateRandomString(16);
	sessionStorage.setItem(stateKey, state);

	//Generate and save code verifier
	const codeVerifier = generateRandomString(128);
	sessionStorage.setItem(codeVerifierKey, codeVerifier);
	const codeChallenge = await generateCodeChallenge(codeVerifier);

	const args = new URLSearchParams({
		response_type: "code",
		client_id: clientId,
		scope: scope,
		redirect_uri: redirectUri,
		state: state,
		code_challenge_method: codeChallengeMethod,
		code_challenge: codeChallenge,
	});

	window.location = "https://accounts.spotify.com/authorize?" + args;
}

export async function loginCallback(urlParams) {
	if (urlParams && urlParams.has('code') && urlParams.get('state') === sessionStorage.getItem(stateKey)) {
		const response = await fetch('https://accounts.spotify.com/api/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			body: new URLSearchParams({
				grant_type: 'authorization_code',
				code: urlParams.get('code'),
				redirect_uri: redirectUri,
				client_id: clientId,
				code_verifier: sessionStorage.getItem(codeVerifierKey)
			})
		})
		// Make sure request is successful
		if (!response.ok) {
			throw new Error("Problem logging in");
		}
		// Parse and store data
		const data = await response.json();
		const expiresAt = Date.now() + (parseInt(data.expires_in) * 1000);
		// remove spotify auth state
		sessionStorage.removeItem(stateKey);
		// remove spotify auth code verifier
		sessionStorage.removeItem(codeVerifierKey);
		return {
			accessToken: data.access_token,
			refreshToken: data.refresh_token,
			expiresAt: expiresAt,
			state: urlParams.get('state')
		}
	} else {
		throw new Error("Invalid url params");
	}
}

export async function refreshLogin(refreshToken) {
	const response = await fetch('https://accounts.spotify.com/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			grant_type: "refresh_token",
			refresh_token: refreshToken,
			client_id: clientId
		})
	})
	// Make sure request is successful
	if (!response.ok) {
		throw new Error("Problem refreshing login");
	}
	// Parse and store data
	const data = await response.json();
	const expiresAt = Date.now() + (parseInt(data.expires_in) * 1000);
	return {
		accessToken: data.access_token,
		expiresAt: expiresAt,
		refreshToken: data.refresh_token
	}
}