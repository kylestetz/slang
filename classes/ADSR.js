import ADSREnvelope from 'adsr-envelope';
import Block from './Block';
import classMap from './classMap';
import context from '../helpers/context';
import { parseArgument } from '../helpers/parseArguments';

/*
	ADSR Envelope
	The envelope is a special beast because it needs to have
	some knowledge and control over another Block. I was hoping
	I could make it work as an adjacent pipe, e.g. (osc) + (adsr),
	but that proved too weird and difficult to manage. Instead
	we're going to embrace the nested nature of our language and
	make the first argument a Block. This way we have full control
	over the block and can see what type it is to adjust our numbers
	accordingly.

	Usage:
		@synth (adsr (osc tri) .1 0 1 .2)
*/

class ADSR extends Block {
	constructor(block, ...args) {
		super(...args);

		if (!block.type || block.type !== 'function') {
			throw new Error('ADSR needs a block as its first argument, e.g. (osc sine)');
		}

		this.block = new classMap[block.function](...block.arguments);
		this.block.setPolyMode(true);
		this.block.instantiate();
		this.blockType = block.function;

		this.attack = this.arguments[0] || parseArgument(0.05);
		this.decay = this.arguments[1] || parseArgument(0);
		this.sustain = this.arguments[2] || parseArgument(1);
		this.release = this.arguments[3] || parseArgument(0.05);

		this.envelope = new ADSREnvelope({
			attackTime: 0.05,
			decayTime: 0,
			peakLevel: 1,
			sustainLevel: 1,
			releaseTime: 0.05,
			gateTime: 0.25,
			releaseCurve: "exp",
		});
	}

	schedule(start, stop, note) {
		// Create our envelope
		const env = this.envelope.clone();
		env.attackTime = this.attack.next();
		env.decayTime = this.decay.next();
		env.sustainLevel = this.sustain.next();
		env.releaseTime = this.release.next();
		env.peakLevel = this.blockType === 'filter' ? 11025 : 1;
		env.gateTime = stop - start;


		// Schedule our block in "envelope mode", which will return
		// either an oscillator (for calling `stop` on) or a node
		// that we can connect to our gain.
		const scheduleResult = this.block.schedule(start, stop, note, true);
		console.log('scheduleResult', scheduleResult);

		// I don't love this logic, but there are two very separate
		// behaviors here depending on what the envelope applies to.
		// Of it's an oscillator, the envelope's gain is part of the
		// audio signal and we need to control the stop time.
		// If it's any other block, we get a property passed back that
		// our gain node applies to.
		let gain;
		if (this.blockType === 'osc') {
			gain = context.createGain();
			env.applyTo(gain.gain, start);
			scheduleResult.node.stop(start + env.duration);
			scheduleResult.node.connect(gain);
		} else {
			// connect the gain to the property that was passed back
			env.applyTo(scheduleResult.property);
		}

		if (this.getPolyMode()) {
			return {
				input: scheduleResult.node,
				output: this.blockType === 'osc' ? gain : scheduleResult.node,
			};
		}

		if (this.blockType === 'osc') {
			gain.connect(this.getOutput());
		} else {
			scheduleResult.node.connect(this.getOutput());
		}

		// TODO: only create gain for osc, otherwise apply to existing property
	}
}

export default ADSR;
