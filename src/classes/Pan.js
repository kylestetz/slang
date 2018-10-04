import StereoPannerNode from 'stereo-panner-node';
import Block from './Block';
import context from '../helpers/context';
import { parseArgument } from '../helpers/parseArguments';

StereoPannerNode.polyfill();

class Pan extends Block {
	constructor(...args) {
		super(...args);

		this.value = this.arguments[0] || parseArgument(0);
	}

	instantiate() {
		if (this.getPolyMode()) return;

		this.pan = context.createStereoPanner();
		this.pan.pan.setValueAtTime(0, context.currentTime, 0);

		this.getInput().connect(this.pan);
		this.pan.connect(this.getOutput());
	}

	schedule(start) {
		if (!this.getPolyMode()) {
			this.pan.pan.setValueAtTime(this.value.next(), context.currentTime, 0);
			return null;
		}

		const pan = context.createStereoPanner();
		pan.pan.setValueAtTime(this.value.next(), context.currentTime, 0);

		return {
			input: pan,
			output: pan,
			start,
		};
	}
}

export default Pan;
