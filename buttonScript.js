const btnSim = document.getElementById("btnSim");

const btnByShare = document.getElementById("btnByShare");
const btnByMargin = document.getElementById("btnByMargin");
const btnFlips = document.getElementById("btnFlips");
const btnSolid = document.getElementById("btnSolid");

const btnPartyStrength = document.getElementById("btnPartyStrength");

const btnLatestElection = document.getElementById("btnLatestElection");

const btnAverages = document.getElementById("btnAverages");

const btnAdjustColours = document.getElementById("btnAdjustColours");
const btnResetColours = document.getElementById("btnResetColours");

const btnExportMapPNG = document.getElementById("btnExportMapPNG");
const btnExportMapSVG = document.getElementById("btnExportMapSVG");

btnByShare.addEventListener("click", () => {
	mapMode = 0;
	ColourMap();
});

btnByMargin.addEventListener("click", () => {
	mapMode = 1;
	ColourMap();
});

btnFlips.addEventListener("click", () => {
	mapMode = 2;
	ColourMap();
});

btnSolid.addEventListener("click", () => {
	mapMode = 3;
	ColourMap();
});

var partyCycle = 0;

btnPartyStrength.addEventListener("click", () => {
	partyCycle++;

	mapMode = 4;
	ColourMap();

	if (partyCycle == parties.abbreviation.length) {
		partyCycle = 0;
	}
});

btnSim.addEventListener("click", () => {
	var shiftArr = GetShiftFromInputs();
	Swing(shiftArr);
});

btnLatestElection.addEventListener("click", () => {
	var shiftArr = [];

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		for (let p = 0; p < parties.abbreviation.length; p++) {
			shiftArr[parties.abbreviation.length * r + p] = 1;
		}
	}

	Swing(shiftArr);
});

btnAverages.addEventListener("click", () => {
	var shiftArr = ScrapeIntoShift();
	Swing(shiftArr);
});

// btn - parties.abbreviation - UpperMOE

for (let p = 0; p < 3; p++) {
	// only lpc, cpc and ndp considered for this
	var elem = document.getElementById("btn_" + parties.abbreviation[p] + "UpperMOE");

	elem.addEventListener("click", () => {
		var shiftArr = GetShiftFromMOE(p);
		Swing(shiftArr);
	});
}

btnAdjustColours.addEventListener("click", () => {
	for (let p = 0; p < parties.abbreviation.length; p++) {
		var promptResponse = window.prompt(parties.fullName[p] + "  - Colour:", hex[parties.abbreviation[p]]);

		if (promptResponse == null) {
		} else {
			hex[parties.abbreviation[p]] = promptResponse;
		}
	}
	StoreHexes();
	SetAccentColours();
	ColourMap();
});

btnResetColours.addEventListener("click", () => {
	ResetHexes();
	SetAccentColours();
	ColourMap();
});

btnExportMapPNG.addEventListener("click", () => {
	SaveMapAsImage();
});

btnExportMapSVG.addEventListener("click", () => {
	SaveMapAsSVG();
});
