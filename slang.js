import util from 'util';
import ohm from 'ohm-js';
import grammarDefinition from './slang-grammar';
import runtime from './runtime';

import CodeMirror from 'codemirror';
import js from 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/duotone-light.css';

const grammar = ohm.grammar(grammarDefinition);
const semantics = grammar.createSemantics();

semantics.addOperation('toAST', {
	Comment(hash, text) {
		return {
			type: 'comment',
		};
	},
	Line: rule => rule.toAST(),
	Graph(soundAccessor, pipe) {
		return {
			type: 'graph',
			sound: soundAccessor.toAST(),
			pipe: pipe.toAST()[0],
		};
	},
	Pipe: (char, soundBlock) => soundBlock.toAST(),

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

	soundArgument: s => s.sourceString,
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
	DrumPattern(p1, letters, p2) {
		return {
			type: 'DrumPattern',
			pattern: letters.sourceString,
		};
	},
	NotePattern(b1, notes, b2) {
		return {
			type: 'NotePattern',
			pattern: notes.asIteration().toAST(),
		};
	},
	TimePattern(b1, times, b2) {
		return {
			type: 'TimePattern',
			pattern: times.asIteration().toAST(),
		};
	},

	float: (f) => parseFloat(f.sourceString),
	// float_dotStart: (d, f) => parseFloat('0.' + f.sourceString),
	note: n => isNaN(n.sourceString) ? n.sourceString : +n.sourceString,
});


const cm = CodeMirror(document.body, {
  value: "",
  mode:  "javascript",
  theme: 'duotone-light',
});

cm.on('keydown', (c, e) => {
	if (e.key === 'Enter' && e.metaKey) {
		runScene(cm.getValue());
	}
});

function runScene(text) {
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
				lines[lines.length - 1] += (' ' + thisLine.trim());
			} else {
				// This is a normal line. Add it to the array.
				lines.push(thisLine);
			}

			return lines;
		}, []);

	// Now that we have the definitive set of code lines,
	// let's parse them!
	const parsedScene = sceneLines
		.map(s => {
			// First we call grammar.match, which
			// returns a structured Ohm MatchObject.
			const match = grammar.match(s);
			// This might fail, in which case it's
			// on us to define what the experience
			// of that failure is. This is a rabbit
			// hole; for now let's just log it.
			if (!match.succeeded()) throw new Error(match.message);
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

	console.log(parsedScene);

	// Start the show!
	runtime.runScene(parsedScene);
}



