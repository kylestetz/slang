import Block from './Block';
import context from '../helpers/context';
import mtof from '../helpers/mtof';

const typeMap = {
	sin: 'sin',
	sine: 'sine',

	tri: 'triangle',
	triangle: 'triangle',

	saw: 'sawtooth',
	sawtooth: 'sawtooth',

	sq: 'square',
	square: 'square',
}

class Osc extends Block {
	constructor(type = 'sine') {
		super();

		this.type = type;
		console.log('Hello I am an oscillator, got type', type);
	}

	schedule(timestamp, note) {
		console.log('Osc::schedule', timestamp);

		const osc = context.createOscillator();

		osc.type = typeMap[this.type];
		osc.frequency.setValueAtTime(mtof(note), context.currentTime, 0);
		osc.connect(this.getOutput());

		osc.start(timestamp);
		osc.stop(timestamp + .25);

		osc.onended = () => osc.disconnect();
	}
}

export default Osc;
