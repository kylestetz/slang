import ADSREnvelope from 'adsr-envelope';
import Block from './Block';
import context from '../helpers/context';

class ADSR extends Block {
	constructor(attack = 0.1, decay = 0, sustain = 1, release = 0.1) {
		super();

		this.attack = attack;
		this.decay = decay;
		this.sustain = sustain;
		this.release = release;

		this.envelope = new ADSREnvelope({
			attackTime: attack,
			decayTime: decay,
			peakLevel: 1,
			sustainLevel: sustain,
			releaseTime: release,
			gateTime: 0.25,
			releaseCurve: "exp",
		});
	}

	schedule(timestamp) {
		if (!this.getPolyMode()) {
			throw new Error(
				'ADSR can only be used in poly mode! Use + instead of ~ when piping sound into it.'
			);
		}

		const gain = context.createGain();
		const env = this.envelope.clone();
		env.applyTo(gain.gain, timestamp);

		return {
			input: gain,
			output: gain,
		};
	}
}

export default ADSR;
