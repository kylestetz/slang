// Returns a number between the min and max.
function randomRange(min, max) {
	return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

// Creates an alphanumeric string 6 characters long.
// This is long enough to avoid random collisions without
// being totally obnoxious to look at.
function createHash() {
	let newHash = '';

	for (let i = 0; i < 6; i += 1) {
		let digit = 0;
		if (Math.random() < 0.5) {
			digit = String(randomRange(0, 9));
		} else {
			digit = String.fromCharCode(randomRange(97, 122));
		}
		newHash += digit;
	}
	return newHash;
}

module.exports = {
	createHash,
	randomRange,
};
