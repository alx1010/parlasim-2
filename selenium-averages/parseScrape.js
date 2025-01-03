function ParseScrape() {
	var scrapedRegions = {};

	for (let p = 0; p < parties.length; p++) {
		Object.defineProperty(scrapedRegions, parties[p], {
			value: [],
			writable: true,
			enumerable: true,
			configurable: true,
		});
		for (let r = 0; r < regions.name.length; r++) {
			scrapedRegions[parties[p]][r] = 0;
		}
	}

	for (let r = 0; r < regionsWithRegionalSwing; r++) {
		console.log(regions.name[r]);

		filename = "/selenium-averages/scrape_" + regions.name[r] + ".txt";

		var raw = readFile(filename);

		arr = raw.split(",");

		for (let p = 0; p < parties.length; p++) {
			for (let a = 0; a < arr.length; a++) {
				if (arr[a] == parties[p]) {
					scrapedRegions[parties[p]][r] = arr[a + 1];
				}
			}
		}
	}

	console.log(scrapedRegions);
}
