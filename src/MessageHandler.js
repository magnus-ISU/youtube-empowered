browser.runtime.onMessage.addListener(notify);

// Messages have an 'a' tag which signifies the action to perform, and depending on 'a' may have other arbitrary arguments
function notify(message, sender, respond) {
	switch (message.a) {
		case "css":
			browser.tabs.insertCSS({ file: message.css }).then(null, onerror);
			break;
		case "autoplay?":
			console.log("tab", sender, "wants to play");
			let canAutoplay = true;
			console.log("all tabs: ", browser.tabs.query());
			for (let tab of browser.tabs.query({})) {
				console.log("PRocessing tab " + tab);
				if (tab.id === sender.tab.id) {
					console.log("jk skipping");
					continue;
				}
				browser.tabs.sendMessage(tab.id, { a: "autoplaying?" }).then(response => {
					console.log("got response " + response);
				});
			}
			console.log("Done with for loop")
			respond(canAutoplay);
			break;
	}
}
