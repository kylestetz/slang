const opn = require('opn');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const devMiddlewareFn = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const helpers = require('./helpers');

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

// TODO: Mongo.connect() is not a function error and redirects to a HTML URL
// Connect to the database, add our routes, then start the server.
MongoClient.connect('mongodb://127.0.0.1:27017/slang', (error, db) => {
	if (error) {
		console.log('Oh no! The mongo database failed to start.');
		console.error(error);
		return process.exit(1);
	}

	// Load a saved patch, if one exists.

	app.get('/:id', (req, res) => {
		const patches = db.collection('patches');
		patches.find({ _id: req.params.id }).toArray((err, items) => {
			if (err || !items.length) {
				// Let's be clever and present a "not found" error
				// inside of the text editor itself.
				return res.render('patch', {
					patch: {
						text: '# Whoops! We couldn’t a patch at this URL.\n'
							+ '# You get the 404 womp womp patch instead.\n'
							+ '\n'
							+ '@notFoundLeft (adsr (osc tri)) + (pan -1)\n'
							+ '@notFoundRight (adsr (osc tri)) + (pan 1)\n'
							+ '\n'
							+ 'play @notFoundLeft\n'
							+ '	(rhythm [8n 8n 8n 8n 8n r1n r32n])\n'
							+ '	(notes [c5 b4 a#4 a4 g#4])\n'
							+ '\n'
							+ 'play @notFoundRight\n'
							+ '	(rhythm [r32n 8n 8n 8n 8n 8n r1n])\n'
							+ '	(notes (transpose -5 [c5 b4 a#4 a4 g#4]))',
					},
				});
			}

			const patch = items[0];
			// We're using a string literal to dump out the text, so
			// to avoid XSS let's remove any backticks present in the
			// string itself.
			patch.text = patch.text.replace(/`/g, '');
			res.render('patch', { patch });
			return true;
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

	app.post('/save', (req, res) => {
		const { text } = req.body;

		// Need to set some limits so you don't blow up my database!
		if (!text || text.length > 10000) {
			res.statusCode = '400';
			return res.send(':(');
		}

		const patches = db.collection('patches');

		// In theory there can be ID collisions, and in practice that
		// does happen occasionally when you have a system like this
		// doing ~1000+ saves per day, but we're not going to worry
		// about that right now.
		const id = helpers.createHash();
		patches.insert({ _id: id, text }, (err) => {
			if (err) {
				res.statusCode = 400;
				return res.send('error');
			}
			// return the URL
			return res.send(id);
		});

		return true;
	});

	// Start the server.
	app.listen(port, () => {
		console.log('Slang is running on port', (process.env.PORT || 8000), 'at', Date());
	});

	return true;
});
