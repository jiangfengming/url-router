export default function(options = {}) {
  const conf = {
    entry: './src/index.js',

    output: {
      path: `${__dirname}/dist`,
      publicPath: '/dist/',
      filename: 'UrlRouter.js',
      library: 'UrlRouter',
      libraryTarget: 'umd'
    },

    module: {
      loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [['es2015', { modules: false }]],
          plugins: [
            'add-module-exports'
          ]
        }
      }]
    },

    devServer: {
      noInfo: true,
      host: '0.0.0.0',
      port: 8020,
      historyApiFallback: true,
      contentBase: './examples'
    }
  };

  if (options.debug) {
    conf.debug = true;
    conf.devtool = 'source-map';
  }

  return conf;
}
