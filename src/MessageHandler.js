var canAutoplay = true;

browser.runtime.onMessage.addListener(notify);

// Messages have an 'a' tag which signifies the action to perform, and depending on 'a' may have other arbitrary arguments
function notify(message, _sender, respond) {
	switch (message.a) {
		case "css":
			browser.tabs.insertCSS({ file: message.css }).then(null, onerror);
			break;
		case "forbidAutoplay":
			console.log(message);
			canAutoplay = false;
			break;
		case "allowAutoplay":
			console.log(message);
			canAutoplay = true;
			break;
		case "autoplay?":
			respond(canAutoplay);
			canAutoplay = false;
			break;
	}
}
