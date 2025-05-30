// Initial setup, reading data and parsing

var electionDataRaw = readFile("2025Results.csv").split("\r").join("").split("\n").join(",").split(",");

var seats = { name: [], id: [] };

var vote = {};
var vote_percent = {};

var total_votes = [];

var hex = { lpc: "#ea6d6a", cpc: "#6495ec", ndp: "#ef8e3e", grn: "#10c25b", ppc: "#6f5d9a", bqc: "#19bfd2", oth: "#898989" };

const baseHex = hex;

var parties = {
	abbreviation: ["lpc", "cpc", "ndp", "grn", "ppc", "bqc", "oth"],
	fullName: [
		"Liberal Party of Canada",
		"Conservative Party of Canada",
		"New Democratic Party",
		"Green Party",
		"Peoples Party of Canada",
		"Bloc Quebecois",
		"Other",
	],
};

var seatWinner = [];
var seatMargin = [];

var initSeatWinner = [];

// arranged by order in data file
// territories are set to use pv swing due to low regional data

var regions = {
	name: ["BC", "AB", "PR", "ON", "QC", "ATL", "TR"],
	seats: [43, 37, 28, 122, 78, 32, 3],
	usePvSwing: [false, false, false, false, false, false, true],
};
var regionVotes = {};
var regionSeats = {};

