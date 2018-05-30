import util from 'util';
import ohm from 'ohm-js';
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
	Graph(soundAccessor, pipe) {
		return {
			type: 'graph',
			sound: soundAccessor.toAST(),
			pipe: pipe.toAST()[0],
		};
	},
	Pipe: (char, soundBlock) => soundBlock.toAST(),
	SoundBlock(fn, lp, list, rp, name) {
		return {
			type: 'block',
			// This is the name of the block function.
			function: fn.sourceString,
			// This is going to product a list of soundArguments.
			arguments: list.asIteration().toAST(),
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

// '@synth.osc1 ~ filter(hp, 3, 4) ~ gain(0)'
// 'play @synth |xoxoxoo|, {60 61 62}, [1 .2 .3]'

const scene = `

@synth ~ osc(tri) ~ filter(lp, 1)
play @synth |xox| {E3 F3 D2 G3} [.1 .3 1]

`;

const sceneLines = scene
	.split('\n')
	.filter(l => !!l);

const parsedScene = sceneLines
	.map(s => semantics(grammar.match(s)).toAST())
	.filter(line => line.type !== 'comment');

// console.log(util.inspect(parsedScene, {showHidden: false, depth: null}))

runtime.runScene(parsedScene);



