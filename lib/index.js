'use strict';

require('raf-polyfill');

var _ = require('lodash');
var React = require('react');
var Promise = require('bluebird');

var StoreFactory = require('./store-factory');
var RootFactory = require('./root-factory');

var Fluzo = {

   Mixin: require('./mixin'),

   render: React.render,

   createClass: function (options) {
      options.mixins = options.mixins || [];
      options.mixins.push(Fluzo.Mixin);
      return React.createClass(options);
   },

   init: function (options) {
      if (options.initial === undefined) {
         throw new Error('Missing initial context in Fluzo.init options');
      }

      var initial_promise = options.initial;

      if ((initial_promise.then === undefined) ||
          (initial_promise.catch === undefined)) {
         initial_promise = new Promise(initial_promise);
      }

      if (options.appComponentClass === undefined) {
         throw new Error('Missing app component class in Fluzo.init options');
      }

      if (options.stores === undefined) {
         throw new Error('Missing stores in Fluzo.init options');
      }

      this.AppComponent = options.appComponentClass;
      this.Store = StoreFactory(options.stores);
      this.Root = RootFactory(this.Store, this.AppComponent);

      _.defaults(options, {
         mountPointId: 'mount-point',
         initErrorMessageId: 'init-error-message'
      });

      initial_promise
         .then(function (initialContext) {
            Fluzo.Store.setInitialContext(initialContext);
            Fluzo.render(
               <Fluzo.Root />,
               document.getElementById(options.mountPointId)
            );
         })
         .catch(function (error) {
            var element = document.getElementById(options.initErrorMessageId);
            element.innerHTML = error;
         });
   }

};

module.exports = Fluzo;
