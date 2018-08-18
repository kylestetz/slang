import Scheduler from './Scheduler';
import context from '../helpers/context';
import PolyBlock from './PolyBlock';
import classMap from './classMap';

class Sound {
	constructor(graph) {
		this.name = graph.sound.name;

		// We're going to store all of the block
		// instances as a flat object keyed by
		// the block's ID.
		this.model = {};
		this.schedulers = [];

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
		this.output.gain.setValueAtTime(0.5, context.currentTime, 0);
		this.output.connect(context.destination);

		// Create the first graph
		this.appendToGraph(graph);
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
			// A block can either be a simple Block function
			// like `osc` & `filter`, OR it can be a polyblock.
			// We have to treat those two cases differently.

			if (block.type && block.type === 'polyblock') {
				// It seems like PolyBlocks aren't going to
				// be able to support name variables? Tbd.
				const thisId = `poly${this.nextId()}`;
				model[thisId] = new PolyBlock(block);
				model[thisId].instantiate();

				this.connections[index].push(thisId);

				return model;
			} else {
				const thisId = block.name || `${block.function}${this.nextId()}`;
				if (classMap[block.function]) {
					// If the block was named, we'll stash
					// it by name in the model. Otherwise,
					// give it an internal ID that we can
					// use to reference it.
					model[thisId] = new classMap[block.function](...block.arguments);
					model[thisId].instantiate();

					// Add this ID to the connection list.
					this.connections[index].push(thisId);

					return model;
				} else {
					throw new Error(`${this.name}: Block type "${block.function}" does not exist`);
				}
			}
		}, {});

		// Append this all to our model
		this.model = {
			...this.model,
			...model,
		};
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
				this.model[connections[i]]
					.getOutput()
					.connect(this.output);
			}
		}
	}

	schedule(patterns) {
		// This method is called once for each new set of
		// patterns to use. We'll create a scheduler for
		// each one.

		const scheduler = new Scheduler(patterns);

		scheduler.tick((start, stop, note) => {
			Object.keys(this.model).forEach((id) => {
				this.model[id].schedule(start, stop, note);
			});
		});

		this.schedulers.push(scheduler);
	}

	start(timestamp) {
		this.schedulers.forEach(scheduler => scheduler.start(timestamp));
	}

	destroy() {
		this.schedulers.forEach(scheduler => scheduler.stop());

		Object.keys(this.model).forEach((id) => {
			this.model[id].destroy();
		});

		this.output.disconnect();
	}
}

export default Sound;
