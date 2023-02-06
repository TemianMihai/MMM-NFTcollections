const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
	start: function() {
			console.log("Starting node_helper for: MMM-NFTcollections");
	},

	getCollectionData: function (url) {
		fetch(url)
		.then(response => {
			response.json().then(response => {
				this.sendSocketNotification("COLLECTION_DATA_RESULTS", response);
			})
		})
		.catch(error => console.error(this.name + ' ERROR:', error));
	},

	socketNotificationReceived: function(notification, url) {
		console.log("MMM-NFTcollections: in helper. Getting collection data...");

		if(notification === "GET_COLLECTION_DATA") {
			this.getCollectionData(url);
		}
	}
});
