import Block from './Block';
import context from '../helpers/context';
import mtof from '../helpers/mtof';
import { Note } from 'tonal';

const typeMap = {
	sin: 'sin',
	sine: 'sine',

	tri: 'triangle',
	triangle: 'triangle',

	saw: 'sawtooth',
	sawtooth: 'sawtooth',

	sq: 'square',
	square: 'square',
}

class Osc extends Block {
	constructor(type = 'sine') {
		super();

		this.type = type;
	}

	schedule(timestamp, note) {
		console.log('Osc::schedule', timestamp);

		const osc = context.createOscillator();

		console.log(note, Note.freq(Note.fromMidi(note)));

		osc.type = typeMap[this.type];
		osc.frequency.setValueAtTime(
			typeof note === 'string' ? Note.freq(note) : Note.freq(Note.fromMidi(note)),
			context.currentTime,
			0
		);

		osc.start(timestamp);
		osc.stop(timestamp + .25);

		osc.onended = () => {
			osc.disconnect();
		};

		if (this.getPolyMode()) {
			// An osc has no input! Not sure
			// what to do about that.
			return {
				output: osc,
			};
		}

		osc.connect(this.getOutput());
	}
}

export default Osc;
