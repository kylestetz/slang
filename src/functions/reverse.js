import FunctionCall from './FunctionCall';
import List from '../helpers/List';

export default class Reverse extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);
		this.data = new List(this.arguments[0].toArray().reverse());
	}
}
