var inputs = document.getElementsByClassName("input-input");

for (let x = 0; x < inputs.length; x++) {
	inputs[x].value = "##.#%";
}

var data_raw = readFile("data.csv").split("\r").join("").split("\n").join(",").split(",");

var seats = { name: [], id: [] };

var vote = {};
var vote_percent = {};

var hex = { lpc: "#ea6d6a", cpc: "#6495ec", ndp: "#d17732", grn: "#10c25b", ppc: "#6f5d9a", bqc: "#19bfd2", oth: "#898989" };

var total_votes = [];

var parties = ["lpc", "cpc", "ndp", "grn", "ppc", "bqc", "oth"];

var seatWinner = [];

for (let y = 0; y < parties.length; y++) {
	Object.defineProperty(vote, parties[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(vote_percent, parties[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
}

// 11 columns, removes header line

data_raw = data_raw.slice(11, data_raw.length);

for (let x = 0; x < data_raw.length / 11; x++) {
	seats.name[x] = data_raw[0 + x * 11];
	seats.id[x] = data_raw[1 + x * 11];

	for (let y = 0; y < parties.length; y++) {
		vote[parties[y]][x] = parseInt(data_raw[2 + y + x * 11]);
	}

	total_votes[x] = parseInt(data_raw[9 + x * 11]);
}

for (x = 0; x < seats.id.length; x++) {
	Object.keys(vote_percent).forEach((key) => {
		vote_percent[key][x] = vote[key][x] / total_votes[x];
		vote_percent[key][x] = fourDecRound(vote_percent[key][x]);
	});
	var max = 0;
	Object.keys(vote_percent).forEach((key) => {
		if (vote_percent[key][x] > max) {
			max = vote_percent[key][x];
			seatWinner[x] = key;
		}
	});
}

document.addEventListener("DOMContentLoaded", function () {
	// get first <object>
	const objTag = document.querySelector(".svgmap");

	// wait for SVG to load

	objTag.addEventListener("load", () => {
		// reference to SVG document

		var svgDoc = objTag.contentDocument;

		SVGMAP = svgDoc.documentElement;

		for (let x = 0; x < seats.id.length; x++) {
			var val = Math.ceil((rangeTop - vote_percent[seatWinner[x]][x]) / decrement);
			fillSeat(seats.id[x], shadeColor(hex[seatWinner[x]], val * ((maxShade - minShade) / bucketNum) + minShade));

			if (vote_percent[seatWinner[x]][x] > rangeTop) {
				fillSeat(seats.id[x], shadeColor(hex[seatWinner[x]], minShade));
			} else if (vote_percent[seatWinner[x]][x] < rangeBottom) {
				fillSeat(seats.id[x], shadeColor(hex[seatWinner[x]], maxShade + (maxShade - minShade) / bucketNum));
			}
			if (vote_percent[seatWinner[x]][x] == 0) {
				fillSeat(seats.id[x], "#8a8a8a");
			}
		}

		var e = document.getElementsByClassName("seatVote");

		for (let x = 0; x < seats.id.length; x++) {
			SVGMAP.getElementById(seats.id[x]).addEventListener("click", () => {
				document.getElementById("SeatName").innerText = seats.name[x];

				for (let z = 0; z < parties.length; z++) {
					e[z].innerText = fourDecRound(vote_percent[parties[z]][x] * 100).toFixed(2) + "%";
				}
			});
		}
	});
});
