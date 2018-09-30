const path = require('path');

module.exports = {
  mode: 'development',
  entry: './editor.js',
  output: {
    filename: 'site.js',
    path: path.resolve(__dirname, 'public/build')
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }],
  },
};
