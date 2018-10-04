import { Note } from 'tonal';
import Block from './Block';
import context from '../helpers/context';
import { parseArgument } from '../helpers/parseArguments';

const typeMap = {
	sin: 'sin',
	sine: 'sine',

	tri: 'triangle',
	triangle: 'triangle',

	saw: 'sawtooth',
	sawtooth: 'sawtooth',

	sq: 'square',
	square: 'square',
};

class Osc extends Block {
	constructor(...args) {
		super(...args);

		// We'll have this.arguments available to us now,
		// which did the work of parsing lists and functions
		// if they were passed in.
		this.type = this.arguments[0] || parseArgument('sine');
		this.detune = this.arguments[1] || parseArgument(0);
	}

	schedule(start, stop, note, envelopeMode) {
		const osc = context.createOscillator();

		osc.type = typeMap[this.type.next()];

		const noteMidiValue = typeof note === 'string' ? Note.midi(note) : note;
		osc.frequency.setValueAtTime(
			Note.freq(Note.fromMidi(noteMidiValue + this.detune.next())),
			context.currentTime,
			0,
		);

		osc.start(start);
		// Envelope mode is a flag that an ADSR envelope will pass
		// into Osc if it is controlling this Block. This is the
		// only reasonable way to solve the problem of the envelope
		// needing to control the stop time.
		if (!envelopeMode) osc.stop(stop);

		osc.onended = () => {
			osc.disconnect();
		};

		// Envelope mode returns the osc without setting stop, while
		// poly mode returns the consistent input/output interface.

		if (envelopeMode) {
			return {
				node: osc,
				property: osc,
			};
		} else if (this.getPolyMode()) {
			// An osc has no input! Not sure
			// what to do about that.
			return {
				output: osc,
			};
		}

		// Finally, if we are in mono mode, just connect the osc to
		// the ouput.
		osc.connect(this.getOutput());

		return null;
	}
}

export default Osc;
