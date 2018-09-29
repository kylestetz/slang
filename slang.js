import util from 'util';
import ohm from 'ohm-js';
import range from 'lodash/range';
import * as Range from 'tonal-range';
import grammarDefinition from './slang-grammar';
import runtime from './runtime';

const grammar = ohm.grammar(grammarDefinition);
const semantics = grammar.createSemantics();

semantics.addOperation('toAST', {
	Comment(hash, text) {
		return {
			type: 'comment',
		};
	},
	Line: rule => rule.toAST(),
	Graph(soundAccessor, tilde, firstPolyBlock, pipe) {
		let pipeAST = pipe.toAST();
		// This set of pipes might not exist at all,
		// in which case we want to default to an
		// empty array so nothing fails.
		pipeAST = (pipeAST && pipeAST[0]) || [];
		return {
			type: 'graph',
			sound: soundAccessor.toAST(),
			pipe: [firstPolyBlock.toAST(), ...pipeAST],
		};
	},
	Pipe: (char, soundBlock) => soundBlock.toAST(),

	function: (lp, soundArguments, rp) => {
		const [func, ...rest] = soundArguments.asIteration().toAST();
		return {
			type: 'function',
			function: func,
			arguments: rest,
		};
	},

	PolySoundBlock(monoSB, plus, rest) {

		// Because of the way we wrote the parser,
		// normal non-polyphonic blocks will still
		// hit the PolySoundBlock definition. It's
		// easy to tell if it's really polyphonic
		// or not, though: just see if the `rest`
		// has a length.
		const polyblocks = rest.toAST();
		if (!polyblocks.length) {
			return monoSB.toAST();
		}

		// If we're here it really *is* polyphonic,
		// so let's return a structured polyblock
		// object with a list of Blocks.
		return {
			type: 'polyblock',
			blocks: [monoSB.toAST(), ...rest.toAST()],
		};
	},

	MonoSoundBlock(lp, list, rp, name) {
		const [func, ...rest] = list.asIteration().toAST();
		return {
			type: 'block',
			// This is the name of the block function.
			function: func,
			// This is will be a list of soundArguments.
			arguments: rest,
			name: name.sourceString,
		}
	},

	// soundArgument: s => s.sourceString,
	soundAccessor(sound, property) {
		return {
			name: sound.sourceString,
			property: property.sourceString,
		};
	},

	Play(kw, sound, pattern) {
		return {
			type: 'play',
			sound: { name: sound.sourceString },
			patterns: pattern.asIteration().toAST(),
		};
	},

	list(lb, soundArguments, rb) {
		return {
			type: 'list',
			arguments: soundArguments.asIteration().toAST(),
		};
	},

	range_number(lb, arg1, __, arg2, rb) {
		return {
			type: 'list',
			arguments: range(
				parseInt(arg1.sourceString),
				parseInt(arg2.sourceString)
			),
		};
	},

	range_note(lb, arg1, __, arg2, rb) {
		return {
			type: 'list',
			arguments: Range.chromatic(
				[arg1.sourceString, arg2.sourceString]
			),
		};
	},

	int: (neg, i) => neg.sourceString ? parseInt(i.sourceString) * -1 : parseInt(i.sourceString),
	float: (f) => parseFloat(f.sourceString),
	note: n => isNaN(n.sourceString) ? n.sourceString : +n.sourceString,
	rhythm: (r, num, beat) => r.sourceString + num.sourceString + beat.sourceString,
});

export function runScene(text) {
	// The parser can handle one line at a time
	// so we'll need to prepare an array with
	// "lines of code" that can be parsed individually.
	// Since we're going to support extending code
	// onto the next line when it starts with a tab
	// we'll have to do some extra work to figure out
	// what exactly a line means.

	const sceneLines = text
		// 1. split them by newline
		.split('\n')
		// 2. filter out empty lines
		.filter(l => !!l.trim())
		// 3. reduce the current set
		//    by appending tab-prefixed
		//    lines onto their predecessor.
		.reduce((lines, thisLine, i) => {
			// If the line starts with a tab
			// add the contents onto the last line.
			if (thisLine.startsWith('\t') && lines.length) {
				// Ohm doesn't consider tabs as whitespace,
				// so let's trim the edges and use a space instead.
				const padWithSpace = (
					!lines[lines.length - 1].trim().endsWith('[')
					&& !thisLine.trim().startsWith(']')
				);
				lines[lines.length - 1] += (padWithSpace ? ' ' : '') + thisLine.trim();
			} else {
				// This is a normal line. Add it to the array.
				lines.push(thisLine);
			}

			return lines;
		}, []);

	// Now that we have the definitive set of code lines,
	// let's parse them!
	const parsedScene = sceneLines
		.map((s, i) => {
			// First we call grammar.match, which
			// returns a structured Ohm MatchObject.
			const match = grammar.match(s);
			// This might fail, in which case it's
			// on us to define what the experience
			// of that failure is. This is a rabbit
			// hole; for now let's just throw it and
			// put it on the screen.
			if (!match.succeeded()) {
				// These errors are not going to have
				// the correct line numbers because
				// of the pre-processing step above
				// that trimmed and concatenated lines
				// that start with tabs + whitespace.
				// This is what source maps are for!
				// Those seem complicated so instead
				// let's be marginally helpful by
				// referencing which "command" it is.
				throw new Error(
					String(match.message)
						.replace('Line 1', `Command ${i}`)
						.replace('> 1 | ', '>     ')
				);
			}
			// Next we give that to the semantics tool
			// that we imbued with the `toAST` operation.
			// That will turn our parsed grammar into a
			// Concrete Syntax Tree, which is the blob
			// of data our interpreter needs to run the code.
			return semantics(match).toAST();
		})
		// The runtime doesn't care about comment lines
		// so let's throw them away.
		.filter(line => line.type !== 'comment');

	// I'm sure there are better ways to approach this,
	// but for now let's preemptively clear the scene.
	runtime.clearScene();

	console.log('%cRunning scene! Parsed syntax tree:', 'color: green;', parsedScene);

	// Start the show!
	runtime.runScene(parsedScene);
}

export function clearScene() {
	runtime.clearScene();
}
