import Sound from './classes/Sound';

const model = {
	sounds: {},
	schedule: {},
};

function runScene(scene) {
	// a scene is a collection of lines that go together.

	// Stage 1: build the scene
	scene.forEach((operation) => {
		switch (operation.type) {
			case 'graph':
				parseGraph(operation);
				break;
			case 'play':
				parsePlay(operation);
				break;
		}
	});

	// Stage 2: Schedule the sound
}

function parseGraph(graph) {
	const { sound } = graph;

	// This particular line of code will either create
	// a new sound or modify an existing sound. We may
	// also hit a runtime error if we are trying to
	// access a property of a sound that hasn't been
	// instantiated yet.

	const soundExistsInModel = !!model.sounds[sound.name];
	const accessingSoundProperty = !!sound.property;

	if (!soundExistsInModel && !accessingSoundProperty) {
		// We're instantiating a new sound.
		model.sounds[sound.name] = new Sound(graph);
	} else if (soundExistsInModel) {
		// We're adding new information to the same sound.
		model.sounds[sound.name].appendToGraph(graph);
	} else {
		throw new Error(`Tried to access ${sound.property} of non-existant sound ${sound.name}`);
	}
};

function parsePlay(operation) {
	console.log('parsePlay:', operation);

	model.sounds[operation.sound.name].schedule();
}


export default {
	runScene,
};
