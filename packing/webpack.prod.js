const path = require('path');

module.exports = {
  mode: 'production',
  entry: './src/editor.js',
  output: {
    filename: 'site.min.js',
    path: path.resolve(__dirname, 'public/build')
  },
  module: {
    rules: [{
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ]
    },
    {
      test: /\.m?js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }
    }],
  },
};
