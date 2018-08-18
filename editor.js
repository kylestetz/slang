import { runScene, clearScene } from './slang';

import CodeMirror from 'codemirror';
import * as simpleMode from 'codemirror/addon/mode/simple';
import js from 'codemirror/mode/clojure/clojure';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/duotone-light.css';

import classMap from './classes/classMap';
import { functionMap } from './functions';

const keywords = Object.keys(classMap).concat(Object.keys(functionMap), ['notes', 'rhythm']);
const keywordRegex = new RegExp(`(?:${keywords.join('|')})\\b`);

CodeMirror.defineSimpleMode("slang", {
	start: [
		{
			regex: keywordRegex,
			token: "keyword"
		},
		{
			regex: /[a-g](\#|b)?\d+/i,
			token: "note"
		},
		{
			regex: /\d+(n|t)/i,
			token: "beat"
		},
		{
			regex: /r\d+(n|t)/i,
			token: "rest"
		},
		{
			regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,
			token: "number"
		},
		{
			regex: /(\+|\~)/,
			token: "pipe"
		},
		{
			regex: /\#.+/,
			token: "comment"
		},
		{
			regex: /\@[a-z$][\w$]*/,
			token: "variable"
		},
	],
});

const existingCode = window.localStorage.getItem('code');

const editor = CodeMirror(document.querySelector('#editor'), {
	value: existingCode || '',
	mode:  'slang',
	theme: 'duotone-light',
	indentWithTabs: true,
});

editor.on('keydown', (c, e) => {
	if (e.key === 'Enter' && e.metaKey && e.shiftKey) {
		clearScene();
	} else if (e.key === 'Enter' && e.metaKey) {
		const value = editor.getValue();
		runScene(value);
		// save the scene to localStorage
		window.localStorage.setItem('code', value);
	}
});
