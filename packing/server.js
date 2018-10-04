const opn = require('opn');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const devMiddlewareFn = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');

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

// handle fallback for HTML5 history API
// app.use(require('connect-history-api-fallback')());

// serve webpack bundle output
app.use(devMiddleware);

// serve pure static assets
const staticPath = path.posix.join('/');
app.use(staticPath, express.static('./dist'));

const uri = `http://localhost:${port}`;

console.log('> Starting dev server...');

devMiddleware.waitUntilValid(() => {
    console.log(`> Listening at ${uri}\n`);
    // when env is testing, don't need open it
    if (autoOpenBrowser) {
        opn(uri);
    }
});

const server = app.listen(port);