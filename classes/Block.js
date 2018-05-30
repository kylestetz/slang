import context from '../helpers/context';

/*
	BLOCK class
	This class provides a consistent interface
	for all blocks. Each block has input and
	output gain nodes which, while a bit
	extraneous in terms of the audio graph,
	give us a way to automatically connect
	blocks so specific block instances don't
	have to worry about it.
*/

class Block {
	constructor() {
		// This input allows us to give each
		// block a consistent interface without
		// having to name it all particular.
		this._input = context.createGain();
		this._output = context.createGain();
	}

	instantiate() {
		// This is where each subclass will set up
		// its audio graph. The methods getInput()
		// and getOutput() give us an easy way to
		// connect everything together.
	}

	connect(block) {
		// The target block has `.getInput()`,
		// allowing us to connect our own internal
		// nodes to it. We could just connect the
		// class variables directly, but perhaps
		// specific blocks will have a reason to
		// override _input and _output. Who knows.
		this.getOutput().connect(block.getInput());
	}

	schedule(timestamp) {
		// use the timestamp to schedule calls to
		// oscillators or what have you.
	}

	getInput() {
		return this._input;
	}

	getOutput() {
		return this._output;
	}
}

export default Block;
