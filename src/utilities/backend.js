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

async function loadBackendRequest(path, method, params, data = {}, headers = {}) {
	let url = "https://hsadrgb5uxnxfsswuxpcdrfblq0cydjv.lambda-url.us-east-2.on.aws" + path
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	let requestOptions = {
		method: method,
		headers: headers,
	}
	if (method === "PUT" || method === "DELETE") {
		requestOptions.body = JSON.stringify(data);
	}
	const response = await fetch(url, requestOptions);

	return response; // parses JSON response into native JavaScript objects
}

async function getBrackets(userId) {
	const response = await loadBackendRequest("/items", "GET", { userId: userId });
	if (response.ok) {
		return response.json();
	} else {
		return 1;
	}
}

async function getBracket(id, userId) {
	const response = await loadBackendRequest("/item", "GET", { id: id, userId: userId });
	if (response.ok) {
		return response.json();
	} else if (response.status === 404) {
		return null
	} else {
		return 1;
	}
}

async function writeBracket(bracket) {
	console.log(bracket);
	const response = await loadBackendRequest("/item", "PUT", undefined, bracket);
	if (response.ok) {
		return 0;
	} else {
		return 1;
	}
}

async function updateBracket(id, artistName, artistId, tracks, seeding) {
	await new Promise(resolve => setTimeout(resolve, 5000)); //simulate network loading
	const updatedBracket = { id: id, artistName: artistName, artistId: artistId, tracks: tracks, seeding: seeding, lastModified: Date.now(), complete: false };
	return updatedBracket;
}

async function deleteBracket(id, userId) {
	const response = await loadBackendRequest("/item", "DELETE", { id: id, userId: userId });
	if (response.ok) {
		return 0;
	} else if (response.status === 404) {
		return null
	} else {
		return 1;
	}
}

export { getBrackets, getBracket, writeBracket, deleteBracket };