import context from '../helpers/context';
import Osc from './Osc';
import Filter from './Filter';

// This object maps available functions to
// the classes that power them.
const classMap = {
	'osc': Osc,
	'filter': Filter,
};

class Sound {
	constructor(graph) {
		this.name = graph.sound.name;

		// We're going to store all of the block
		// instances as a flat object keyed by
		// the block's ID.
		this.model = {};

		// We're also going to store a map of
		// the connections between Blocks. These
		// will be arrays of strings keyed starting
		// at 0.
		this.connections = {};

		// We'll increment this and append it to
		// block IDs to ensure uniqueness.
		this.idFactory = 0;

		// This is for debugging.
		this._graphs = [];

		// ========================================
		// 				INSTANTIATE
		// ========================================

		// Each sound has a final destination node
		// that all of the pipes end with.
		this.output = context.createGain();
		this.output.connect(context.destination);

		// Create the first graph
		this.appendToGraph(graph);

		console.log(this.model);
		console.log(this.connections);
	}

	nextId() {
		return `--${++this.idFactory}`;
	}

	appendToGraph(graph) {
		// take additional graph info and append it
		// to the current sound.

		const nextConnectionKey = Object.keys(this.connections).length;
		this.createGraph(graph.pipe, nextConnectionKey);
		this.connectGraph(nextConnectionKey);

		// Add to the debug graphs array in case
		// we need to poke around.
		this._graphs.push(graph);
	}

	createGraph(pipe, index) {
		// Create a new set of connections.
		this.connections[index] = [];

		const model = pipe.reduce((model, block, i) => {
			const thisId = block.name || `${block.function}${this.nextId()}`;
			if (classMap[block.function]) {
				// If the block was named, we'll stash
				// it by name in the model. Otherwise,
				// give it an internal ID that we can
				// use to reference it.
				model[thisId] = new classMap[block.function](...block.arguments);
				model[thisId].instantiate(/* context */);

				// Add this ID to the connection list.
				this.connections[index].push(thisId);

				return model;
			} else {
				throw new Error(`${this.name}: Block type "${block.function}" does not exist`);
			}
		}, {});

		// Append this all to our model
		this.model = { ...model };
	}

	connectGraph(index) {
		// We're going to loop through and connect each
		// Block to the next. The last one will connect
		// to this Sound's output.

		const connections = this.connections[index];

		const length = this.connections[index].length;

		for (let i = 0; i < length; i++) {
			// If there is an adjacent block...
			if (connections[i] && connections[i + 1]) {
				// Connect them!
				this.model[connections[i]].connect(
					this.model[connections[i + 1]]
				);
			} else {
				// We're at the final block; connect
				// it to the output.
				console.log('connecting', connections[i], 'to the sound.output');
				this.model[connections[i]]
					.getOutput()
					.connect(this.output);
			}
		}
	}

	schedule(queue) {
		// schedule notes by calling into
		// the block instances.

		console.log('current time is', context.currentTime);

		Object.keys(this.model).forEach((id) => {
			this.model[id].schedule(context.currentTime + 1, 69);
		});
	}
}

export default Sound;
