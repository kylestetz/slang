import Random from './random';
import Chord from './chord';
import Repeat from './repeat';
import Flatten from './flatten';
import Reverse from './reverse';
import Shuffle from './shuffle';
import Transpose from './transpose';
import Interpolate from './interpolate';

export const functionMap = {
	'random': Random,
	'chord': Chord,
	'repeat': Repeat,
	'flatten': Flatten,
	'reverse': Reverse,
	'shuffle': Shuffle,
	'transpose': Transpose,
	'lerp': Interpolate,
};

export default function(functionObject) {
	if (functionMap[functionObject.function]) {
		return new functionMap[functionObject.function](functionObject);
	}

	throw new Error(`Function ${functionObject.function} does not exist`);
}
