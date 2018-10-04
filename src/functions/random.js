import FunctionCall from './FunctionCall';
import { parseArgument } from '../helpers/parseArguments';

export default class Random extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);

		if (this.arguments[0] && this.arguments[0].toArray) {
			this.data = this.arguments[0].toArray();
		} else {
			this.data = parseArgument(this.arguments[0]);
		}
	}
	next() {
		return this.data[
			Math.floor(Math.random() * this.data.length)
		].next();
	}
}