import context from '../helpers/context';

const TEMPO = 120;
const DIVISION = 1 / (TEMPO * 1/60) / 2;

export default class Scheduler {
	constructor(patterns) {
		// These will be our defaults.
		this.drumPattern = 'x';
		this.drumPatternIndex = 0;

		this.notePattern = [69];
		this.notePatternIndex = 0;

		// Not implemented yet!
		this.timePattern = [DIVISION];
		this.timePatternIndex = 0;

		// Store a callback to the Sound here.
		this.tickCallback = null;
		// Stash a ref to the setInterval id
		this.interval = null;

		// CLOCK

		// currentTs will keep track of which
		// tick we've scheduled up to.
		this.currentTime = null;
		this.lookahead = .04;
		this.startTime = null;

		// Loop through whatever we got and overwrite
		// the default patterns.
		patterns.forEach(({ type, pattern }) => {
			switch (type) {
				case 'DrumPattern':
					this.drumPattern = pattern.split('');
					break;
				case 'NotePattern':
					this.notePattern = pattern;
					break;
				case 'TimePattern':
					this.timePattern = pattern;
					break;
				default:
					break;
			}
		});
	}

	tick(callback) {
		this.tickCallback = callback;
	}

	start(timestamp) {
		this.startTime = timestamp;
		this.currentTime = timestamp;

		this.interval = setInterval(() => {
			while (this.currentTime < context.currentTime + this.lookahead) {
				// We only want to schedule notes on x's
				if (this.drumPattern[this.drumPatternIndex] === 'x') {
					// schedule stuff!
					this.tickCallback(this.currentTime, this.notePattern[this.notePatternIndex]);
					// increment the note
					this.notePatternIndex = (this.notePatternIndex + 1) % this.notePattern.length;
				}
				// increment the drum pattern at every beat
				this.drumPatternIndex = (this.drumPatternIndex + 1) % this.drumPattern.length;
				// go to the next beat in the clock
				this.currentTime += DIVISION;
			}
		}, 40);
	}

	stop() {
		this.interval = clearInterval(this.interval);
	}
}