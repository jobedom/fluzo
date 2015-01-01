'use strict';

var webpack = require('webpack');

module.exports = {
   devtool: '#source-map',
   entry: [
      './lib/index'
   ],
   output: {
      path: __dirname + '/dist',
      filename: 'bundle.js',
      publicPath: '/dist/'
   },
   plugins: [
      new webpack.optimize.DedupePlugin(),
      new webpack.optimize.UglifyJsPlugin()
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
