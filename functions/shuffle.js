import shuffle from 'lodash/shuffle';
import { parseArgument } from '../helpers/parseArguments';
import FunctionCall from './FunctionCall';
import List from '../helpers/List';

export default class Shuffle extends FunctionCall {
	constructor(functionObject) {
		super(functionObject);
		this.data = new List(_.shuffle(this.arguments[0].toArray()));
	}
}
