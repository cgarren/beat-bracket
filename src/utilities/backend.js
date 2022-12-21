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
// 		"bracketData": "some data"
// 	},

async function loadBackendRequest(path, method, params = {}, data = {}) {
	let url = "https://hsadrgb5uxnxfsswuxpcdrfblq0cydjv.lambda-url.us-east-2.on.aws" + path
	if (params) {
		url = url + "?" + new URLSearchParams(params);
	}
	let requestOptions = {
		method: method,
		headers: {},
	}
	if (method === "POST" || method === "DELETE") {
		requestOptions.body = JSON.stringify(data);
	}
	console.log(url);
	const response = await fetch(url, requestOptions);

	if (response.ok) {
		console.log(response);
		return response.json(); // parses JSON response into native JavaScript objects
	} else {
		throw new Error("Unknown request error. Code: " + response.status);
	}
}

async function getBrackets() {
	const loadedBrackets = await loadBackendRequest("/items", "GET");
	console.log(loadedBrackets);
	return loadedBrackets;
}

async function getBracket(id, userId) {
	const loadedBracket = await loadBackendRequest("/item", "GET", { id: id, userId: userId });
	console.log(loadedBracket);
	return loadedBracket;
}

async function createBracket(artistName, artistId, tracks, seeding) {
	await new Promise(resolve => setTimeout(resolve, 5000)); //simulate network loading
	const createdBracket = { id: 1, artistName: artistName, artistId: artistId, tracks: tracks, seeding: seeding, lastModified: Date.now(), complete: false };
	return createdBracket;
}

async function updateBracket(id, artistName, artistId, tracks, seeding) {
	await new Promise(resolve => setTimeout(resolve, 5000)); //simulate network loading
	const updatedBracket = { id: id, artistName: artistName, artistId: artistId, tracks: tracks, seeding: seeding, lastModified: Date.now(), complete: false };
	return updatedBracket;
}

export { getBrackets, getBracket };