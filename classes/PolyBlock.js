import Block from './Block';
import classMap from './classMap';

class PolyBlock extends Block {
	constructor({ blocks }) {
		super();
		this.blockDefinitions = blocks;
		this.blocks = [];
	}
	instantiate() {
		// Turn the block model objects into Block classes.
		this.blocks = this.blockDefinitions.map((block) => {
			if (classMap[block.function]) {
				// We're doing the same thing that the Sound
				// class is doing with the blocks here, but
				// in `schedule` we're going to do some tricks
				// to link together all of the sounds in a
				// polyphonic way.
				const b = new classMap[block.function](...block.arguments);
				// Tell this block it's in poly mode.
				b.setPolyMode(true);
				b.instantiate();
				return b;
			} else {
				throw new Error(`PolyBlock: Block type "${block.function}" does not exist`);
			}
		});
	}
	schedule(timestamp, note) {
		// Here's where we do the polyphonic magic.
		// All of our blocks have already been told
		// to act in poly mode, so the return value
		// of their `schedule` calls will be an
		// audio node.

		// First, map through the blocks and collect
		// the nodes they return.
		const connections = this.blocks.map(block => block.schedule(timestamp, note));

		// Now loop through them and chain them together.
		for (let i = 0; i < connections.length; i++) {
			// If there is an adjacent block...
			if (connections[i] && connections[i + 1]) {
				// Connect them!
				connections[i].output.connect(
					connections[i + 1].input
				);
			} else {
				// We're at the final block; connect
				// it to the output.
				connections[i].output.connect(this.getOutput());
			}
		}
	}
}

export default PolyBlock;