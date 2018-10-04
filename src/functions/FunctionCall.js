import parseArguments from '../helpers/parseArguments';

class FunctionCall {
	constructor(functionObject) {
		this.type = functionObject.function;
		this.arguments = parseArguments(functionObject.arguments);
	}
	next() {
		if (!this.data) throw new Error(`Function ${this.type} forgot to set this.data`);
		return this.data.next();
	}
	toArray() {
		return this.data.toArray();
	}
}

export default FunctionCall;
