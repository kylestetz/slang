import context from '../helpers/context';
import { parseArgument, rhythmMap } from '../helpers/parseArguments';
import List from '../helpers/List';

export default class Scheduler {
	constructor(patterns) {
		// Start with defaults for
		// each of the patterns.

		// a list of rhythm lengths
		this.rhythmPattern = parseArgument('8n');
		// a List of notes
		this.notePattern = parseArgument(69);

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
		// the default patterns. All three of these
		// functions only accept one argument, which
		// is why we're pulling arguments[0] out.
		patterns.forEach((pattern) => {
			switch (pattern.function) {
				case 'rhythm':
					// We have to special-case rhythm argument parsing
					// for now because the xoxoxo-style pattern is not
					// recognized by the parser as a List.
					this.rhythmPattern = parseArgument(pattern.arguments[0])
					break;
				case 'notes':
					this.notePattern = parseArgument(pattern.arguments[0]);
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
			const rhythmMapObj = rhythmMap()
			while (this.currentTime < context.currentTime + this.lookahead) {
				// The tick length could be a number or a string that starts
				// with 'r', indicating a rest.
				let nextTickLength = this.rhythmPattern.next();
				// Let's start by assuming it's not a rest.
				let rest = false;
				// if it's a string and it starts with R, it is a rest.
				if (typeof nextTickLength === 'string' && nextTickLength.charAt(0).toLowerCase() === 'r') {
					rest = true;
					// Convert it into the appropriate rhythm.
					nextTickLength = rhythmMapObj[nextTickLength.substr(1)];
				}
				// We're only ticking on beats that aren't rests.
				if (!rest) {
					const nextNote = this.notePattern.next();
					// schedule stuff!
					this.tickCallback(
						// start time
						this.currentTime,
						// stop time
						// this.currentTime + this.lengthPattern.next(),
						this.currentTime + nextTickLength,
						// note
						nextNote
					);
				}
				// go to the next beat in the clock
				this.currentTime += nextTickLength;
			}
		}, 40);
	}

	stop() {
		this.interval = clearInterval(this.interval);
	}
}