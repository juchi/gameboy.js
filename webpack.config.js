const path = require('path');

module.exports = {
  entry: './src/main.js',
  output: {
    filename: 'gameboy.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'GameboyJS',
      type: 'global',
    },
  },
  optimization: {
    minimize: false
  },
  mode: 'none'
};
