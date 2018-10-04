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

BufferLoader.prototype.loadBuffer = (url, index) => {
	// Load buffer asynchronously
	const request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	const loader = this;

	request.onload = () => {
		// Asynchronously decode the audio file data in request.response
		loader.context.decodeAudioData(
			request.response,
			(buffer) => {
				if (!buffer) {
					console.error(`BufferLoader: error decoding file data from url: ${url}`);
					return;
				}
				loader.bufferList[index] = buffer;
				loader.loadCount += 1;
				if (loader.loadCount === loader.urlList.length) loader.onload(loader.bufferList);
			},
			(error) => {
				console.error(`BufferLoader: decodeAudioData error ${error}`);
			},
		);
	};

	request.onerror = () => {
		console.log(`BufferLoader: error decoding ${url}`);
	};

	request.send();
};

BufferLoader.prototype.load = () => {
	for (let i = 0; i < this.urlList.length; i += 1) this.loadBuffer(this.urlList[i], i);
};
