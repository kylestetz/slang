// an abstraction written by Boris Smus,
// taken from http://www.html5rocks.com/en/tutorials/webaudio/intro/
// ... thanks Boris!

export default function BufferLoader(context, urlList, callback) {
	this.context = context;
	this.urlList = urlList;
	this.onload = callback;
	this.bufferList = [];
	this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
	// Load buffer asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	var loader = this;

	request.onload = function() {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(
			request.response,
			function(buffer) {
				if (!buffer) {
					console.error('BufferLoader: error decoding file data from url: ' + url);
					return;
				}
				loader.bufferList[index] = buffer;
				if (++loader.loadCount == loader.urlList.length)
					loader.onload(loader.bufferList);
			},
			function(error) {
				console.error('BufferLoader: decodeAudioData error', error);
			}
		);
	};

	request.onerror = function() {
		console.log('BufferLoader: error decoding', url);
	};

	request.send();
};

BufferLoader.prototype.load = function() {
	for (var i = 0; i < this.urlList.length; ++i)
	this.loadBuffer(this.urlList[i], i);
};
