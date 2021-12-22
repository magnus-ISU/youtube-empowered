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
	let video = document.getElementById("movie_player").querySelector("video");
	// Main youtube page has a movie_player with empty video that does nothing. Only do anything if the video is actually intended to play something
	if (video.src !== "") {
		// Make it so that playing the video prevents other tabs from autoplaying, and pausing it allows them to again
		// This is not *really* an *ideal* implementation, as if we open three tabs, play the first, manually play the second, pause the second, and open the third it will autoplay
		// However that is not a situation users are likely to encounter, since we assume a user won't manually play a video while another plays in the background anyway
		video.addEventListener("play", () =>
			browser.runtime.sendMessage({ a: "forbidAutoplay" })
		);
		video.addEventListener("pause", () =>
			browser.runtime.sendMessage({ a: "allowAutoplay" })
		);
		// Make it so if a video ends, we can now autoplay more videos
		document.addEventListener("unload", () =>
			browser.runtime.sendMessage({ a: "allowAutoplay" })
		);
		// Ask the background service if we should autoplay the current video
		// Ask the background service if we should autoplay the current video
		browser.runtime.sendMessage({ a: "autoplay?" }).then((response) => {
			console.log(response);
			// If we should not autoplay, pause the playback
			if (false === response) {
				console.log(video);
				// TODO find some better way to find out when exactly to pause the video. This can play some of the beginning of a video or not pause if it takes a while to load
				setTimeout(() => {
					video.pause();
				}, 1000);
			}
		});
	}
	// Set a listener to allow or disallow autoplay whenever a video pauses/plays
	// TODO test video end, tab closed
	//message.video.onpause = () => canAutoplay = true;
	//message.video.onplay = () => canAutoplay = false;
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
