'use strict';

var _ = require('lodash');
var postal = require('postal');
var React = require('react');
var raf = require('raf');
var FluzoStore = require('fluzo-store')(postal);

var fluzo_channel = postal.channel('fluzo');

var render_pending = true;
var render_suscriptions = [];
var updating = false;

var Fluzo = {

   action: FluzoStore.action,
   Store: FluzoStore,

   Mixin: {
      shouldComponentUpdate: function(next_props) {
         var empty_props = (Object.keys(this.props).length === 0);
         return empty_props || !_.isEqual(next_props, this.props);
      }
   },

   clearRenderRequests: function () {
      render_pending = false;
   },

   requestRender: function () {
      render_pending = true;
   },

   onRender: function (cb) {
      render_suscriptions.push(cb);
      var index = render_suscriptions.length - 1;
      return function () {
         render_suscriptions.splice(index, 1);
      };
   },

   renderIfRequested: function (delta) {
      if (render_pending) {
         var now = Date.now();
         render_suscriptions.forEach(function (cb) {
            cb(now, delta);
         });
         this.clearRenderRequests();
      }
   },

   startUpdating: function () {
      if (!updating) {
         updating = true;
         (function tick(delta) {
            if (updating) {
               raf(tick);
            }
            Fluzo.renderIfRequested(delta);
         })(0);
      }
   },

   stopUpdating: function () {
      updating = false;
   },

   storeState: function (id) {
      var state;
      var store = Fluzo.Store.byId(id);
      if (store !== undefined) {
         state = store.state;
      }
      return state;
   },

   createClass: function (options) {
      if (options.mixins === undefined) {
         options.mixins = [];
      }
      options.mixins.push(Fluzo.Mixin);
      return React.createClass(options);
   }

};

fluzo_channel.subscribe('store.changed.*', Fluzo.requestRender);

module.exports = Fluzo;
