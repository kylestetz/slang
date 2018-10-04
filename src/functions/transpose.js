import { transpose as tonalTranspose } from 'tonal-distance';
import { fromSemitones } from "tonal-interval"
import FunctionCall from './FunctionCall';
import { parseArgument, rhythmMap } from '../helpers/parseArguments';

window.tonalTranspose = tonalTranspose;
window.fromSemitones = fromSemitones;

export default class Transpose extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);
		this.amount = parseArgument(this.arguments[0]);
		this.data = parseArgument(this.arguments[1]);

		this.hasWarned = false;
	}
	next(passedValue) {
		const rhythmMapObj = rhythmMap();
		console.log(rhythmMapObj);
		let nextValue = passedValue || this.data.next();

		// Unfortunately transposing rhythms won't work
		// easily the way the rhythm strings are passed around
		// (specifically because rests aren't converted into
		// their number value until the scheduler looks at
		// the presence of the `r` in the string, which happens
		// too far downstream for us to do anything about it here.)

		// Let's start by detecting if this is a rhythm; if so
		// it's going to be a noop + a gentle console.warn.
		if (
			typeof nextValue === 'string'
			&& (
				nextValue.charAt(0).toLowerCase() === 'r'
				|| rhythmMapObj[nextValue]
			)
		) {
			if (!this.hasWarned) {
				console.warn('Warning: transpose doesn’t work with rhythm values.');
				this.hasWarned = true;
			}
			return nextValue;
		}

		// Now if this is a string that means it's a note value.
		// The Scale library can help us transpose.
		if (typeof nextValue === 'string') {
			return tonalTranspose(
				nextValue,
				fromSemitones(Math.floor(this.amount.next()))
			);
		}

		// Finally, if we've reached the end we have two numbers.
		return nextValue + this.amount.next();
	}
	toArray() {
		// toArray is essentially "rendering" a static array,
		// which some functions require (like `shuffle`).
		return this.data.toArray().map(item => this.next(item.next()));
	}
}