for (let y = 0; y < parties.abbreviation.length; y++) {
	Object.defineProperty(vote, parties.abbreviation[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(vote_percent, parties.abbreviation[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(regionVotes, parties.abbreviation[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
	Object.defineProperty(regionSeats, parties.abbreviation[y], {
		value: [],
		writable: true,
		enumerable: true,
		configurable: true,
	});
}

// 11 columns, removes header line

electionDataRaw = electionDataRaw.slice(10, electionDataRaw.length);

console.log(electionDataRaw);

for (let x = 0; x < electionDataRaw.length / 10; x++) {
	seats.name[x] = electionDataRaw[0 + x * 10];
	seats.id[x] = electionDataRaw[1 + x * 10];

	for (let y = 0; y < parties.abbreviation.length; y++) {
		vote[parties.abbreviation[y]][x] = parseInt(electionDataRaw[2 + y + x * 10]);
	}

	total_votes[x] = parseInt(electionDataRaw[9 + x * 10]);
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

var FlipInfo = document.getElementById("FlipInfo");
var MarginInfo = document.getElementById("MarginInfo");

function ClickSeat(click) {
	document.getElementById("SeatName").innerText = seats.name[click];

	CurrentlyClickedSeat = click;

	for (let p = 0; p < parties.abbreviation.length; p++) {
		seatVoteText[p].innerText = fourDecRound(vote_percent[parties.abbreviation[p]][click] * 100).toFixed(2) + "%";
	}

	if (initSeatWinner[click] == seatWinner[click]) {
		FlipInfo.innerText = seatWinner[click].toUpperCase() + " Hold";
	} else if (initSeatWinner[click] != seatWinner[click]) {
		FlipInfo.innerText = initSeatWinner[click].toUpperCase() + " --> " + seatWinner[click].toUpperCase() + " Flip";
	}

	MarginInfo.innerText = "Margin: " + fourDecRound(seatMargin[click] * 100).toFixed(2) + "%";
}

function RefreshSeatClick() {
	ClickSeat(CurrentlyClickedSeat);
}

// Beginning of Popular Vote Text setup

var pv = [];
var pvText = document.getElementsByClassName("pvVote");

function InitializePVText() {
	for (let p = 0; p < parties.abbreviation.length; p++) {
		pv[p] = vote[parties.abbreviation[p]].reduce((a, b) => a + b, 0);
		pv[p] = fourDecRound(pv[p] / total_votes.reduce((a, b) => a + b, 0));
	}

	for (let p = 0; p < parties.abbreviation.length; p++) {
		pvText[p].innerText = fourDecRound(pv[p] * 100).toFixed(2) + "%";
	}
}

// National seat results setup

function DisplayNationalSeatCount() {
	var natSeats = [];

	for (let p = 0; p < parties.abbreviation.length; p++) {
		natSeats[p] = 0;

		for (let x = 0; x < seats.id.length; x++) {
			if (seatWinner[x] == parties.abbreviation[p]) {
				natSeats[p]++;
			}
		}
	}

	var natSeatsText = document.getElementsByClassName("natSeats");

	for (let p = 0; p < parties.abbreviation.length; p++) {
		natSeatsText[p].innerText = natSeats[p];
	}
}

// regions setup

function InitializeRegions() {
	var running = 0;
	var regionSum = [];

	for (let r = 0; r < regions.name.length; r++) {
		regionSum[r] = 0;
		for (let p = 0; p < parties.abbreviation.length; p++) {
			regionVotes[parties.abbreviation[p]][r] = 0;
			regionSeats[parties.abbreviation[p]][r] = 0;

			for (let x = running; x < running + regions.seats[r]; x++) {
				regionVotes[parties.abbreviation[p]][r] += vote[parties.abbreviation[p]][x];

				if (seatWinner[x] == parties.abbreviation[p]) {
					regionSeats[parties.abbreviation[p]][r]++;
				}
			}

			regionSum[r] += regionVotes[parties.abbreviation[p]][r];
		}
		for (let p = 0; p < parties.abbreviation.length; p++) {
			regionVotes[parties.abbreviation[p]][r] = fourDecRound(regionVotes[parties.abbreviation[p]][r] / regionSum[r]);
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
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;

			if (parties.abbreviation[p] == "bqc" && regions.name[r] != "QC") {
				inputs[inputPointer].disabled = true;
			}
			if (parties.abbreviation[p] == "oth") {
				inputs[inputPointer].disabled = true;
			}
			inputs[inputPointer].value = fourDecRound(regionVotes[parties.abbreviation[p]][r] * 100).toFixed(2) + "%";
		}
	}
}

var regionalSeats = document.getElementsByClassName("regional-seats");

function InitializeRegionalSeatCounts() {
	// regional seat counts

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;

			if (parties.abbreviation[p] == "bqc" && regions.name[r] != "QC") {
				regionalSeats[inputPointer].innerText = "~";
			} else {
				regionalSeats[inputPointer].innerText = regionSeats[parties.abbreviation[p]][r];
			}
		}
	}
}

// Grabbing new values for swing

function GetShiftFromInputs() {
	var shift = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;

			if (regionVotes[parties.abbreviation[p]][r] == 0) {
				shift[inputPointer] = 1;
			} else {
				shift[inputPointer] = fourDecRound(parsePercentage(inputs[inputPointer].value) / regionVotes[parties.abbreviation[p]][r]);
			}

			inputs[inputPointer].value = fourDecRound(fourDecRound(parsePercentage(inputs[inputPointer].value)) * 100).toFixed(2) + "%";
		}
	}
	return shift;
}

// Apply shift array

function Swing(shiftArr) {
	var running = 0;

	var vpv = [];

	for (let p = 0; p < parties.abbreviation.length; p++) {
		vpv[p] = 0;
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let x = running; x < running + regions.seats[r]; x++) {
			var sum = 0;

			var v = [];

			for (let p = 0; p < parties.abbreviation.length; p++) {
				var inputPointer = parties.abbreviation.length * r + p;

				v[p] = Math.round(vote[parties.abbreviation[p]][x] * shiftArr[inputPointer]);

				sum += v[p];
				vpv[p] += v[p];
			}

			for (let p = 0; p < parties.abbreviation.length; p++) {
				vote_percent[parties.abbreviation[p]][x] = fourDecRound(v[p] / sum);
			}
		}

		running += regions.seats[r];
	}

	// janky fix for territories and their pv swing

	var s = [];

	for (let p = 0; p < parties.abbreviation.length; p++) {
		s[p] = 0;
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;

			s[p] += shiftArr[inputPointer];
		}
	}

	for (let p = 0; p < parties.abbreviation.length; p++) {
		s[p] = fourDecRound(s[p] / regionsWithRegionalSwing);
	}

	for (let x = 340; x < seats.id.length; x++) {
		var sum = 0;
		for (let p = 0; p < parties.abbreviation.length; p++) {
			v[p] = vote[parties.abbreviation[p]][x] * s[p];

			sum += v[p];

			vpv[p] += v[p];
		}
		for (let p = 0; p < parties.abbreviation.length; p++) {
			vote_percent[parties.abbreviation[p]][x] = fourDecRound(v[p] / sum);
		}
	}

	var totalVotesAfterSwing = vpv.reduce((a, b) => a + b, 0);

	var xvpv = [];

	for (let p = 0; p < parties.abbreviation.length; p++) {
		xvpv[p] = fourDecRound(vpv[p] / totalVotesAfterSwing);
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;
			inputs[inputPointer].value = fourDecRound(fourDecRound(regionVotes[parties.abbreviation[p]][r] * shiftArr[inputPointer]) * 100).toFixed(2) + "%";
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
		for (let x = 0; x < seats.id.length; x++) {
			if (initSeatWinner[x] == seatWinner[x]) {
				fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, 3));
			} else if (initSeatWinner[x] != seatWinner[x]) {
				fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, -3));
			}
		}
	}
	if (mapMode == 3) {
		for (let x = 0; x < seats.id.length; x++) {
			fillSeat(seats.id[x], hex[seatWinner[x]]);
		}
	}
	if (mapMode == 4) {
		var prty = partyCycle - 1;

		for (let x = 0; x < seats.id.length; x++) {
			var val = Math.ceil((rangeTop - vote_percent[parties.abbreviation[prty]][x]) / decrement);

			fillSeat(seats.id[x], colourStep(hex[parties.abbreviation[prty]], 10, val - 5));

			if (vote_percent[parties.abbreviation[prty]][x] > rangeTop) {
				fillSeat(seats.id[x], colourStep(hex[parties.abbreviation[prty]], 10, -6));
			} else if (vote_percent[parties.abbreviation[prty]][x] < rangeBottom) {
				fillSeat(seats.id[x], colourStep(hex[parties.abbreviation[prty]], 10, 6));
			}
			if (vote_percent[parties.abbreviation[prty]][x] == 0) {
				fillSeat(seats.id[x], "#8a8a8a");
			}
		}
	}
}

