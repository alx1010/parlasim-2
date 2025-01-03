const btnSim = document.getElementById("btnSim");

const btnByShare = document.getElementById("btnByShare");
const btnByMargin = document.getElementById("btnByMargin");
const btnSolid = document.getElementById("btnSolid");

const btnPartyStrength = document.getElementById("btnPartyStrength");

const btnAverages = document.getElementById("btnAverages");

btnByShare.addEventListener("click", () => {
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
});

btnByMargin.addEventListener("click", () => {
	for (let x = 0; x < seats.id.length; x++) {
		var val = Math.ceil((0.4 - seatMargin[x]) / decrement);

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
});

btnSolid.addEventListener("click", () => {
	for (let x = 0; x < seats.id.length; x++) {
		fillSeat(seats.id[x], hex[seatWinner[x]]);
	}
});

var partyCycle = 0;

btnPartyStrength.addEventListener("click", () => {
	for (let x = 0; x < seats.id.length; x++) {
		var val = Math.ceil((rangeTop - vote_percent[parties[partyCycle]][x]) / decrement);

		fillSeat(seats.id[x], colourStep(hex[parties[partyCycle]], 10, val - 5));

		if (vote_percent[parties[partyCycle]][x] > rangeTop) {
			fillSeat(seats.id[x], colourStep(hex[parties[partyCycle]], 10, -6));
		} else if (vote_percent[parties[partyCycle]][x] < rangeBottom) {
			fillSeat(seats.id[x], colourStep(hex[parties[partyCycle]], 10, 6));
		}
		if (vote_percent[parties[partyCycle]][x] == 0) {
			fillSeat(seats.id[x], "#8a8a8a");
		}
	}

	partyCycle++;

	if (partyCycle >= parties.length) {
		partyCycle = 0;
	}
});

btnSim.addEventListener("click", () => {
	var shiftArr = GetShiftFromInputs();
	Swing(shiftArr);
});

btnAverages.addEventListener("click", () => {
	var shiftArr = ScrapeIntoShift();
	Swing(shiftArr);
});

for (let p = 0; p < 3; p++) {
	var elem = document.getElementById(parties[p] + "UpperMOE");

	elem.addEventListener("click", () => {
		var shiftArr = GetShiftFromMOE(p);
		Swing(shiftArr);
	});
}
