'use strict';

require('raf-polyfill');

var _ = require('lodash');
var React = require('react');
var Promise = require('bluebird');
var Bacon = require('baconjs');
var postal = require('postal');

var StoreFactory = require('./store-factory');
var RootFactory = require('./root-factory');

function checkOptions(options) {
   _.defaults(options, {
      mountPointId: 'mount-point',
      initErrorId: 'init-error',
      updatesTime: 30000,
      noUpdatesTime: 5000
   });

   var checks = {
      appComponentClass: 'app component class',
      stores: 'stores',
      initial: 'initial context'
   };

   for (var field in checks) {
      if (options[field] === undefined) {
         var msg = 'Missing ' + checks[field] + ' in Fluzo.init options';
         throw new Error(msg);
      }
   }
}

function createStreams(self, options) {
   var updates_time = options.updatesTime;
   var no_updates_time = options.noUpdatesTime;

   var createSubscriptionStream = function (topic) {
      return Bacon.fromBinder(function (sink) {
         return postal.subscribe({
            channel: 'fluzo',
            topic: topic,
            callback: function (data, envelope) {
               sink(envelope);
            }
         });
      });
   };

   var store_stream = createSubscriptionStream('store.#');
   var actions_stream = createSubscriptionStream('action.#');
   var persistence_stream = createSubscriptionStream('persistence');
   var activity_stream = store_stream.merge(actions_stream);
   var all_stream = activity_stream.merge(persistence_stream);

   var updates_fluzo_stream = activity_stream.map(false)
      .merge(activity_stream.flatMapLatest(() => Bacon.later(no_updates_time, true)))
      .startWith(true)
      .sampledBy(Bacon.interval(updates_time, true))
      .filter(_.identity)

   var updates_stream =persistence_stream
      .map(function (v) { return !v.data; })
      .startWith(true)
      .sampledBy(updates_fluzo_stream)
      .filter(_.identity)

   self.streams = {
      all: all_stream,
      store: store_stream,
      actions: actions_stream,
      persistence: persistence_stream,
      updates: updates_stream
   };
}

function domElement(id, parent) {
   if (parent === undefined) {
      parent = document.body;
   }
   var element = document.getElementById(id);
   if (element === null) {
      element = document.createElement('div');
      element.id = id;
      parent.appendChild(element);
   }
   return element;
}

var Fluzo = {

   Mixin: require('./mixin'),

   render: React.render,

   createClass: function (options) {
      options.mixins = options.mixins || [];
      options.mixins.push(Fluzo.Mixin);
      return React.createClass(options);
   },

   init: function (options) {
      checkOptions(options);
      createStreams(this, options);

      this.AppComponent = options.appComponentClass;
      this.Store = StoreFactory(options.stores);
      this.Root = RootFactory(this.Store, this.AppComponent);

      var mount_element = domElement(options.mountPointId);
      var error_element = domElement(options.initErrorId);
      var splash = domElement('init-splash', mount_element);

      error_element.style.visibility = 'hidden';

      Promise.resolve(options.initial)
         .then(function (initial_context) {
            Fluzo.Store.setInitialContext(initial_context);
            Fluzo.render(
               <Fluzo.Root />,
               document.getElementById(options.mountPointId)
            );
         })
         .catch(function (error) {
            mount_element.style.visibility = 'hidden';
            error_element.style.visibility = 'visible';
            var text = error.replace('\n', '<br /><br />');
            var new_paragraph = document.createElement('p');
            new_paragraph.innerHTML = text;
            error_element.appendChild(new_paragraph);
         });
   }

};

module.exports = Fluzo;
