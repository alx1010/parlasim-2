// Initial setup, reading data and parsing

var data_raw = readFile("data.csv").split("\r").join("").split("\n").join(",").split(",");

var seats = { name: [], id: [] };

var vote = {};
var vote_percent = {};

var total_votes = [];

var hex = { lpc: "#ea6d6a", cpc: "#6495ec", ndp: "#EF7C01", grn: "#10c25b", ppc: "#6f5d9a", bqc: "#19bfd2", oth: "#898989" };

var parties = ["lpc", "cpc", "ndp", "grn", "ppc", "bqc", "oth"];

var seatWinner = [];
var seatMargin = [];

// todo regions

// arranged by order in data file
// territories are set to use pv swing due to low regional data

var regions = {
	name: ["BC", "AB", "PR", "ON", "QC", "ATL", "TR"],
	seats: [43, 37, 28, 122, 78, 32, 3],
	usePvSwing: [false, false, false, false, false, false, true],
};
var regionVotes = {};
var regionSeats = {};

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
	Object.defineProperty(regionVotes, parties[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(regionSeats, parties[y], {
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

// Creates initial vote percent object using inital raw votes
// vote_percent can be freely edited further in code while vote is held as the inital value

for (x = 0; x < seats.id.length; x++) {
	Object.keys(vote_percent).forEach((key) => {
		vote_percent[key][x] = vote[key][x] / total_votes[x];
		vote_percent[key][x] = fourDecRound(vote_percent[key][x]);
	});
}

// Finds winner and margin of victory

function findWinnerAndMargin() {
	for (x = 0; x < seats.id.length; x++) {
		var max = 0;
		var secondMax = 0;

		Object.keys(vote_percent).forEach((key) => {
			if (vote_percent[key][x] > max) {
				max = vote_percent[key][x];
				seatWinner[x] = key;
			}
		});

		Object.keys(vote_percent).forEach((key) => {
			if (vote_percent[key][x] > secondMax && vote_percent[key][x] != max) {
				secondMax = vote_percent[key][x];
			}
		});

		seatMargin[x] = fourDecRound(max - secondMax);
	}
}

document.addEventListener("DOMContentLoaded", function () {
	// get first <object>
	const objTag = document.querySelector(".svgmap");

	// wait for SVG to load

	objTag.addEventListener("load", () => {
		// reference to SVG document

		var svgDoc = objTag.contentDocument;

		SVGMAP = svgDoc.documentElement;

		findWinnerAndMargin();

		DisplayNationalSeatCount();

		InitializeRegions();

		RefreshMap();

		IntializeRegionalInputs();
		IntializeRegionalSeatCounts();

		// enables clicking on seat to see results

		var e = document.getElementsByClassName("seatVote");

		for (let x = 0; x < seats.id.length; x++) {
			SVGMAP.getElementById(seats.id[x]).addEventListener("click", () => {
				document.getElementById("SeatName").innerText = seats.name[x];

				for (let z = 0; z < parties.length; z++) {
					e[z].innerText = fourDecRound(vote_percent[parties[z]][x] * 100).toFixed(2) + "%";
				}
			});
		}

		// start with first seat 'clicked'

		document.getElementById("SeatName").innerText = seats.name[0];

		for (let z = 0; z < parties.length; z++) {
			e[z].innerText = fourDecRound(vote_percent[parties[z]][0] * 100).toFixed(2) + "%";
		}
	});
});

// Beginning of Popular Vote Text setup

var pv = [];

for (let p = 0; p < parties.length; p++) {
	pv[p] = vote[parties[p]].reduce((a, b) => a + b, 0);
	pv[p] = fourDecRound(pv[p] / total_votes.reduce((a, b) => a + b, 0));
}

var pvText = document.getElementsByClassName("pvVote");

for (let p = 0; p < parties.length; p++) {
	pvText[p].innerText = fourDecRound(pv[p] * 100) + "%";
}

// National seat results setup

function DisplayNationalSeatCount() {
	var natSeats = [];

	for (let p = 0; p < parties.length; p++) {
		natSeats[p] = 0;

		for (let x = 0; x < seats.id.length; x++) {
			if (seatWinner[x] == parties[p]) {
				natSeats[p]++;
			}
		}
	}

	var natSeatsText = document.getElementsByClassName("natSeats");

	for (let p = 0; p < parties.length; p++) {
		natSeatsText[p].innerText = natSeats[p];
	}
}

// regions setup

function InitializeRegions() {
	var running = 0;
	var regionSum = [];

	for (let r = 0; r < regions.name.length; r++) {
		regionSum[r] = 0;
		for (let p = 0; p < parties.length; p++) {
			regionVotes[parties[p]][r] = 0;
			regionSeats[parties[p]][r] = 0;

			for (let x = running; x < running + regions.seats[r]; x++) {
				regionVotes[parties[p]][r] += vote[parties[p]][x];

				if (seatWinner[x] == parties[p]) {
					regionSeats[parties[p]][r]++;
				}
			}

			regionSum[r] += regionVotes[parties[p]][r];
		}
		for (let p = 0; p < parties.length; p++) {
			regionVotes[parties[p]][r] = fourDecRound(regionVotes[parties[p]][r] / regionSum[r]);
		}

		running += regions.seats[r];
	}
}

var regionsWithRegionalSwing = 0;

for (let r = 0; r < regions.name.length; r++) {
	if (regions.usePvSwing[r] == false) {
		regionsWithRegionalSwing++;
	}
}

var inputs = document.getElementsByClassName("input-input");

function IntializeRegionalInputs() {
	// regional inputs

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;

			if (parties[p] == "bqc" && regions.name[r] != "QC") {
				inputs[inputPointer].disabled = true;
			}
			if (parties[p] == "oth") {
				inputs[inputPointer].disabled = true;
			}
			inputs[inputPointer].value = fourDecRound(regionVotes[parties[p]][r] * 100) + "%";
		}
	}
}

var regionalSeats = document.getElementsByClassName("regional-seats");

function IntializeRegionalSeatCounts() {
	// regional seat counts

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;

			if (parties[p] == "bqc" && regions.name[r] != "QC") {
				regionalSeats[inputPointer].innerText = "~";
			} else {
				regionalSeats[inputPointer].innerText = regionSeats[parties[p]][r];
			}
		}
	}
}

