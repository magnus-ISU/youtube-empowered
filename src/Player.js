console.log("Testy tester testing test");

// Make the theater container use the full screen
waitForElm("player-theater-container").then((elm) => {
    document.getElementById("player-theater-container").style.maxHeight = "calc(100vh - 56px)";
});

// Make the description automatically expanded
waitForElm("description").then((elm) => {
	document.getElementById("description").parentElement.remove();
});

// unset #primary.ytd-watch-flexy-max-player-width
// Unset all of #primary 's styling
// unset #player.ytd-watch-flexy-max-player-width

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists#16726669
function waitForElm(selector) {
	return new Promise((resolve) => {
		let elm = document.getElementById(selector);

        console.log(elm);

		if (elm) return resolve(elm);

		const observer = new MutationObserver((mutations) => {
			let elm = document.getElementById(selector);

			if (elm) {
				resolve(elm);
				observer.disconnect();
			}
		});


		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
