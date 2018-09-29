<img
	align="center"
	src="https://github.com/kylestetz/slang/logo.png"
	width="468"
/>

# Slang — An audio programming language built in JS

[Play with Slang](http://slang.kylestetz.com)

Slang was created to explore implementing a programming language entirely in the browser. Parsing is handled by [Ohm.js](https://github.com/harc/ohm) using a [custom grammar](./slang-grammar.js), the editor uses CodeMirror with a simple syntax definition, and the runtime itself is written in JS using the Web Audio API.

### Goals of this project

I have always wanted to write a programming language from scratch, but as someone who didn't study computer science I find it incredibly intimidating. Discovering [Ohm.js](https://github.com/harc/ohm) changed my mind; its incredible editor and approachable JS API make it possible to experiment quickly with a lot of feedback. This project is my first pass at build a language and runtime environment from start to finish.

This is not meant to be a great or comprehensive language itself, but I do hope this project can serve as a roadmap if you'd like to build your own!

You'll notice a distinct lack of in-context error handling, inline docs, helpful UI, etc. Creating a great editor experience was not a goal of this project and it would take a lot of work to get there. I did my best to make it pleasant to use.

# How to write Slang

Slang consists of **sound lines** and **play lines**. Sound lines build up a synthesizer (or drum machine), then play lines tell those synthesizers or drum machines what to play.

It turns out that explaining your own programming language is ridiculously hard, so I suggest skipping to the **Examples** section below and trying those out before reading all of these docs.

## Sound Lines

A sound establishes a variable (which always starts with `@`) that contains a **chain of sounds**.

## Play Lines

A play line starts with the word `play`, followed by the variable you want to play, and then declares a rhythm and notes to use. You can have multiple play lines referencing a single synth and they will all play independently (e.g. if you want to play polyphonic melodies).

`rhythm` accepts a list of rhythm values or a function that returns rhythm values, while `notes` accepts a list of notes or a function that returns notes. Let's look at a simple example and then see how we can take advantage of the more advanced functions.

A simple synth:
```
@synth (adsr (osc sine) 64n 8n 0 8n)
play @synth (rhythm [8n]) (notes [e3 e4 e5])
```

Now let's make a synth that plays a scale using the `(chord)` function. Chord takes a type as its second argument (e.g. `major`, `chromatic`, `phrygian`, etc.) and a root note as its third argument.
```
@synth (adsr (osc tri) 64n 8n 0 8n)
play @synth (rhythm [8n]) (notes (chord lydian e3))
```

Taking it one step further, let's put that `chord` function call within the `random` function, which will randomly pick one of the notes from the chord each time it's called.
```
@synth (adsr (osc tri) 64n 8n 0 8n)
play @synth
	(rhythm [8n])
	(notes (random (chord lydian e3)))
```

The `flatten` and `repeat` functions, when used inside of `notes`, are a powerful way to create repeating phrases. Since `notes` only takes a single list we use the `flatten` function to take a few different calls and flatten them down. The `repeat` function will take the list we give it and repeat it a number of times, saving us some copying & pasting.
```
@synth (adsr (osc sine) 64n 8n 0 8n)
play @synth
	(rhythm [8n])
	(notes (flatten [
		(repeat 3 (chord lydian e4 4))
		(chord lydian d4 4)
	]))
```

## Syntax

Functions are contained within parentheses, much like in Clojure. The first keyword in a function is the **functio name**, which is followed by all of its arguments. Any argument can be a primitive value or a list (neat!); if it's a list, Slang will take one value at a time and loop back to the beginning when it reaches the end. Check out the Reference section for lots of usage examples.

# Reference

In Slang every argument can be either a static value (such as `8n`, `e3`, `1`, etc.) or a list of values. If you provide a list as an argument to a function it will take the next value in the list every time it is called, looping back around when it reaches the end. As an example, the oscillator can accept a list of types: `(osc [sine tri saw])`. Every time a note is hit, it will use the next type in the list.

## Sound Functions

### `(osc <type: sine> <pitchOffset: 0>)`

Creates an oscillator with an optional pitchOffset in semitones. Filters and effects can be chained off of the oscillator using the `+` sign.

`type`:
- `sine`
- `saw` or `sawtooth`
- `tri` or `triangle`
- `square`

`pitchOffset`: how many semitones to shift the pitch.

Usage:
```
# Creates a synth with two sine oscillators, one pitched 7 semitones above the root note
@synth (osc sine)
@synth (osc sine 7)

# Creates a synth that chooses a random oscillator for each note that is hit.
@melody (osc (random [sine saw tri square]))
```

### `(drums)`

Creates a drum machine. It does not accept any arguments.

When writing a play line, the notes 0 - 11 represent the 12 drum sounds.

_Pro tip_: Any number above 11 will wrap around using modulus, so for example 25 will trigger sound 1 since `25 % 12 == 1`. This allows you to pass in note values (e.g. `e3`) as well since they correspond to number values.

### `(adsr <osc> <attack: 0.05> <decay: 0> <sustain: 1> <release: 0.05>)`

Creates an amp envelope which contains an oscillator followed by ADSR values. The attack, decay, and release arguments can be numbers or rhythm values (e.g. `8n`, `8t`, `4n`, etc.). Sustain is a number from 0 - 1.

Usage:
```
# Creates a sine wave oscillator with an amp envelope.
@synth (adsr (osc sine) 8n 8n 0.5 4n)
```

### `+ (filter <type: lp> <frequency: 100> <resonance: 1>)`

Creates a filter. This should be chained off of a oscillator or envelope.

`type`:
- `lp` (lowpass)
- `hp` (highpass)
- `bp` (bandpass)
- `n` (notch)

`frequency`: A value from 0 - 127 representing the frequencies 0 - 11,025.

`resonance`: A number from 0 - 100 representing the amount of resonance (Q) to apply.

Usage:
```
@synth (osc sine) + (filter lp 20)
```
```
# Make a lowpass filter that loops through the
# numbers 10 to 50 one at a time.
@melody (osc saw) + (filter lp [10..50])
```

### `+ (gain <value>)`

Creates a gain (volume). This should be part of a sound chain.

`value`: A number from 0 - 1.

Usage:
```
@synth (osc sine) + (gain 0.5)
@melody (osc sine) + (gain [0 0.25 0.5 0.75 1])
```

### `+ (pan <value>)`

Creates a stereo panner. This should be part of a sound chain.

`value`: A number from -1 (left) to 0 (center) to 1 (right).

Usage:
```
@synth (osc sine) + (pan -1)
@synth (osc sine 12) + (pan 1)
```

### `+ (delay <time: 8n> <feedback: 0.1> <wet: 0.5> <dry: 0.5> <cutoff: 11025>)`

Creates a delay effect. This should be part of a sound chain.

`time`: A rhythm value or a number in seconds.

`feedback`: A number from 0 - 1 representing the amount of feedback to apply.

`wet`: A number from 0 - 1 representing the wet level.

`dry`: A number from 0 - 1 representing the dry level.

`cutoff`: A number from 0 - 11025 representing the frequency of a cutoff filter on the delay.

Usage:
```
@synth (adsr (osc saw) 64n 8n 0 8n) + (delay 8t 0.4 1 1)
```

Creates

## Utility Functions

### `(chord <type> <root> <length>)`

Returns a list of notes belonging to a chord.

`type`: A text value representing a chord type, e.g. `major`, `bebop`, `phrygian`. The list of possible chords is taken from [this library](https://github.com/danigb/tonal/blob/master/packages/dictionary/data/scales.json), but with spaces and `#` symbols removed (e.g. `minor #7M pentatonic` becomes `minor7Mpentatonic` in Slang).

`root`: A note, e.g. `e3`.

`length` (optional): a number representing exactly how many notes to return in the list. If unspecified, the length of the list will vary from chord to chord.

Usage:
```
@synth (adsr (osc sine) 64n)
play @synth (notes (chord phrygian e3))
```

### `(random <list>)`

Selects a random item from the list each time it is called. The list can be a range such as `[1..10]` or the output of any other utility function, such as `chord` or `flatten`.

Usage:
```
@synth (adsr (osc (random [saw tri])) 64n)
	+ (filter lp [10..50])
play @synth
	(rhythm (random [8n 8t 4n]))
	(notes (random (chord phrygian e3)))
```

### `(flatten <list>)`

Takes a list of lists and flattens it.

Usage:
```
@synth (adsr (osc sine) 64n)
play @synth (notes (flatten [[e3..e4] [d#4..e#3]]))
```
```
@synth (adsr (osc sine) 64n)
play @synth (notes (flatten [
	(repeat 2 [e3 e4 e5])
	(repeat 2 [d3 d4 d5])
	(repeat 2 [a3 a4 a5])
	[g3 g4 g5]
	[f3 f4 f5]
	]))
```

### `(repeat <amount> <list>)`

Takes a list and repeats it `amount` times. Useful when used inside of `flatten`.

Usage:
```
@perc (drums)
play @perc (notes (flatten [
	(repeat 2 [0 6 3 6])
	(repeat 2 [6 0 3 6])
	]))
```

### `(reverse <list>)`

Reverses the list.

Usage:
```
@synth (adsr (osc sine) 64n) + (gain 0.5)
play @synth (notes (reverse (chord lydian e4)))
play @synth (notes (chord lydian e5))
```

---

Primite values:
- **numbers** - integers and floats (`0`, `0.25`, `10000`, etc.)
- **lists** (space-separated) - `[0 1 2 3 4 5 6]`
- **notes** - `e3`, `d#4`, `f2`, etc.
- **rhythm** - `32t`, `32n`, `16t`, `16n`, `8t`, `8n`, `4t`, `4n`, `2n`, and `1n`
- **rests** - `r32t`, `r32n`, `r16t`, `r16n`, `r8t`, `r8n`, `r4t`, `r4n`, `r2n`, and `r1n`
- **special strings** - some functions take string arguments, such as `filter` and `osc`

---

# Examples

A simple synthesizer
```
# This is a sound line that establishes a synthesizer called @melody
@melody (adsr (osc sine) 64n 8n 0)
# This is a play line that plays @melody using a rhythm and a list of notes
play @melody (rhythm [8n]) (notes [e3 d3 g3 f3])
```

A drum machine
```
# Drums don't accept any arguments (at the moment!)
@percussion (drums)

# Hi-hats
play @percussion (rhythm [16n r16n 16n 16n]) (notes [6 7 8])
# Kick and snare
play @percussion (rhythm [8n]) (notes [0 3 11 0 3 0 3 11])
```

A randomized synth & bassline with drums
```
@synth (adsr (osc saw) 64n)
	+ (filter lp (random [5..30]))
	+ (delay 8n 0.7 0.5 1)
	+ (gain 0.25)

@bass (adsr (osc tri) 64n 2n 0.4 4n)

@drums (drums) + (gain 2)

play @synth
	(rhythm [8t])
	(notes (random (chord phrygian e5)))

play @bass
	(rhythm [1n])
	(notes (random (chord phrygian e2)))

play @drums
	(rhythm [8t r8t 8t 8t 8t r8t])
	(notes [6])
play @drums
	(rhythm [4n 4n 4n r8t 8t 8t])
	(notes [0 3 0 11 11])
```
