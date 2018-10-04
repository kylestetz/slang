import * as Scale from 'tonal-scale';
import parseArguments, { parseArgument } from './parseArguments';

// For now let's strip the spaces out of the chord names
// to simplify the arguments to the (chord ...) function.
const scaleNamesMap = Scale.names().reduce((ob, name) => {
	const object = Object.assign({}, ob);
	object[name.replace(/ /g, '')] = name;
	return object;
}, {});

class FunctionCall {
	constructor(functionObject) {
		this.type = functionObject.function;
		this.arguments = parseArguments(functionObject.arguments);

		// Some of the function calls will have to be prepared
		// as lists ahead of time so they can return cyclic values.
		if (this.type === 'chord') {
			// Scale.notes takes the arguments in the other order, so the
			// note comes first and then the chord name.
			const key = this.arguments[1].next();
			const scale = this.arguments[0].next();
			if (!scaleNamesMap[scale]) throw new Error(`Chord: ${scale} is not a recognized scale!`);
			const notes = Scale.notes(key, scaleNamesMap[scale]);
			this.chordList = parseArgument(notes);
		}

		if (this.type === 'random' && this.arguments[0].toArray) {
			console.log('Trying to make a randomList...', this.arguments[0]);
			this.randomList = this.arguments[0].toArray();
			console.log(this.randomList);
		}
	}
	next() {
		switch (this.type) {
		case 'random': return this.random();
		case 'chord': return this.chord();
		default:
			throw new Error(`Function ${this.type} does not exist`);
		}
	}

	toArray() {
		return this.type === 'chord' ? this.chordList.toArray() : null;
	}

	// ============================================================
	// FUNCTION TYPES
	// ============================================================

	random() {
		// Returns a single value
		return this.randomList
			? this.randomList[Math.floor(Math.random() * this.randomList.length)].next()
			: this.arguments[Math.floor(Math.random() * this.arguments.length)].next();
	}

	chord() {
		// Arguments: chord, note
		// e.g. (chord major E3)
		return this.chordList.next();
	}
}

export default FunctionCall;
