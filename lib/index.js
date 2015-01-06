'use strict';

var postal = require('postal');
var FluzoStore = require('fluzo-store')(postal);

var fluzo_channel = postal.channel('fluzo');

fluzo_channel.subscribe(
   'store.changed.*',
   function () {
      Fluzo.requestRender();
   }
);

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

   renderIfRequested: function () {
      if (render_pending) {
         var now = new Date().getTime();
         render_suscriptions.forEach(function (cb) {
            cb(now);
         });
         this.clearRenderRequests();
      }
   }

};

module.exports = Fluzo;
