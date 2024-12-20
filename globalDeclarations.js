function readFile(file) {
	var rawText = "";
	var rawFile = new XMLHttpRequest();
	rawFile.open("GET", file, false);
	rawFile.onreadystatechange = function () {
		if (rawFile.readyState === 4) {
			// readyState = 4: request finished and response is ready
			if (rawFile.status === 200) {
				// status 200: "OK"
				rawText = rawFile.responseText;
			}
		}
	};
	rawFile.send(null); //Sends the request to the server Used for GET requests with param null
	return rawText;
}

function fillSeat(ID, colourHex) {
	SVGMAP.getElementById(ID).style.fill = colourHex;
}

function fourDecRound(value) {
	value = Math.round(value * 10000) / 10000;
	return value;
}

var rangeTop = 0.7;
var rangeBottom = 0.2;

var decrement = 0.05;

// Treating each section as a bucket helps visualize pieces

var bucketNum = Math.round((rangeTop - rangeBottom) / decrement);

// Range of shades in percentage terms

var minShade = -60;
var maxShade = 60;
