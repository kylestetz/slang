import * as Scale from 'tonal-scale';
import take from 'lodash/take';
import flatMap from 'lodash/flatMap';
import FunctionCall from './FunctionCall';
import { parseArgument } from '../helpers/parseArguments';

// For now let's strip the spaces out of the chord names
// to simplify the arguments to the (chord ...) function.
const scaleNamesMap = Scale.names().reduce((ob, name) => {
	ob[name.replace(/( |\#)/g, '')] = name;
	return ob;
}, {});

export default class Chord extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);

		// Scale.notes takes the arguments in the other order, so the
		// note comes first and then the chord name.
		const key = this.arguments[1].next();
		const scale = this.arguments[0].next();
		const length = this.arguments[2] ? this.arguments[2].next() : null;
		if (!scaleNamesMap[scale]) throw new Error(`Chord: ${scale} is not a recognized scale!`);
		let notes = Scale.notes(key, scaleNamesMap[scale]);

		// If a length was provided, repeat the contents of the array
		// so that the return value matches the requested length.
		if (length) {
			if (length <= notes.length) {
				notes = take(notes, length);
			} else {
				// figure out how many times it repeats ...
				const repeat = Math.ceil(length / notes.length);
				// ... repeat it ...
				notes = flatMap(Array(repeat).fill(null), __ => notes);
				// ... now take the exact amount.
				notes = take(notes, length);
			}
		}

		// We don't need to implement our own `next` method because
		// the default for a FunctionCall is to return `this.data.next()`.
		this.data = parseArgument(notes);
	}
}