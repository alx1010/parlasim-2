let btnByShare = document.getElementById("btnByShare");
let btnByMargin = document.getElementById("btnByMargin");
let btnPartyStrength = document.getElementById("btnPartyStrength");

btnByShare.addEventListener("click", () => {
	for (let x = 0; x < seats.id.length; x++) {
		var val = Math.ceil((rangeTop - vote_percent[seatWinner[x]][x]) / decrement);

		fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, val - 5));

		if (vote_percent[seatWinner[x]][x] > rangeTop) {
			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, -5));
		} else if (vote_percent[seatWinner[x]][x] < rangeBottom) {
			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, 5));
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
			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, -5));
		} else if (seatMargin[x] < 0.05) {
			fillSeat(seats.id[x], colourStep(hex[seatWinner[x]], 10, 5));
		}
		if (seatMargin[x] == 0) {
			fillSeat(seats.id[x], "#8a8a8a");
		}
	}
});

var c = 0;

btnPartyStrength.addEventListener("click", () => {
	for (let x = 0; x < seats.id.length; x++) {
		var val = Math.ceil((rangeTop - vote_percent[parties[c]][x]) / decrement);

		fillSeat(seats.id[x], colourStep(hex[parties[c]], 10, val - 5));

		if (vote_percent[parties[c]][x][x] > rangeTop) {
			fillSeat(seats.id[x], colourStep(hex[parties[c]], 10, -5));
		} else if (vote_percent[parties[c]][x][x] < rangeBottom) {
			fillSeat(seats.id[x], colourStep(hex[parties[c]], 10, 5));
		}
		if (vote_percent[parties[c]][x] == 0) {
			fillSeat(seats.id[x], "#8a8a8a");
		}
	}

	c++;

	if (c >= parties.length) {
		c = 0;
	}
});