function RefreshRegionalSeats() {
	var running = 0;

	for (let r = 0; r < regions.name.length; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			regionSeats[parties.abbreviation[p]][r] = 0;

			for (let x = running; x < running + regions.seats[r]; x++) {
				if (seatWinner[x] == parties.abbreviation[p]) {
					regionSeats[parties.abbreviation[p]][r]++;
				}
			}
		}
		running += regions.seats[r];
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;

			if (parties.abbreviation[p] == "bqc" && regions.name[r] != "QC") {
				regionalSeats[inputPointer].innerText = "~";
			} else {
				regionalSeats[inputPointer].innerText = regionSeats[parties.abbreviation[p]][r];
			}
		}
	}
}

function RefreshPopularVoteCount(arr) {
	for (let p = 0; p < parties.abbreviation.length; p++) {
		pvText[p].innerText = fourDecRound(arr[p] * 100).toFixed(2) + "%";
	}
}

var scrapeUpperMOE = {};

function GetScrapeMOE() {
	for (let p = 0; p < 3; p++) {
		Object.defineProperty(scrapeUpperMOE, parties.abbreviation[p], {
			value: [],
			writable: true,
			enumerable: true,
			configurable: true,
		});
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < 3; p++) {
			// only three parties.abbreviation are used here, the lpc, cpc, and ndp

			var proportion = scrapedRegions[parties.abbreviation[p]][r];

			// 1000 acts as our n, where n is the average polling sample size

			// MOE is calculated at 95% confidence level
			// 1.96 is therefore z value

			scrapeUpperMOE[parties.abbreviation[p]][r] = fourDecRound(1.96 * Math.sqrt((proportion * (1 - proportion)) / 1000));
		}
	}
}

