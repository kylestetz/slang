import Random from './random';
import Chord from './chord';
import Repeat from './repeat';
import Flatten from './flatten';
import Reverse from './reverse';

export const functionMap = {
	'random': Random,
	'chord': Chord,
	'repeat': Repeat,
	'flatten': Flatten,
	'reverse': Reverse,
};

export default function(functionObject) {
	if (functionMap[functionObject.function]) {
		return new functionMap[functionObject.function](functionObject);
	}

	throw new Error(`Function ${functionObject.function} does not exist`);
}
