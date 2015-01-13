'use strict';

var postalModule = function (postal) {

   var fluzo_channel = postal.channel('fluzo');

   function methodFromActionTopic(topic) {
      var method = topic
         .replace(/^action\./, '.')
         .replace(/\.([a-z])/g, function (all, letter) {
            return letter.toUpperCase();
         });
      method = 'on' + method;
      return method;
   }

   function isPromise(value) {
      return ((typeof value === 'object') &&
         (typeof value.then === 'function'));
   }

   function tryMethod(obj, method_name, args) {
      var result = false;
      if (typeof obj[method_name] === 'function') {
         var method_result = obj[method_name].apply(obj, args);
         if (isPromise(method_result)) {
            method_result
               .then(function (data) {
                  tryMethod(obj, method_name + 'Success', [data]);
               })
               .catch(function (error) {
                  tryMethod(obj, method_name + 'Error', [error]);
               });
         }
         result = true;
      }
      return result;
   }

   var stores = {};

   fluzo_channel.subscribe('action.#', function (data, envelope) {
      var method = methodFromActionTopic(envelope.topic);
      for (var id in stores) {
         var store = stores[id];
         if (!tryMethod(store, method, [data, envelope])) {
            tryMethod(store, 'onAction', [data, envelope]);
         }
      }
   });

   var Store = function (id, options) {
      if (typeof id !== 'string') {
         throw new Error('Store id must be a string');
      }
      if (stores[id] !== undefined) {
         throw new Error('Store "' + id + '" is already defined');
      }
      this.id = id;
      for (var key in options) {
         this[key] = options[key];
      }
      this.state = {};
      stores[id] = this;
   };

   Store.byId = function (id) {
      return stores[id];
   };

   Store.removeAll = function () {
      stores = {};
   };

   Store.action = function (action, data) {
      fluzo_channel.publish('action.' + action, data);
   };

   Store.prototype.action = Store.action;

   Store.prototype.setInitialState = function (state) {
      this.setState(state, false);
   };

   Store.prototype.setState = function (state, change_action) {
      if (change_action === undefined) {
         change_action = this.changed.bind(this);
      }
      else if (change_action === false) {
         change_action = function () {};
      }
      if (isPromise(state)) {
         state.then(function (promised_state) {
            this.state = promised_state;
            change_action(promised_state);
         }.bind(this));
      }
      else {
         this.state = state;
         change_action(state);
      }
   };

   Store.prototype.changed = function () {
      fluzo_channel.publish('store.changed.' + this.id, {
         id: this.id,
         store: this
      });
   };

   return Store;

};

module.exports = postalModule;