function GetShiftFromMOE(sel_p) {
	var shiftArr = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		var moe = scrapeUpperMOE[parties.abbreviation[sel_p]][r];

		var sum = 0;

		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;
			if (p == sel_p) {
			} else {
				shiftArr[inputPointer] = regionVotes[parties.abbreviation[p]][r];
				sum += shiftArr[inputPointer];
			}
		}

		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;
			if (p == sel_p) {
				shiftArr[inputPointer] = fourDecRound((scrapedRegions[parties.abbreviation[p]][r] + moe) / regionVotes[parties.abbreviation[p]][r]);
			} else {
				if (regionVotes[parties.abbreviation[p]][r] == 0) {
					shiftArr[inputPointer] = 0;
				} else {
					shiftArr[inputPointer] = regionVotes[parties.abbreviation[p]][r] / sum;
					shiftArr[inputPointer] = fourDecRound(shiftArr[inputPointer] * moe);
					shiftArr[inputPointer] = fourDecRound(
						(scrapedRegions[parties.abbreviation[p]][r] - shiftArr[inputPointer]) / regionVotes[parties.abbreviation[p]][r]
					);
				}
			}
		}
	}

	return shiftArr;
}

var scrapedRegions = {};

function ParseScrape() {
	for (let p = 0; p < parties.abbreviation.length; p++) {
		Object.defineProperty(scrapedRegions, parties.abbreviation[p], {
			value: [],
			writable: true,
			enumerable: true,
			configurable: true,
		});
		for (let r = 0; r < regions.name.length; r++) {
			scrapedRegions[parties.abbreviation[p]][r] = regionVotes[parties.abbreviation[p]][r];
		}
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		filename = "/selenium-averages/scrape_" + regions.name[r] + ".txt";

		var raw = readFile(filename);

		arr = raw.split(",");

		for (let p = 0; p < parties.abbreviation.length; p++) {
			for (let a = 0; a < arr.length; a++) {
				if (arr[a] == parties.abbreviation[p]) {
					scrapedRegions[parties.abbreviation[p]][r] = parseFloat(arr[a + 1]);
				}
			}
		}
	}
}

function ScrapeIntoShift() {
	var shiftArr = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			var inputPointer = parties.abbreviation.length * r + p;

			if (regionVotes[parties.abbreviation[p]][r] == 0) {
				shiftArr[inputPointer] = 0;
			} else {
				shiftArr[inputPointer] = fourDecRound(scrapedRegions[parties.abbreviation[p]][r] / regionVotes[parties.abbreviation[p]][r]);
			}

			inputs[inputPointer].value = fourDecRound(scrapedRegions[parties.abbreviation[p]][r] * 100).toFixed(2) + "%";
		}
	}

	return shiftArr;
}

// Handles storing of colour hexes in localStorage

function InitializeHexStorage() {
	if (localStorage.getItem("hex_storage") == null) {
		localStorage.setItem("hex_storage", JSON.stringify(hex));
	} else {
		hex = JSON.parse(localStorage.getItem("hex_storage"));
	}
}

function StoreHexes() {
	localStorage.clear();
	localStorage.setItem("hex_storage", JSON.stringify(hex));
}

function ResetHexes() {
	hex = baseHex;
	StoreHexes();
}

var pvAccents = document.getElementsByClassName("pvAccents");

function SetAccentColours() {
	for (let p = 0; p < parties.abbreviation.length; p++) {
		pvAccents[p].style.backgroundColor = hex[parties.abbreviation[p]];
		pvAccents[p + parties.abbreviation.length].style.backgroundColor = hex[parties.abbreviation[p]];
	}
}

