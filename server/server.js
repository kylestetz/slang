const opn = require('opn');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const { MongoClient } = require('mongodb');
const devMiddlewareFn = require('webpack-dev-middleware');
const bodyParser = require('body-parser');

const webpackConfig = require('../packing/webpack.config.js');
const helpers = require('./helpers');
const MongoConfig = require('./mongo/mongo.config.js');

// default port where dev server listens for incoming traffic
const port = 5555;
// automatically open browser, if not set will be false
const autoOpenBrowser = true;
const app = express();
const compiler = webpack(webpackConfig);
const devMiddleware = devMiddlewareFn(compiler, {
	publicPath: webpackConfig.output.publicPath,
	quiet: true,
});
const notFoundPatch = `# Whoops! We couldn’t a patch at this URL.
# You get the 404 womp womp patch instead.

@notFoundLeft (adsr (osc tri)) + (pan -1)
@notFoundRight (adsr (osc tri)) + (pan 1)

play @notFoundLeft
	(rhythm [8n 8n 8n 8n 8n r1n r32n])
	(notes [c5 b4 a#4 a4 g#4])

play @notFoundRight
	(rhythm [r32n 8n 8n 8n 8n 8n r1n])
	(notes (transpose -5 [c5 b4 a#4 a4 g#4]))'`;

// We are going to send JSON blobs so let's have
// bodyParser get the data ready for us.
app.use(bodyParser.json());

// serve webpack bundle output
app.use(devMiddleware);

// serve pure static assets
const staticPath = path.posix.join('/');
app.use(staticPath, express.static('./dist'));

// Using EJS to build the patch page.
app.set('view engine', 'ejs');
// Point to the views folder
app.set('views', path.join(__dirname, './views'));

const uri = `http://localhost:${port}`;

console.log('> Starting dev server...');

devMiddleware.waitUntilValid(() => {
	console.log(`> Listening at ${uri}\n`);
	// when env is testing, don't need open it
	if (autoOpenBrowser) {
		opn(uri);
	}
});

// Connect to the database, add our routes, then start the server.
MongoClient.connect(`mongodb://${MongoConfig.HOST}:${MongoConfig.PORT}`, (err, client) => {
	if (err) {
		console.log('Oh no! The mongo database failed to start.');
		console.error(err);
		return;
	}

	const db = client.db(MongoConfig.NAME);
	const patches = db.collection('Patch');

	async function cleanup() {
		await patches.deleteMany({
			$or: [
				{ exp: { $exists: false } },
				{ exp: { $lte: new Date().getTime() } },
			],
		}, (cleanupErr, data) => {
			if (cleanupErr === null && data.result.n) console.log(`--- Cleanup: ${data.result.n} Patches removed`);
		});
	}

	// Load a saved patch, if one exists.
	app.get('/:hash', async (req, res) => {
		console.log(`--- Looking for: ${req.params.hash}`);
		patches.find({ hash: req.params.hash }).toArray((findErr, items) => {
			const message = findErr || !items.length ? 'Not Found' : 'Found!';
			console.log(`--- ${req.params.hash} ${message}`);
			// Let's be clever and present a "not found" error
			// inside of the text editor itself.
			let text = findErr || !items.length ? notFoundPatch : items[0].text;

			// We're using a string literal to dump out the text, so
			// to avoid XSS let's remove any backticks present in the
			// string itself.
			text = text.replace(/`/g, '');
			res.render('patch', { patch: text });
		});
	});

	// Save a new patch.

	// There are lots of ways we could do this, but here's what we're
	// going to do and some rationale behind it: the client will send
	// a POST to the /save route with the text they want to save, we'll
	// respond by sending the ID as text, and the client will then
	// redirect itself to the new URL, hitting the `/:id` route above.

	// We could just as well take the response on the client and display
	// it as a URL that the user can copy, but because the URL represents
	// the text *at the moment it was saved*, I don't want them to
	// generate it, continue typing, and assume that their patch will
	// update in some way. Redirecting to the new URL reinforces the fact
	// that it's a one-time save.

	app.post('/save', async (req, res) => {
		// Cleanup before saving
		await cleanup();
		const { text } = req.body;
		const lifeSpan = 2; // Delete hashs after 2 days
		const exp = new Date().getTime() + (lifeSpan * 60 * 60 * 24 * 1000);
		console.log('--- Saving...');

		// Need to set some limits so you don't blow up my database!
		if (!text || text.length > 10000) {
			res.statusCode = '400';
			res.send(':(');
			return;
		}

		// No collitions anymore
		const hash = helpers.createHash();

		await patches.insertOne({ hash, text, exp }, (saveErr) => {
			if (saveErr) {
				res.statusCode = 500;
				res.send('Error while saving your Patch');
			}
			console.log(`--- ${hash} Saved!`);
			res.send(hash);
		});
	});

	app.get('/list/all', async (req, res) => {
		// Insert some documents
		await patches.find({}).toArray((testErr, docs) => {
			console.log('--- All hashes listed');
			res.send(docs);
		});
	});

	// Start the server.
	app.listen(port, () => {
		console.log('Slang is running on port', (process.env.PORT || 8000), 'at', Date());
	});
});
