let btnPartyStrength = document.getElementById("btnPartyStrength");

var c = 0;

btnPartyStrength.addEventListener("click", () => {
	for (let x = 0; x < seats.id.length; x++) {
		var val = Math.ceil((rangeTop - vote_percent[parties[c]][x]) / decrement);
		fillSeat(seats.id[x], shadeColor(hex[parties[c]], val * ((maxShade - minShade) / bucketNum) + minShade));

		if (vote_percent[parties[c]][x] > rangeTop) {
			fillSeat(seats.id[x], shadeColor(hex[parties[c]], minShade));
		} else if (vote_percent[parties[c]][x] < rangeBottom) {
			fillSeat(seats.id[x], shadeColor(hex[parties[c]], maxShade + (maxShade - minShade) / bucketNum));
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
