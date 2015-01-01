'use strict';

var _ = require('lodash');
var postal = require('postal');
var stores = require('../app/stores/_all');

var Store = {

   init() {
      this.__batchTriggered__ = false;
      this.changed = () => {
         if (!this.__batchTriggered__) {
            requestAnimationFrame(() => {
               postal.publish({
                  channel: 'fluzo',
                  topic: 'store.changed',
                  data: this.context
               });
               this.__batchTriggered__ = false;
            });
         }
         this.__batchTriggered__ = true;
      };

      postal.subscribe({
         channel:'fluzo',
         topic: 'action.#',
         callback: (data, envelope) => {
            var method = envelope.topic
               .replace(/^action\./, '')
               .replace(/\.([a-z])/g, (m) => {
                  return m.substr(1).toUpperCase();
               });
            method = 'on' +
               method.substr(0, 1).toUpperCase() +
               method.substr(1);
            if (this[method] === undefined) {
               throw new ReferenceError('Unknown store action handler "' + method + '"');
            }
            this[method].bind(this)(data);
         }
      });
   },

   setInitialContext(context) {
      this.context = context;
   },

   setContext(context) {
      this.context = context;
      this.changed();
   },

   getContext() {
      return this.context;
   },

};

_.each(stores, (s) => {
   Store = _.extend(Store, s);
});

Store.init();

module.exports = Store;
