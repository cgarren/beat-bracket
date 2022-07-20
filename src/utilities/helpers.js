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

function popularitySort(track1, track2) {
	if (track1.popularity > track2.popularity) { return -1 };
	if (track1.popularity < track2.popularity) { return 1 };
	return 0;
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

export {
	loadRequest,
	popularitySort,
	removeDuplicatesWithKey
}