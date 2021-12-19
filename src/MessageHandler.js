browser.runtime.onMessage.addListener(notify);

// Messages have an 'a' tag which signifies the action to perform, and depending on 'a' may have other arbitrary arguments
function notify(message) {
	switch (message.a) {
		case "css":
			console.log("Loading CSS");
			browser.tabs.insertCSS({ file: message.css }).then(null, onerror);
			break;
	}
}
