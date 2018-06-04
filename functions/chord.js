import * as Scale from 'tonal-scale';
import FunctionCall from './FunctionCall';
import { parseArgument } from '../helpers/parseArguments';

// For now let's strip the spaces out of the chord names
// to simplify the arguments to the (chord ...) function.
const scaleNamesMap = Scale.names().reduce((ob, name) => {
	ob[name.replace(/ /g, '')] = name;
	return ob;
}, {});

export default class Chord extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);

		// Scale.notes takes the arguments in the other order, so the
		// note comes first and then the chord name.
		const key = this.arguments[1].next();
		const scale = this.arguments[0].next();
		if (!scaleNamesMap[scale]) throw new Error(`Chord: ${scale} is not a recognized scale!`);
		const notes = Scale.notes(key, scaleNamesMap[scale]);

		// We don't need to implement our own `next` method because
		// the default for a FunctionCall is to return `this.data.next()`.
		this.data = parseArgument(notes);
	}
}