// Grabbing new values for swing

function Swing() {
	var c = 0;
	var running = 0;

	var vpv = [];

	for (let p = 0; p < parties.length; p++) {
		vpv[p] = 0;
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let x = running; x < running + regions.seats[r]; x++) {
			var sum = 0;

			var v = [];

			for (let p = 0; p < parties.length; p++) {
				var inputPointer = parties.length * r + p;

				if (vote[parties[p]][x] == 0) {
					v[p] = 0;
				} else {
					var shift = fourDecRound(parsePercentage(inputs[inputPointer].value) / regionVotes[parties[p]][r]);

					v[p] = Math.round(vote[parties[p]][x] * shift);

					sum += v[p];
					vpv[p] += v[p];
				}
			}

			for (let p = 0; p < parties.length; p++) {
				vote_percent[parties[p]][x] = fourDecRound(v[p] / sum);

				//console.log(vote_percent[parties[p]][x]);
			}
		}

		running += regions.seats[r];
	}

	for (let x = 340; x < seats.id.length; x++) {
		for (let p = 0; p < parties.length; p++) {
			vpv[p] += vote[parties[p]][x];
		}
	}

	var xvpv = [];

	for (let p = 0; p < parties.length; p++) {
		xvpv[p] = fourDecRound(vpv[p] / vpv.reduce((a, b) => a + b, 0));
	}

	console.log(xvpv);
	console.log(pv);

	for (let x = 340; x < seats.id.length; x++) {
		var sum = 0;

		for (let p = 0; p < parties.length; p++) {
			var shift = fourDecRound(xvpv[p] / pv[p]);

			v[p] = Math.round(vote[parties[p]][x] * shift);
			sum += v[p];
		}

		for (let p = 0; p < parties.length; p++) {
			vote_percent[parties[p]][x] = fourDecRound(v[p] / sum);
		}
	}

	findWinnerAndMargin();
	RefreshMap();

	DisplayNationalSeatCount();

	RefreshRegionalSeats();

	RefreshPopularVoteCount(xvpv);
}

function RefreshMap() {
	for (let x = 0; x < seats.id.length; x++) {
		var val = Math.ceil((rangeTop - vote_percent[seatWinner[x]][x]) / decrement);

		fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, val - 5));

		if (vote_percent[seatWinner[x]][x] > rangeTop) {
			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, -6));
		} else if (vote_percent[seatWinner[x]][x] < rangeBottom) {
			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, 6));
		}
		if (vote_percent[seatWinner[x]][x] == 0) {
			fillSeat(seats.id[x], "#8a8a8a");
		}
	}
}

function RefreshRegionalSeats() {
	var running = 0;

	for (let r = 0; r < regions.name.length; r++) {
		for (let p = 0; p < parties.length; p++) {
			regionSeats[parties[p]][r] = 0;

			for (let x = running; x < running + regions.seats[r]; x++) {
				if (seatWinner[x] == parties[p]) {
					regionSeats[parties[p]][r]++;
				}
			}
		}
		running += regions.seats[r];
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;

			if (parties[p] == "bqc" && regions.name[r] != "QC") {
				regionalSeats[inputPointer].innerText = "~";
			} else {
				regionalSeats[inputPointer].innerText = regionSeats[parties[p]][r];
			}
		}
	}
}

function RefreshPopularVoteCount(arr) {
	for (let p = 0; p < parties.length; p++) {
		pvText[p].innerText = fourDecRound(arr[p] * 100) + "%";
	}
}
