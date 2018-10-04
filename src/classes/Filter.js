import Block from './Block';
import context from '../helpers/context';
import { parseArgument } from '../helpers/parseArguments';

const typeMap = {
	lp: 'lowpass',
	hp: 'highpass',
	bp: 'bandpass',
	n: 'notch',
};

class Filter extends Block {
	constructor(...args) {
		super(...args);

		this.type = this.arguments[0] || parseArgument('lp');
		this.amount = this.arguments[1] || parseArgument(100);
		this.Q = this.arguments[2] || parseArgument(1);
	}

	instantiate() {
		if (this.getPolyMode()) return;

		this.filter = context.createBiquadFilter();
		// We're not calling `next()` on our parameters yet because
		// the schedule method will take care of that; otherwise we'll
		// end up with the second value in a cycle on the first
		// scheduled note.
		this.filter.type = typeMap['lp'];
		this.filter.frequency.setValueAtTime(11025, context.currentTime, 0);
		this.filter.Q.setValueAtTime(1, context.currentTime, 0);

		this.getInput().connect(this.filter);
		this.filter.connect(this.getOutput());
	}

	schedule(start, stop, note, envelopeMode) {
		if (!this.getPolyMode()) {
			// If we're not in poly mode we still want to swap values
			// on the filter if our arguments are lists.
			this.filter.type = typeMap[this.type.next()];
			this.filter.frequency.setValueAtTime((this.amount.next() / 127) * 11025, start, 10);
			this.filter.Q.setValueAtTime(this.Q.next(), start, 10);
			return;
		}

		const filter = context.createBiquadFilter();
		filter.type = typeMap[this.type.next()];
		filter.frequency.setValueAtTime((this.amount.next() / 127) * 11025, context.currentTime, 0);
		filter.Q.setValueAtTime(this.Q.next(), context.currentTime, 0);

		// TODO: envelope mode to return filter.frequency as property

		if (envelopeMode) {
			return {
				node: filter,
				property: filter.frequency,
			};
		}

		return {
			input: filter,
			output: filter,
		};
	}
}

export default Filter;
