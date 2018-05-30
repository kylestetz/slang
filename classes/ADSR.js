import Block from './Block';
import context from '../helpers/context';

class ADSR extends Block {
	constructor(attack = 0.1, decay = 0, sustain = 1, release = 0.1) {
		super();

		this.attack = attack;
		this.decay = decay;
		this.sustain = sustain;
		this.release = release;
	}

	schedule(timestamp) {
		// this'll be hard I guess.
	}
}

export default ADSR;
