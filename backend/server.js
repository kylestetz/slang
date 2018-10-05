/*
	DISCLAIMER: my vps is running an old version of node.
	Does that ever happen to you? I'm writing this mostly
	in old school ES5 to avoid having to upgrade right now.
	If you contribute anything to this file... please be
	kind. I'll upgrade eventually.
	¯\_(ツ)_/¯
*/

const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const helpers = require('./helpers');
const path = require('path');

const PORT = process.env.PORT || 8000;

const app = express();

// We're serving static assets out of /public
app.use(express.static('public'));
// We are going to send JSON blobs so let's have
// bodyParser get the data ready for us.
app.use(bodyParser.json());
// Using EJS to build the patch page.
app.set('view engine', 'ejs');
// Point to the views folder
app.set('views', path.join(__dirname, './views'));

// Connect to the database, add our routes, then start the server.
MongoClient.connect('mongodb://127.0.0.1:27017/slang', function(err, db) {
	if (err) {
		console.log('Oh no! The mongo database failed to start.');
		console.error(err);
		return process.exit(1);
	}

	// Load a saved patch, if one exists.

	app.get('/:id', function (req, res) {
		const patches = db.collection('patches');
		patches.find({ _id: req.params.id }).toArray(function (err, items) {
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
			patch.text = patch.text.replace(/\`/g, '');
			res.render('patch', { patch: patch });
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

	app.post('/save', function (req, res) {
		const text = req.body.text;

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
		patches.insert({ _id: id, text: text }, function (err, item) {
			if (err) {
				res.statusCode = 400;
				return res.send('error');
			}
			// return the URL
			return res.send(id);
		});
	});

	// Start the server.
	app.listen(PORT, function () {
		console.log('Slang is running on port', (process.env.PORT || 8000), 'at', Date());
	});
});

