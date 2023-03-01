// Library to get prominent colors from images (for coloring bracket spaces according to album art)
import Vibrant from "node-vibrant";

import {
	nearestGreaterPowerOf2,
	nearestLesserPowerOf2,
} from "./helpers";

// Function to get the prominent colors from an image
async function getColorsFromImage(image) {
	//const color = await new FastAverageColor().getColorAsync(image)
	const color = (await Vibrant.from(image).getPalette()).Vibrant
	return {
		// backgroundColor: color.hex,
		// textColor: color.isDark ? 'white' : 'black'
		backgroundColor: color.getHex(),
		textColor: color.getBodyTextColor()
	}
}

async function relateSongs(len, theTracks, col, side, otherSide) {
	let colMap = new Map();
	for (let i = 0; i < len; i++) {
		let colorObj = null;
		if (theTracks && theTracks[i]) {
			colorObj = await getColorsFromImage(theTracks[i].art)
		}
		colMap.set(side + col + i, {
			song: theTracks ? (theTracks[i] ? theTracks[i] : null) : null,
			opponentId:
				len <= 1
					? otherSide + col + 0
					: side + col + (i % 2 === 0 ? i + 1 : i - 1),
			nextId: len <= 1 ? null : side + (col + 1) + Math.floor(i / 2),
			previousIds:
				col === 0
					? []
					: [
						side + (col - 1) + Math.ceil(i * 2),
						side + (col - 1) + (Math.ceil(i * 2) + 1),
					],
			id: side + col + i,
			col: col,
			side: side,
			index: i,
			disabled: col === 0 && theTracks[i] ? false : true,
			winner: false,
			eliminated: false,
			color: colorObj
		});
	}
	return colMap;
}

async function fillBracket(tracks, cols) {
	let i = 0;
	let forward = true;
	let repeated = false;
	let temp = new Map();

	while (i >= 0) {
		const len = nearestGreaterPowerOf2(tracks.length) / 2 ** (i + 1) / 2;
		let theTracks = new Array(len);
		if (i >= cols - 1) {
			if (!repeated) {
				repeated = true;
				temp = new Map([
					...(await relateSongs(len, theTracks, i, "l", "r")),
					...temp,
				]);
				forward = false;
				continue;
			}
		}

		if (i === 0) {
			if (forward) {
				theTracks = tracks.slice(0, Math.ceil(tracks.length / 2));
				//console.log(theTracks);
			} else {
				theTracks = tracks.slice(-Math.floor(tracks.length / 2));
				//console.log(theTracks);
			}
		}

		if (forward) {
			temp = new Map([
				...(await relateSongs(len, theTracks, i, "l", "r")),
				...temp,
			]);
			i++;
		} else {
			temp = new Map([
				...(await relateSongs(len, theTracks, i, "r", "l")),
				...temp,
			]);
			i--;
		}
	}
	return temp;
}

function getNumberOfColumns(numItems) {
	let cols = Math.ceil(
		Math.log(nearestLesserPowerOf2(numItems)) / Math.log(2)
	);
	return cols;
}

export {
	relateSongs,
	fillBracket,
	getNumberOfColumns,
	getColorsFromImage
}