function SaveMapAsImage() {
	var originalStroke = SVGMAP.getElementById(seats.id[0]).style.strokeWidth;

	var v = SVGMAP.getElementById("viewport").getAttribute("transform");

	var s = "matrix(1, 0, 0, 1, 0, 0)";

	SVGMAP.getElementById("viewport").setAttribute("transform", s);

	SVGMAP.getElementById("Lakes").querySelectorAll("path")[0].style.fill = "white";

	for (let x = 0; x < seats.id.length; x++) {
		SVGMAP.getElementById(seats.id[x]).style.strokeWidth = "0.1px";
	}

	const data = new XMLSerializer().serializeToString(SVGMAP);

	const svgBlob = new Blob([data], {
		type: "image/svg+xml;charset=utf-8",
	});

	const url = URL.createObjectURL(svgBlob);

	// load the SVG blob to a flesh image object
	const img = new Image();
	img.addEventListener("load", () => {
		// draw the image on an ad-hoc canvas
		const bbox = SVGMAP.getBBox();

		const imgWidth = 798.05712 * scalar;
		const imgHeight = 686.06091 * scalar;

		const canvas = document.createElement("canvas");
		canvas.width = imgWidth;
		canvas.height = imgHeight;

		const context = canvas.getContext("2d");
		context.drawImage(img, 0, 0, imgWidth, imgHeight);

		URL.revokeObjectURL(url);

		// trigger a synthetic download operation with a temporary link
		const a = document.createElement("a");
		a.download = "ab-north-map.png";
		document.body.appendChild(a);
		a.href = canvas.toDataURL();
		a.click();
		a.remove();
	});
	img.src = url;

	for (let x = 0; x < seats.id.length; x++) {
		SVGMAP.getElementById(seats.id[x]).style.strokeWidth = originalStroke;
	}

	SVGMAP.getElementById("viewport").setAttribute("transform", v);

	SVGMAP.getElementById("Lakes").querySelectorAll("path")[0].style.fill = "#444444";
}

function SaveMapAsSVG() {
	var originalStroke = SVGMAP.getElementById(seats.id[0]).style.strokeWidth;

	var v = SVGMAP.getElementById("viewport").getAttribute("transform");

	var s = "matrix(1, 0, 0, 1, 0, 0)";

	SVGMAP.getElementById("viewport").setAttribute("transform", s);

	SVGMAP.getElementById("Lakes").querySelectorAll("path")[0].style.fill = "white";

	for (let x = 0; x < seats.id.length; x++) {
		SVGMAP.getElementById(seats.id[x]).style.strokeWidth = "0.1px";
	}

	const data = new XMLSerializer().serializeToString(SVGMAP);

	// Create element with <a> tag
	const link = document.createElement("a");

	// Create a blob object with the file content which you want to add to the file
	const svgBlob = new Blob([data], {
		type: "image/svg+xml;charset=utf-8",
	});

	// Add file content in the object URL
	link.href = URL.createObjectURL(svgBlob);

	// Add file name
	link.download = "ab-north-map.svg";

	// Add click event to <a> tag to save file.
	link.click();
	URL.revokeObjectURL(link.href);

	for (let x = 0; x < seats.id.length; x++) {
		SVGMAP.getElementById(seats.id[x]).style.strokeWidth = originalStroke;
	}

	SVGMAP.getElementById("viewport").setAttribute("transform", v);

	SVGMAP.getElementById("Lakes").querySelectorAll("path")[0].style.fill = "#444444";
}

function SaveDataAsJSON() {
	var outputJSON = {};

	outputJSON["regions"] = {};

	outputJSON["seats"] = {};

	for (let r = 0; r < 343; r++) {
		outputJSON["regions"][regions.name[r]] = {};
		for (let p = 0; p < parties.abbreviation.length; p++) {
			outputJSON["regions"][regions.name[r]][parties.abbreviation[p]] = {};
			outputJSON["regions"][regions.name[r]][parties.abbreviation[p]]["vote_percent"] = regionVotes[parties.abbreviation[p]][r];
			outputJSON["regions"][regions.name[r]][parties.abbreviation[p]]["seats"] = regionSeats[parties.abbreviation[p]][r];
		}
	}
	for (let x = 0; x < 343; x++) {
		outputJSON["seats"]["seat" + (x + 1)] = {};
		outputJSON["seats"]["seat" + (x + 1)]["name"] = seats.name[x];
		outputJSON["seats"]["seat" + (x + 1)]["id"] = seats.id[x];
		for (let p = 0; p < parties.abbreviation.length; p++) {
			outputJSON["seats"]["seat" + (x + 1)][parties.abbreviation[p]] = {};
			outputJSON["seats"]["seat" + (x + 1)][parties.abbreviation[p]]["vote_percent"] = vote_percent[parties.abbreviation[p]][x];
		}
	}

	console.log(outputJSON);
	SaveFile(JSON.stringify(outputJSON), "output.json");
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

		initSeatWinner = seatWinner.slice(0);

		InitializePVText();
		DisplayNationalSeatCount();

		InitializeRegions();

		InitializeHexStorage();

		SetAccentColours();

		console.log(seats.id);

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
