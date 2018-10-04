import Block from './Block';
import tuna from '../helpers/tuna';
import { parseArgument } from '../helpers/parseArguments';

class Delay extends Block {
	constructor(...args) {
		super(...args);

		// Arguments are time, fb, wet, dry, cutoff
		this.time = this.arguments[0] || parseArgument('8n');
		this.feedback = this.arguments[1] || parseArgument(0.1);
		this.wet = this.arguments[2] || parseArgument(0.5);
		this.dry = this.arguments[3] || parseArgument(0.5);
		this.cutoff = this.arguments[4] || parseArgument(11025);

		this.delay = null;
	}

	instantiate() {
		if (this.getPolyMode()) return;

		this.delay = new tuna.Delay({
			delayTime: this.time.next() * 1000,
			feedback: this.feedback.next(),
			wetLevel: this.wet.next(),
			dryLevel: this.dry.next(),
			cutoff: this.cutoff.next(),
			bypass: 0,
		});

		this.getInput().connect(this.delay);
		this.delay.connect(this.getOutput());
	}

	schedule(start) {
		if (!this.getPolyMode()) {
			// update values here
			return null;
		}

		const delay = new tuna.Delay({
			delayTime: this.time.next() * 1000,
			feedback: this.feedback.next(),
			wetLevel: this.wet.next(),
			dryLevel: this.dry.next(),
			cutoff: this.cutoff.next(),
			bypass: 0,
		});

		return {
			input: delay,
			output: delay,
			start,
		};
	}
}

export default Delay;
