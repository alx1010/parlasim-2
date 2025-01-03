function colourStep(hex, stepDistance, step) {
	initialColour = { r: parseInt(hex.substring(1, 3), 16), g: parseInt(hex.substring(3, 5), 16), b: parseInt(hex.substring(5, 7), 16) };

	var change = { r: 0, g: 0, b: 0 };

	var newShade = { r: 0, g: 0, b: 0 };

	var newHex = "";

	if (step > 100 / stepDistance || step < -100 / stepDistance) {
		console.log("Choose a step in range" + 100 / stepDistance + -100 / stepDistance);
		return "#ffffff";
	}

	if (step == 0) {
		return hex;
	}

	if (step < 0) {
		Object.keys(initialColour).forEach((key) => {
			change[key] = initialColour[key] / stepDistance;
		});
	} else if (step > 0) {
		Object.keys(initialColour).forEach((key) => {
			change[key] = (255 - initialColour[key]) / stepDistance;
		});
	}

	function componentToHex(c) {
		var h = c.toString(16);
		return h.length == 1 ? "0" + h : h;
	}

	Object.keys(initialColour).forEach((key) => {
		newShade[key] = initialColour[key] + change[key] * step;
		newShade[key] = Math.round(newShade[key]);

		newHex = newHex + componentToHex(newShade[key]);
	});

	return "#" + newHex;
}
