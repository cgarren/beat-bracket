// const schema = [
// 	{
// 		"id": 0,
// 		"userId": 6,
// 		"artistId": "test",
// 		"artistName": "Kanye West",
// 		"tracks": 64,
// 		"seeding": "popularity",
// 		"lastModifiedDate": 3948230948,
// 		"completed": false,
// 		"bracketData": "some data",
// 	},

import { getUserId, getSessionId } from "./authentication";

const maxBracketsKey = "max_brackets";

const baseUrl = "https://qaitethka4gbvvogua47rq6qqa0xavjk.lambda-url.us-east-2.on.aws"

async function loadBackendRequest(path, method, params = { ownerId: getUserId(), sessionId: getSessionId() }, data, headers = {}, credentials) {
	let url = baseUrl + path
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	let requestOptions = {
		method: method,
		headers: headers,
	}
	if (credentials) {
		requestOptions.credentials = credentials;
	}
	if (data) {
		requestOptions.body = JSON.stringify(data);
	}
	try {
		return await fetch(url, requestOptions);
	} catch (error) {
		console.error(error);
		return {
			ok: false
		}
	}
}

export async function getBrackets() {
	const response = await loadBackendRequest("/brackets", "GET");
	if (response.ok) {
		return response.json();
	} else {
		return 1;
	}
}

export async function getBracket(id, userId) {
	const response = await loadBackendRequest("/bracket", "GET", { id: id, ownerId: userId });
	if (response.ok) {
		return response.json();
	} else if (response.status === 404) {
		return null
	} else {
		return 1;
	}
}

export async function createBracket(bracket) {
	console.debug("Written Bracket:", bracket);
	const response = await loadBackendRequest("/bracket", "PUT", { ownerId: getUserId(), sessionId: getSessionId() }, bracket);
	if (response.ok) {
		return 0;
	} else {
		return 1;
	}
}

export async function updateBracket(id, updateObject) {
	const response = await loadBackendRequest("/bracket", "PATCH", { id: id, ownerId: getUserId(), sessionId: getSessionId() }, updateObject);
	if (response.ok) {
		return 0;
	} else if (response.status === 404) {
		return null
	} else {
		return 1;
	}
}

export async function deleteBracket(id) {
	const response = await loadBackendRequest("/bracket", "DELETE", { id: id, ownerId: getUserId(), sessionId: getSessionId() });
	if (response.ok) {
		return 0;
	} else if (response.status === 404) {
		return null
	} else {
		return 1;
	}
}

export function getMaxBrackets() {
	if (typeof window !== 'undefined') {
		return sessionStorage.getItem(maxBracketsKey);
	}
	return null;
}

export async function authenticate(userId, sessionId, expireTime, accessToken) {
	const response = await loadBackendRequest("/auth", "POST", null, {
		userId: userId,
		sessionId: sessionId,
		expireTime: expireTime,
		accessToken: accessToken
	}, {}, 'include');
	if (response.ok) {
		const { maxBrackets } = await response.json();
		sessionStorage.setItem(maxBracketsKey, maxBrackets);
		return 0;
	} else {
		return 1;
	}
}