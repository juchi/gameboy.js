const path = require('path');

module.exports = {
  entry: './src/main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
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
