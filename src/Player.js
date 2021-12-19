////////////////////// Make the theater container use the full screen /////////////////////////
// Just a stylesheet
browser.runtime.sendMessage({ a: "css", css: "/src/BigTheater.css" });

////////////////////// Make the window move to a popup if scrolled down ///////////////////////
// Observe when the video player moves out of screen and apply a class to the document's body when it does. FloatingPlayer has a rule to show popup when document has that class
browser.runtime.sendMessage({ a: "css", css: "/src/FloatingPlayer.css" });

const options = {
	root: null,
	threshold: 0.3,
};
const observer = new IntersectionObserver(addPopupWhenLeavingViewport, options);
// ytd-player is the main video player. It is not initially loaded
waitForElm("ytd-player").then(createPopupObserver);

function createPopupObserver() {
	observer.observe(document.getElementById("ytd-player"));
}

// https://css-tricks.com/styling-based-on-scroll-position/
function addPopupWhenLeavingViewport(entries) {
	console.log(entries);
	if (entries[0].intersectionRatio < options.threshold) {
		document.body.classList.add("YTempowered-popup");
	} else {
		document.body.classList.remove("YTempowered-popup");
		// We must trigger a resize event as youtube itself hardcodes video size into the <video> element
		window.dispatchEvent(new Event('resize'));
	}
}

// https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists#16726669
// Waits until an element is loaded, since youtube loads stuff in weirdly
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
