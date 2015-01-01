'use strict';

var _ = require('lodash');
var postal = require('postal');

var StoreFactory = function (stores) {
   var Store = {

      setInitialContext: function (context) {
         this.context = context;
      },

      setContext: function (context) {
         this.context = context;
         this.changed();
      },

      getContext: function () {
         return this.context;
      },

   };

   _.each(stores, (s) => {
      Store = _.extend(Store, s);
   });

   Store.__batchTriggered__ = false;
   Store.changed = function () {
      if (!Store.__batchTriggered__) {
         requestAnimationFrame(function () {
            postal.publish({
               channel: 'fluzo',
               topic: 'store.changed',
               data: Store.context
            });
            Store.__batchTriggered__ = false;
         });
      }
      Store.__batchTriggered__ = true;
   };

   postal.subscribe({
      channel:'fluzo',
      topic: 'action.#',
      callback: function (data, envelope) {
         var method = envelope.topic
            .replace(/^action\./, '')
            .replace(/\.([a-z])/g, (m) => {
               return m.substr(1).toUpperCase();
            });
         method = 'on' +
            method.substr(0, 1).toUpperCase() +
            method.substr(1);
         if (Store[method] === undefined) {
            throw new ReferenceError('Unknown store action handler "' + method + '"');
         }
         Store[method].bind(Store)(data);
      }
   });

   return Store;
}

module.exports = StoreFactory;
