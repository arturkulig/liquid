module.exports = {
  entry: './test/index.js',
  output: {
    path: 'dist',
    filename: 'liquid.js'
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
