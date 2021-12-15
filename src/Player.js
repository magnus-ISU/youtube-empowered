// Make the theater container use the full screen
waitForElm("player-theater-container").then(correctTheaterMode);
document.addEventListener("fullscreenchange", correctTheaterMode);
// Would be a better solution I think, because it doesn't involve constantly peering around and modifying the DOM, but it doesn't function.
// console.log("starting");
// browser.tabs.insertCSS({code:THEATER_CSS, runAt: "document_start"}).then(() => {console.log("inserted");}, onerror);


const THEATER_SIZE = "calc(100vh - 56px)";
const FULLSCREEN_SIZE = "100vh";
function correctTheaterMode() {
	document.getElementById("player-theater-container").style.maxHeight =
		document.fullscreenElement ? FULLSCREEN_SIZE : THEATER_SIZE;
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists#16726669
function waitForElm(selector) {
	return new Promise((resolve) => {
		let elm = document.getElementById(selector);

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
