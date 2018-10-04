import List from './List';
import FunctionCall from '../functions';

let TEMPO = 120;

export function rhythmMap () {
	const DIVISION = (1 / 24) / (TEMPO / 60);
	return {
		'64t': DIVISION,
		'64n': DIVISION * 1.5,
		'32t': DIVISION * 2,
		'32n': DIVISION * 3,
		'16t': DIVISION * 4,
		'16n': DIVISION * 6,
		'8t': DIVISION * 8,
		'8n': DIVISION * 12,
		'4t': DIVISION * 16,
		'4n': DIVISION * 24,
		'2t': DIVISION * 32,
		'2n': DIVISION * 48,
		'1n': DIVISION * 96,
	};
}

/*
	ARGUMENTS
	Arguments within blocks and functions can be numbers,
	lists, notes, etc. Rather than doing a lot of type
	checking within our subclasses, let's turn every single
	argument into a consistent api, using `next()`. If it's
	a list, `next` will cycle through all of the values.
	If it's a static value, `next` will return that value.
*/

export default function(args) {
	return args.map((arg) => parseArgument(arg));
}

export function parseArgument(arg) {
	// If this argument is already nextable, no need to do anything.
	if (arg && typeof arg.next === 'function') return arg;

	if (
		typeof arg === 'number'
		|| typeof arg === 'string'
	) return createArgumentFromStaticValue(arg);

	if (
		Array.isArray(arg)
		|| arg.type === 'list'
	) return new List(arg);

	if (arg.type === 'function') return new FunctionCall(arg);

	return null;
}
export function changeTempo(tempo) {
	let min = 30;
	let max = 500;
	const newTempo = Math.max(Math.min(tempo, max), min);
	TEMPO = isNaN(newTempo) ? TEMPO : newTempo;
}

function createArgumentFromStaticValue(value) {
	const rhythmMapObj = rhythmMap()
	// convert rhythms into numbers if we catch one
	return {
		next: () => rhythmMapObj[value] || value,
	};
}