import parseArguments from './parseArguments';

/*
	LIST class
	The list class takes care of what would otherwise
	be a huge pain: dealing with potentially recursive
	lists created by nesting functions. This class will
	take the data generated during the `.toAST` process
	and give our runtime two convenient methods:

	toArray - returns a flat JS array
	next - allows us to cycle through the list without
	       caring about how long it is, what nested
	       values are lurking inside of it, etc.
*/

class List {
	constructor(listObject) {
		// We want each value to be guaranteed to have a `next` method,
		// even if this is an array of static values.

		if (Array.isArray(listObject)) {
			this.values = parseArguments(listObject);
		} else if (typeof listObject === 'object' && listObject.arguments) {
			this.values = parseArguments(listObject.arguments);
		} else {
			throw new Error(`List got a weird value? ${listObject}`)
		}

		this._currentIndex = 0;
	}
	toArray() {
		return this.values;
	}
	next() {
		const value = this.values[this._currentIndex].next();
		this._currentIndex = (this._currentIndex + 1) % this.values.length;
		return value;
	}
}

export default List;