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

//const baseUrl = "https://qaitethka4gbvvogua47rq6qqa0xavjk.lambda-url.us-east-2.on.aws"
const baseUrl = "https://hsadrgb5uxnxfsswuxpcdrfblq0cydjv.lambda-url.us-east-2.on.aws"

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

	let response;
	try {
		response = await fetch(url, requestOptions);
	} catch (error) {
		console.error(error);
		throw new Error("Network error");
	}
	if (!response.ok) {
		const errorMessage = await response.text();
		if (errorMessage) {
			throw new Error(errorMessage, { cause: { code: response.status } });
		} else {
			throw new Error("Unknown error");
		}
	}
	return response;
}

export async function getBrackets() {
	const response = await loadBackendRequest("/brackets", "GET");
	return response.json();
}

export async function getBracket(id, userId) {
	const response = await loadBackendRequest("/bracket", "GET", { id: id, ownerId: userId });
	return response.json();
}

export async function getTemplate(id, userId) {
	const response = await loadBackendRequest("/template", "GET", { id: id, ownerId: userId });
	return response.json();
}

export async function createBracket(bracket) {
	await loadBackendRequest("/bracket", "PUT", { ownerId: getUserId(), sessionId: getSessionId() }, bracket);
	console.debug("Written Bracket:", bracket);
}

export async function updateBracket(id, updateObject) {
	await loadBackendRequest("/bracket", "PATCH", { id: id, ownerId: getUserId(), sessionId: getSessionId() }, updateObject);
}

export async function deleteBracket(id) {
	await loadBackendRequest("/bracket", "DELETE", { id: id, ownerId: getUserId(), sessionId: getSessionId() });
}

export function getMaxBrackets() {
	// eventually make this a call to the backend
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
	const { maxBrackets } = await response.json();
	sessionStorage.setItem(maxBracketsKey, maxBrackets);
}