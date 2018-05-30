const path = require('path');

module.exports = {
  mode: 'development',
  entry: './slang.js',
  output: {
    filename: 'site.js',
    path: path.resolve(__dirname, 'build')
  }
};
