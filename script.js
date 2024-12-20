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

var inputs = document.getElementsByClassName("input-input");

for (let x = 0; x < inputs.length; x++) {
	inputs[x].value = "##.#%";
}

var data_raw = readFile("data.csv").split("\r").join("").split("\n").join(",").split(",");

var seatName = [];
var seatID = [];
var pop_cnt = [];

var lpc_vote = [];
var cpc_vote = [];
var ndp_vote = [];
var grn_vote = [];
var ppc_vote = [];
var bqc_vote = [];
var oth_vote = [];

var total_votes = [];

var parties = ["LPC", "CPC", "NDP", "GRN", "PPC", "BQC", "OTH"];

for (let x = 1; x < data_raw.length / 11; x++) {
	seatName[x - 1] = data_raw[0 + x * 11];
	seatID[x - 1] = data_raw[1 + x * 11];

	pop_cnt[x - 1] = parseInt(data_raw[10 + x * 11]);

	lpc_vote[x - 1] = parseInt(data_raw[2 + x * 11]);
	cpc_vote[x - 1] = parseInt(data_raw[3 + x * 11]);

	total_votes[x - 1] = parseInt(data_raw[9 + x * 11]);
}

for (x = 0; x < 343; x++) {
	lpc_vote[x] = lpc_vote[x] / total_votes[x];

	lpc_vote[x] = fourDecRound(lpc_vote[x]);

	cpc_vote[x] = cpc_vote[x] / total_votes[x];

	cpc_vote[x] = fourDecRound(cpc_vote[x]);
}

document.addEventListener("DOMContentLoaded", function () {
	// get first <object>
	const objTag = document.querySelector(".svgmap");

	// wait for SVG to load

	objTag.addEventListener("load", () => {
		// reference to SVG document

		var svgDoc = objTag.contentDocument;

		SVGMAP = svgDoc.documentElement;

		var top = 0.7;

		var bot = 0.2;

		var decrement = 0.05;

		var bucketNum = Math.round((top - bot) / decrement);

		var hex = "#ea6d6a";

		var minShade = -60;
		var maxShade = 60;

		for (let x = 0; x < seatID.length; x++) {
			var val = Math.ceil((top - lpc_vote[x]) / decrement);

			fillSeat(seatID[x], shadeColor(hex, val * ((maxShade - minShade) / bucketNum) + minShade));

			if (lpc_vote[x] > top) {
				fillSeat(seatID[x], shadeColor(hex, minShade));
			}
			if (lpc_vote[x] < bot) {
				fillSeat(seatID[x], shadeColor(hex, maxShade));
			}
		}

		var t = document.getElementById("fr-box-top").querySelectorAll("p");

		for (let x = 0; x < 343; x++) {
			SVGMAP.getElementById(seatID[x]).addEventListener("click", () => {
				t[4].innerText = fourDecRound(lpc_vote[x] * 100) + "%";
				t[5].innerText = fourDecRound(cpc_vote[x] * 100) + "%";
			});
		}
	});
});
