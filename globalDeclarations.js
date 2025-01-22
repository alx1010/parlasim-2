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

function SaveFile(content, fileName) {
	// Create element with <a> tag
	const link = document.createElement("a");

	// Create a blog object with the file content which you want to add to the file
	const file = new Blob([content], { type: "text/plain" });

	// Add file content in the object URL
	link.href = URL.createObjectURL(file);

	// Add file name
	link.download = fileName;

	// Add click event to <a> tag to save file.
	link.click();
	URL.revokeObjectURL(link.href);
}

function fillSeat(ID, colourHex) {
	SVGMAP.getElementById(ID).style.fill = colourHex;
}

function fourDecRound(value) {
	value = Math.round(value * 10000) / 10000;
	return value;
}

function parsePercentage(value) {
	value = fourDecRound(parseFloat(value) / 100);
	return value;
}

var rangeTop = 0.7;
var rangeBottom = 0.2;

var decrement = 0.05;

// for png export
// can be edited via console
var scalar = 10;

// Treating each section as a bucket helps visualize pieces

var bucketNum = Math.round((rangeTop - rangeBottom) / decrement);
