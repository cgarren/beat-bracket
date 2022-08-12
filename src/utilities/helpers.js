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

function switchEveryOther(array) {
	for (let i = 1; i < array.length / 2; i+=2) {
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
  let currentIndex = array.length,  randomIndex;
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

export {
	loadRequest,
	popularitySort,
	removeDuplicatesWithKey,
	nearestGreaterPowerOf2,
	nearestLesserPowerOf2,
	switchEveryOther,
	shuffleArray
}