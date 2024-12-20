// Initializes SVG map at root

var root = document.documentElement;

// sets map style

const baseFill = "#8a8a8a";
const baseStrokeColour = "#363636";
const baseStrokeWidth = 0.5; // px

const hoverFill = "#707070";

const minStrokeWidth = 0.03; // px

var dyanmicStrokeWidth = baseStrokeWidth;

var seatGroup;
var seats = [];

var storedFill = "";

document.addEventListener("DOMContentLoaded", function () {
	seatGroup = document.getElementById("Seats"); // Group with seats must be named "Seats"
	seats = seatGroup.querySelectorAll("path");

	for (let x = 0; x < seats.length; x++) {
		seats[x].style.fill = baseFill;
		seats[x].style.stroke = baseStrokeColour;
		seats[x].style.strokeWidth = baseStrokeWidth + "px";

		seats[x].addEventListener("mouseover", () => {
			//storedFill = seats[x].style.fill;
			//seats[x].style.fill = hoverFill;

			if (dyanmicStrokeWidth < minStrokeWidth) {
				seats[x].style.strokeWidth = minStrokeWidth * 2 + "px";
			} else {
				seats[x].style.strokeWidth = dyanmicStrokeWidth * 3 + "px";
			}
		});

		seats[x].addEventListener("mouseout", () => {
			//seats[x].style.fill = storedFill;
			if (dyanmicStrokeWidth < minStrokeWidth) {
				seats[x].style.strokeWidth = minStrokeWidth;
			} else {
				seats[x].style.strokeWidth = dyanmicStrokeWidth;
			}
		});
	}
});

root.addEventListener("wheel", (evt) => {
	//dynamic stroke width

	dyanmicStrokeWidth += evt.deltaY * 0.000075;

	for (let x = 0; x < seats.length; x++) {
		if (dyanmicStrokeWidth < minStrokeWidth) {
			seats[x].style.strokeWidth = minStrokeWidth + "px";
		} else {
			seats[x].style.strokeWidth = dyanmicStrokeWidth + "px";
		}
	}
});

console.log("SVG Style Module Loaded");
