import Block from './Block';
import context from '../helpers/context';

const typeMap = {
	lp: 'lowpass',
	hp: 'highpass',
	bp: 'bandpass',
	n: 'notch',
};

class Filter extends Block {
	constructor(type = 'lp', amount = 100, Q = 1) {
		super();

		this.type = type;
		this.amount = amount;
		this.Q = Q;
	}

	instantiate() {
		if (this.getPolyMode()) return;

		this.filter = context.createBiquadFilter();
		this.filter.type = typeMap[this.type];
		this.filter.frequency.setValueAtTime((this.amount / 127) * 11025, context.currentTime, 0);
		this.filter.Q.setValueAtTime(this.Q, context.currentTime, 0);

		this.getInput().connect(this.filter);
		this.filter.connect(this.getOutput());
	}

	schedule() {
		if (!this.getPolyMode()) return;

		const filter = context.createBiquadFilter();
		filter.type = typeMap[this.type];
		filter.frequency.setValueAtTime((this.amount / 127) * 11025, context.currentTime, 0);
		filter.Q.setValueAtTime(this.Q, context.currentTime, 0);

		return {
			input: filter,
			output: filter,
		};
	}
}

export default Filter;
