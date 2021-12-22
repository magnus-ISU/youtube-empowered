////////////////////// Make the theater container use the full screen /////////////////////////
// Just CSS would be more elegant, however there are two issues. 1: it loads more slowly visually, 2: Sometimes it doesn't apply the first time loading youtube.
const THEATER_SIZE = "calc(100vh - 56px)";
const FULLSCREEN_SIZE = "100vh";
waitForElm("player-theater-container").then(correctTheaterMode);
document.addEventListener("fullscreenchange", correctTheaterMode);
function correctTheaterMode() {
	document.getElementById("player-theater-container").style.maxHeight =
		document.fullscreenElement ? FULLSCREEN_SIZE : THEATER_SIZE;
}

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
	if (entries[0].intersectionRatio < options.threshold) {
		document.body.classList.add("YTempowered-popup");
	} else {
		document.body.classList.remove("YTempowered-popup");
	}
	// We must trigger a resize event as youtube itself hardcodes video size into the <video> element
	window.dispatchEvent(new Event("resize"));
}

////////// Don't allow videos to autoplay if youtube is playing in the background /////////////
waitForElm("movie_player").then(blockAutoplay);

function blockAutoplay() {
	// Make this global so we can use it elsewhere, namely in AskPermissionToAutoplay
	// Or not because we can't use it there anyway?
	let video = document.getElementById("movie_player").querySelector("video");
	// Main youtube page has a movie_player with empty video that does nothing. Only do anything if the video is actually intended to play something
	if (video.src !== "") {
		// When we start playing the first time, make sure we have permission
		video.addEventListener("play", askPermissionToAutoplay);
	}
}

function askPermissionToAutoplay() {
	let video = document.getElementById("movie_player").querySelector("video");
	console.log("Starting askPermissionToAutoplay");
	// Find out from the background script if any other youtube video is playing
	browser.runtime.sendMessage({ a: "autoplay?" }).then((response) => {
		console.log("Got response: ", response);
		// If we should not autoplay, pause the playback
		if (false === response) {
			// TODO find some better way to find out when exactly to pause the video. This can play some of the beginning of a video or not pause if it takes a while to load
			setTimeout(() => {
				video.pause();
			}, 500);
		}
	});
	// Remove the event listener: the first time it plays, that's autoplay. From then on it is user interaction
	// Shouldn't be annoying even if they have regular autoplay-block on too because it permits the play if other tabs aren't already playing, but if there is a better way to implement it I would like to find it
	console.log("Removing event listener");
	video.removeEventListener("play", askPermissionToAutoplay);
}

//////////////// Utility functions that are used to implement functionality ///////////////////

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
