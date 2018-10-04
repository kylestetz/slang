import { flatMap } from 'lodash';
import FunctionCall from './FunctionCall';
import List from '../helpers/List';

export default class Flatten extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);

		// All arguments must be arrays.
		const data = flatMap(this.arguments[0].toArray(), (arg) => {
			if (arg.toArray) return arg.toArray();
			return arg;
		});

		this.data = new List(data);
	}
}
