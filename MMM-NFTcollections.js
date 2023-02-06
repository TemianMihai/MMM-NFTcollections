Module.register("MMM-NFTcollections", {
  // Default module config.
  defaults: {
  	apiKey: "",
  	network: "",
  	contractAddress: "",
    maxSupply: 0,
    updateInterval: 60000, // every 1 min
  },

  getStyles: function () {
	  return ["MMM-NFTcollections_styles.css"];
  },

  start: function () {
      Log.info("Starting module: " + this.name);

      this.collectionData = {};
      this.baseURL = `https://${this.config.network}.g.alchemy.com/v2/${this.config.apiKey}/getContractMetadata?contractAddress=${this.config.contractAddress}`;
      this.sendSocketNotification("GET_COLLECTION_DATA", this.baseURL);

      this.scheduleUpdate();
  },

  scheduleUpdate: function() {
	  setInterval(() => {
		  this.sendSocketNotification("GET_COLLECTION_DATA", this.baseURL);
	  }, this.config.updateInterval);
  },

  socketNotificationReceived: function(notification, payload) {
  	if(notification === "COLLECTION_DATA_RESULTS") {
        this.collectionData = payload;
        this.loaded = true;

        console.log("Collection data received: " + payload);

        this.updateDom();
	  }
  },

  // Override dom generator.
  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "flex-row";

    // If no collection data, display loading message
    if (!this.loaded) {
        wrapper.innerHTML = "Getting collection data...";
        wrapper.classList.add("bright", "light", "small");
        return wrapper;
    }

    // Display collection image
    const image = document.createElement("img");
    image.className = "margin-right-10 border-radius-8";
    image.src = this.collectionData.contractMetadata.openSea.imageUrl;
    image.width = 80;
    image.height = 80;
    wrapper.appendChild(image);

    // Display collection name and minted number in a div
    const details = document.createElement("div");
    details.className = "flex-column";

    // Display collection name
    const collectionContainer = document.createElement("div");
    collectionContainer.className = "flex-space-between width-full";

    const collection = document.createElement("span");
    collection.className = "white margin-right-10";
    const collectionText = document.createTextNode("Collection:");
    collection.appendChild(collectionText);

    const collectionName = document.createElement("span");
    const collectionNameText = document.createTextNode(this.collectionData.contractMetadata.name)
    collectionName.appendChild(collectionNameText);

    collectionContainer.appendChild(collection);
    collectionContainer.appendChild(collectionName);

    details.appendChild(collectionContainer);

    // Display collection minted number and status
    const statusContainer = document.createElement("div");
    statusContainer.className = "flex-space-between width-full";

    const status = document.createElement("span");
    status.className = "white";
    const statusValue = this.collectionData.contractMetadata.totalSupply === this.config.maxSupply ? "Sold out:" : "Minting now:";
    const statusText = document.createTextNode(statusValue);

    const minted = document.createElement("span");
    const mintedText = document.createTextNode(
      `${this.collectionData.contractMetadata.totalSupply} / ${this.config.maxSupply}`
    );

    status.appendChild(statusText);
    minted.appendChild(mintedText);
    statusContainer.appendChild(status);
    statusContainer.appendChild(minted);

    details.appendChild(statusContainer);

    // Display progress bar
    const progressBar = document.createElement("progress");
    progressBar.className = "width-full";
    progressBar.max = this.config.maxSupply;
    progressBar.value = this.collectionData.contractMetadata.totalSupply;
    details.appendChild(progressBar);

    // Append details to wrapper
    wrapper.appendChild(details);

    return wrapper;
  },
});
