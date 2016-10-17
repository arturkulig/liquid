const webpack = require('webpack');
const ClosureCompiler = require('google-closure-compiler-js').webpack;

module.exports = {
  entry: './src/index.js',
  output: {
    path: 'dist_web',
    filename: 'liquid.js',
    library: 'liquid',
    libraryTarget: 'umd'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  },
  plugins: [
    new ClosureCompiler({
      options: {
        languageIn: 'ECMASCRIPT6',
        languageOut: 'ECMASCRIPT5',
        compilationLevel: 'ADVANCED',
        warningLevel: 'VERBOSE',
        processCommonJsModules: true
      },
    })
  ]
};

