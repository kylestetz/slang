import Block from './Block';
import context from '../helpers/context';
import { parseArgument } from '../helpers/parseArguments';

class Gain extends Block {
	constructor(...args) {
		super(...args);

		this.level = this.arguments[0] || parseArgument(1);
	}

	instantiate() {
		if (this.getPolyMode()) return;

		this.gain = context.createGain();
		this.gain.gain.setValueAtTime(1, context.currentTime, 0);

		this.getInput().connect(this.gain);
		this.gain.connect(this.getOutput());
	}

	schedule(start) {
		if (!this.getPolyMode()) {
			this.gain.gain.setValueAtTime(this.level.next(), context.currentTime, 0);
			return null;
		}

		const gain = context.createGain();
		gain.gain.setValueAtTime(this.level.next(), start, 0);

		return {
			input: gain,
			output: gain,
		};
	}
}

export default Gain;
