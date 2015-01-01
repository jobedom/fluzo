'use strict';

var webpack = require('webpack');
var pkg = require('./package.json');

var port = pkg.config.port || 3000;
var url = 'http://localhost:' + port;

module.exports = {
   devtool: '#eval-source-map',
   entry: [
      'webpack-dev-server/client?' + url,
      './lib/index'
   ],
   output: {
      path: __dirname + '/dist',
      filename: 'bundle.js',
      publicPath: '/dist/'
   },
   plugins: [
      new webpack.NoErrorsPlugin()
   ],
   resolve: {
      modulesDirectories: [
         'node_modules',
         'web_modules',
         'app'
      ],
      extensions: [
         '',
         '.js',
         '.jsx',
         '.json',
         '.styl'
      ]
   },
   module: {
      loaders: [
         { test: /\.jsx?$/, loader: 'jsx?harmony' },
         { test: /\.json$/, loader: 'json' },
         { test: /\.styl$/, loader: 'style!css!autoprefixer!stylus' },
         { test: /\.css$/, loader: 'style!css!autoprefixer' },
         { test: /\.png$/, loader: 'url?limit=20480&mimetype=image/png' },
         { test: /\.jpg$/, loader: 'file' }
      ]
   }
};
