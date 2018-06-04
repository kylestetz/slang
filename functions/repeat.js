import FunctionCall from './FunctionCall';
import { parseArgument } from '../helpers/parseArguments';
import List from '../helpers/List';

export default class Random extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);

		let data;
		this.data = [];

		// The second argument will be either an array or
		// a FunctionCall object. Since we can only repeat
		// JS arrays, call `toArray` on a FunctionCall object
		// to get something we can work with.
		if (this.arguments[1] && this.arguments[1].toArray) {
			data = this.arguments[1].toArray();
		} else {
			data = this.arguments[1];
		}

		const repeat = this.arguments[0].next();

		for (let i = 0; i < repeat; i++) {
			this.data = this.data.concat(data);
		}

		this.data = new List(this.data);
	}
}