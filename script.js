// Initial setup, reading data and parsing

var electionDataRaw = readFile("electionData.csv").split("\r").join("").split("\n").join(",").split(",");

var seats = { name: [], id: [] };

var vote = {};
var vote_percent = {};

var total_votes = [];

var hex = { lpc: "#ea6d6a", cpc: "#6495ec", ndp: "#EF7C01", grn: "#10c25b", ppc: "#6f5d9a", bqc: "#19bfd2", oth: "#898989" };

var parties = ["lpc", "cpc", "ndp", "grn", "ppc", "bqc", "oth"];

var seatWinner = [];
var seatMargin = [];

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

electionDataRaw = electionDataRaw.slice(11, electionDataRaw.length);

for (let x = 0; x < electionDataRaw.length / 11; x++) {
	seats.name[x] = electionDataRaw[0 + x * 11];
	seats.id[x] = electionDataRaw[1 + x * 11];

	for (let y = 0; y < parties.length; y++) {
		vote[parties[y]][x] = parseInt(electionDataRaw[2 + y + x * 11]);
	}

	total_votes[x] = parseInt(electionDataRaw[9 + x * 11]);
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

var seatVoteText = document.getElementsByClassName("seatVote");

var CurrentlyClickedSeat = 0;

function InitializeSeatVoteText() {
	for (let x = 0; x < seats.id.length; x++) {
		SVGMAP.getElementById(seats.id[x]).addEventListener("click", () => {
			ClickSeat(x);
		});
	}
}

function ClickSeat(click) {
	document.getElementById("SeatName").innerText = seats.name[click];

	CurrentlyClickedSeat = click;

	for (let z = 0; z < parties.length; z++) {
		seatVoteText[z].innerText = fourDecRound(vote_percent[parties[z]][click] * 100).toFixed(2) + "%";
	}
}

function RefreshSeatClick() {
	ClickSeat(CurrentlyClickedSeat);
}

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

function InitializeRegionalInputs() {
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
			inputs[inputPointer].value = fourDecRound(regionVotes[parties[p]][r] * 100).toFixed(2) + "%";
		}
	}
}

var regionalSeats = document.getElementsByClassName("regional-seats");

function InitializeRegionalSeatCounts() {
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

function GetShiftFromInputs() {
	var shift = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;

			if (regionVotes[parties[p]][r] == 0) {
				shift[inputPointer] = 0;
			} else {
				shift[inputPointer] = fourDecRound(parsePercentage(inputs[inputPointer].value) / regionVotes[parties[p]][r]);
			}
		}
	}
	return shift;
}

// Apply shift array

function Swing(shiftArr) {
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

				v[p] = Math.round(vote[parties[p]][x] * shiftArr[inputPointer]);

				sum += v[p];
				vpv[p] += v[p];
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
	ColourMap();

	DisplayNationalSeatCount();

	RefreshRegionalSeats();

	RefreshPopularVoteCount(xvpv);

	RefreshSeatClick();
}

var mapMode = 0;

