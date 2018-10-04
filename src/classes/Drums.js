import Block from './Block';
import context from '../helpers/context';
import { parseArgument } from '../helpers/parseArguments';
import BufferLoader from '../helpers/BufferLoader';
import drumMap from '../helpers/drumMap';

// Taking the easy route here: let's store the drums in
// global variables here so each instance of the `Drums`
// class has access to them.
let loadingDrums = false;
let drumBuffers = [];

class Drums extends Block {
	constructor(...args) {
		super(...args);

		// In the future we can support different drum sets
		// using a simple integer argument.
		this.type = this.arguments[0] || parseArgument(0);

		// Super basic lazy loading of drum sounds.
		// If the buffers don't already exist and we're
		// not trying to load them... do that.
		if (!drumBuffers.length && !loadingDrums) {
			this.loadDrumSounds();
		}
	}

	schedule(start, stop, note, envelope) {
		if (!drumBuffers.length || loadingDrums) return null;
		// we only have 12 samples available but we shouldn't
		// burden the user with that knowledge so let's use
		// mod 12, which allows them to use chords, scales,
		// etc. without having to think about it.
		const drumSound = note % 12;

		const sample = context.createBufferSource();
		sample.buffer = drumBuffers[drumSound];

		sample.start(start);
		sample.stop(stop);

		sample.onended = () => {
			sample.disconnect();
		};

		if (this.getPolyMode()) {
			return {
				output: sample,
			};
		}

		// Finally, if we are in mono mode, just connect the osc to
		// the ouput.
		sample.connect(this.getOutput());

		return envelope; // TODO: Quickfix to keep lint from complaining
	}
	loadDrumSounds() {
		loadingDrums = true;
		// Get a list of files
		const files = Object.keys(drumMap).map(key => drumMap[key].file);
		// Load the files!
		const loader = new BufferLoader(context, files, (list) => {
			// set our global variable to the list of buffers. Done.
			drumBuffers = list;
			loadingDrums = false;
		});
		loader.load();
		return this;
	}
}

export default Drums;
