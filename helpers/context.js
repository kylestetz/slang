let context;

if (window.webkitAudioContext) {
	context = new webkitAudioContext();
} else {
	context = new AudioContext();
}

export default context;