function ColourMap() {
	// 0 for vote share
	// 1 for margin
	// 2 for flips
	// 3 for solid
	// 4 for share by party

	if (mapMode == 0) {
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
	if (mapMode == 1) {
		for (let x = 0; x < seats.id.length; x++) {
			var val = Math.ceil((0.45 - seatMargin[x]) / decrement);

			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, val - 5));

			if (seatMargin[x] > 0.45) {
				fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, -6));
			} else if (seatMargin[x] < 0.05) {
				fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, 6));
			}
			if (seatMargin[x] == 0) {
				fillSeat(seats.id[x], "#8a8a8a");
			}
		}
	}
	if (mapMode == 2) {
		// todo
	}
	if (mapMode == 3) {
		for (let x = 0; x < seats.id.length; x++) {
			fillSeat(seats.id[x], hex[seatWinner[x]]);
		}
	}
	if (mapMode == 4) {
		var prty = partyCycle - 1;

		for (let x = 0; x < seats.id.length; x++) {
			var val = Math.ceil((rangeTop - vote_percent[parties[prty]][x]) / decrement);

			fillSeat(seats.id[x], colourStep(hex[parties[prty]], 10, val - 5));

			if (vote_percent[parties[prty]][x] > rangeTop) {
				fillSeat(seats.id[x], colourStep(hex[parties[prty]], 10, -6));
			} else if (vote_percent[parties[prty]][x] < rangeBottom) {
				fillSeat(seats.id[x], colourStep(hex[parties[prty]], 10, 6));
			}
			if (vote_percent[parties[prty]][x] == 0) {
				fillSeat(seats.id[x], "#8a8a8a");
			}
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

var scrapeUpperMOE = {};

function GetScrapeMOE() {
	for (let p = 0; p < 3; p++) {
		Object.defineProperty(scrapeUpperMOE, parties[p], {
			value: [],
			writable: true,
			enumerable: true,
			configurable: true,
		});
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < 3; p++) {
			// only three parties are used here, the lpc, cpc, and ndp

			var proportion = scrapedRegions[parties[p]][r];

			// 1000 acts as our n, where n is the average polling sample size

			// MOE is calculated at 95% confidence level
			// 1.96 is therefore z value

			scrapeUpperMOE[parties[p]][r] = fourDecRound(1.96 * Math.sqrt((proportion * (1 - proportion)) / 1000));
		}
	}
}

function GetShiftFromMOE(sel_p) {
	var shiftArr = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		var moe = scrapeUpperMOE[parties[sel_p]][r];

		var sum = 0;

		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;
			if (p == sel_p) {
			} else {
				shiftArr[inputPointer] = regionVotes[parties[p]][r];
				sum += shiftArr[inputPointer];
			}
		}

		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;
			if (p == sel_p) {
				shiftArr[inputPointer] = fourDecRound((scrapedRegions[parties[p]][r] + moe) / regionVotes[parties[p]][r]);
			} else {
				if (regionVotes[parties[p]][r] == 0) {
					shiftArr[inputPointer] = 0;
				} else {
					shiftArr[inputPointer] = regionVotes[parties[p]][r] / sum;
					shiftArr[inputPointer] = fourDecRound(shiftArr[inputPointer] * moe);
					shiftArr[inputPointer] = fourDecRound((scrapedRegions[parties[p]][r] - shiftArr[inputPointer]) / regionVotes[parties[p]][r]);
				}
			}
		}
	}

	return shiftArr;
}

var scrapedRegions = {};

function ParseScrape() {
	for (let p = 0; p < parties.length; p++) {
		Object.defineProperty(scrapedRegions, parties[p], {
			value: [],
			writable: true,
			enumerable: true,
			configurable: true,
		});
		for (let r = 0; r < regions.name.length; r++) {
			scrapedRegions[parties[p]][r] = regionVotes[parties[p]][r];
		}
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		filename = "/selenium-averages/scrape_" + regions.name[r] + ".txt";

		var raw = readFile(filename);

		arr = raw.split(",");

		for (let p = 0; p < parties.length; p++) {
			for (let a = 0; a < arr.length; a++) {
				if (arr[a] == parties[p]) {
					scrapedRegions[parties[p]][r] = parseFloat(arr[a + 1]);
				}
			}
		}
	}
}

function ScrapeIntoShift() {
	var shiftArr = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.length; p++) {
			var inputPointer = parties.length * r + p;

			if (regionVotes[parties[p]][r] == 0) {
				shiftArr[inputPointer] = 0;
			} else {
				shiftArr[inputPointer] = fourDecRound(scrapedRegions[parties[p]][r] / regionVotes[parties[p]][r]);
			}

			inputs[inputPointer].value = fourDecRound(scrapedRegions[parties[p]][r] * 100).toFixed(2) + "%";
		}
	}

	return shiftArr;
}

// Runs once all items are loaded

document.addEventListener("DOMContentLoaded", function () {
	// get first <object>
	const objTag = document.querySelector(".svgmap");

	// Runs once SVG loads

	objTag.addEventListener("load", () => {
		// reference to SVG document

		var svgDoc = objTag.contentDocument;

		SVGMAP = svgDoc.documentElement;

		findWinnerAndMargin();

		DisplayNationalSeatCount();

		InitializeRegions();

		ColourMap();

		InitializeRegionalInputs();
		InitializeRegionalSeatCounts();

		ParseScrape();

		GetScrapeMOE();

		// enables clicking on seat to see results

		var e = document.getElementsByClassName("seatVote");

		InitializeSeatVoteText();

		ClickSeat(0);
	});
});
