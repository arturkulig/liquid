module.exports = {
  entry: './dev/index.js',
  output: {
    path: 'dev',
    filename: 'bundled.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};
