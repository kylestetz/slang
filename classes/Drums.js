import { Note } from 'tonal';
import Block from './Block';
import context from '../helpers/context';
import mtof from '../helpers/mtof';
import { parseArgument } from '../helpers/parseArguments';
import BufferLoader from '../helpers/BufferLoader';
import drumMap from '../helpers/drumMap';

const typeMap = {
	0: 'acoustic',
	1: '808'
}

// Taking the easy route here: let's store the drums in
// global variables here so each instance of the `Drums`
// class has access to them.
let loadingDrums = {
	acousting: false,
	808: false,
}

let drumBuffers = {
	acoustic: [],
	808: [],
}

class Drums extends Block {
	constructor(...args) {
		super(...args);

		// this.arguments will be used to set the type
		this.type = this.arguments[0] || parseArgument(0);
		this.drumType = typeMap[this.type.next()];

		// if we don't have buffers for this specific type and we're
		// not already loading them, go ahead and load them.
		if (!drumBuffers[this.drumType].length || !loadingDrums[this.drumType]) {
			this.loadDrumSounds();
		}
	}

	schedule(start, stop, note, envelopeMode) {
		if (!drumBuffers[this.drumType].length || loadingDrums[this.drumType]) return;
		// we only have 12 samples available but we shouldn't
		// burden the user with that knowledge so let's use
		// mod 12, which allows them to use chords, scales,
		// etc. without having to think about it.
		const drumSound = note % 12;

		const sample = context.createBufferSource();
		sample.buffer = drumBuffers[this.drumType][drumSound];

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
	}
	loadDrumSounds() {
		loadingDrums[this.drumType] = true;
		// Decide which map to use based on type
		// Get a list of files
		const files = Object.keys(drumMap[this.drumType]).map(key => drumMap[this.drumType][key].file);
		// Load the files!
		const loader = new BufferLoader(context, files, list => {
			// set our global variable to the list of buffers. Done.
			drumBuffers[this.drumType] = list;
			loadingDrums[this.drumType] = false;
		});
		loader.load();
	}
}

export default Drums;
