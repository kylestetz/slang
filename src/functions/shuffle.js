import shuffle from 'lodash/shuffle';
import FunctionCall from './FunctionCall';
import List from '../helpers/List';

export default class Shuffle extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);
		this.data = new List(shuffle(this.arguments[0].toArray()));
	}
}
