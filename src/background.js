"use strict";

const set = () =>
	chrome.cookies.set({
		url: "https://www.youtube.com",
		domain: ".youtube.com",
		name: "wide",
		value: "1",
	});
chrome.runtime.onInstalled.addListener(set);
chrome.runtime.onStartup.addListener(set);
let id;
chrome.cookies.onChanged.addListener((info) => {
	if (info.cookie.name === "wide" && info.cookie.value !== "1") {
		window.clearTimeout(id);
		id = window.setTimeout(set, 1000);
	}
});
