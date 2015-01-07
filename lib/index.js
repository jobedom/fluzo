'use strict';

var postal = require('postal');
var raf = require('raf');
var FluzoStore = require('fluzo-store')(postal);

var fluzo_channel = postal.channel('fluzo');

var render_pending = false;
var render_suscriptions = [];

var Fluzo = {

   Store: FluzoStore,
   action: FluzoStore.action,

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

   start: function () {
      (function tick(delta) {
         raf(tick);
         Fluzo.renderIfRequested(delta);
      })(0);
   }

};

fluzo_channel.subscribe('store.changed.*', Fluzo.requestRender);

module.exports = Fluzo;
