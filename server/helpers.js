// Returns a number between the min and max.
function randomRange(min, max) {
	return Math.floor(Math.random() * ((max - min) + 1)) + min;
}

/**
 * Returns an encoded version of the current date using the
 * provided key or the default one.
 * @param {string} k - Optional encode key
 * @returns {array}
 */
function createHash(k) {
	// Current numerical date is never duplicated
	// Use k parameter as key, of not set, use the default key
	const key = typeof k === 'string'
		? k
		: '1234567890qwertyuiopasdfghjklzQWERTYUIOPASDFGHJKLZXCVBNM+_-.~';
	const r = key.length;
	// Date is the raw hash
	let n = new Date().getTime();
	let c = '';

	// Encode the date acording to provided key
	while (n > 0) {
		c = key.charAt(n % r) + c;
		n = Math.floor(n / r);
	}
	return c;
}

module.exports = {
	createHash,
	randomRange,
};
