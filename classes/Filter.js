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
		this.filter = context.createBiquadFilter();
		this.filter.type = typeMap[this.type];
		this.filter.frequency.setValueAtTime((this.amount / 127) * 22050, context.currentTime, 0);
		this.filter.Q.setValueAtTime(this.Q, context.currentTime, 0);

		this.getInput().connect(this.filter);
		this.filter.connect(this.getOutput());
	}
}

export default Filter;
