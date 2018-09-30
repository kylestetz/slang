const path = require('path');

module.exports = {
  mode: 'production',
  entry: './editor.js',
  output: {
    filename: 'site.min.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    }],
  },
};
