'use strict';

var assert = require('assert');
var Bluebird = require('bluebird');
var Fluzo = require('../lib');
var Store = Fluzo.Store;

describe('fluzo-store', function () {

   beforeEach(function (done) {
      Store.removeAll();
      return done();
   });

   it('must have an id', function () {
      assert.throws(function () {
         new Store();
      });
   });

   it('must have a string as id', function () {
      assert.throws(function () {
         new Store(123);
      });
   });

   it('has an accessible id', function () {
      var store = new Store('test');
      assert(store.id === 'test');
   });

   it('prevents multiple stores with same id', function () {
      assert.throws(function () {
         new Store('test');
         new Store('test');
      });
   });

   it('allows requesting stores by id', function () {
      var store1 = new Store('test1');
      var store2 = new Store('test2');
      assert(store1 === Store.byId('test1'));
      assert(store2 === Store.byId('test2'));
   });

   it('returns undefined for unknown id', function () {
      assert(Store.byId('test') === undefined);
   });

   it('can remove all defined stores', function () {
      new Store('test');
      assert(Store.byId('test') !== undefined);
      Store.removeAll();
      assert(Store.byId('test') === undefined);
   });

   it('signals changes through postal', function () {
      var triggered = false;
      var foo = new Store('foo');
      var suscription = Fluzo.channel.subscribe(
         'store.changed.*',
         function (data, envelope) {
            triggered = true;
            assert(data.id === foo.id);
            assert(data.store === foo);
            assert(envelope.data === data);
            assert(envelope.topic === 'store.changed.foo');
         }
      );
      foo.changed();
      suscription.unsubscribe();
      assert(triggered);
   });

   it('receives actions through postal', function () {
      var triggered = false;
      var store = new Store('test');
      var data_item = {
         foo: 'hello',
         bar: 123
      };
      store.onFooBar = function (data, envelope) {
         triggered = true;
         assert(data === data_item);
         assert(envelope.topic === 'action.foo.bar');
      };
      Fluzo.channel.publish('action.foo.bar', data_item);
      assert(triggered);
   });

   it('triggers actions through postal', function () {
      var triggered = false;
      var store1 = new Store('test1');
      var store2 = new Store('test2');
      var data_item = {
         foo: 'hello',
         bar: 123
      };
      store1.onFooBar = function (data, envelope) {
         triggered = true;
         assert(data === data_item);
         assert(envelope.topic === 'action.foo.bar');
         };
      store2.action('foo.bar', data_item);
      assert(triggered);
   });

   it('lets unhandled actions pass', function () {
      var triggered = false;
      var store = new Store('test');
      store.onFooBar = function () {
         triggered = true;
      };
      Fluzo.channel.publish('action.unknown');
      assert(!triggered);
   });

   it('handles unknown actions', function () {
      var triggered = false;
      var store = new Store('test');
      store.onAction = function (data, envelope) {
         triggered = true;
         assert(envelope.channel === 'fluzo');
      };
      Fluzo.channel.publish('action.unknown');
      assert(triggered);
   });

   it('passes correct "this" to action handlers', function () {
      var triggered = false;
      var store = new Store('test');
      store.onFooBar = function () {
         triggered = true;
         assert(store === this);
      };
      Fluzo.channel.publish('action.foo.bar');
      assert(triggered);
   });

   it('allows extending class in constructor', function () {
      var triggered = false;
      var store = new Store('test', {
         onFooBar: function () {
            triggered = true;
         }
      });
      Fluzo.channel.publish('action.foo.bar');
      store = undefined;
      assert(triggered);
   });

   it('maintains internal state', function () {
      var store = new Store('test');
      var state = {
         foo: 'bar',
         number: 100
      };
      store.setState(state);
      assert(store.state === state);
   });

   it('signals change when setting state', function () {
      var triggered = false;
      var store = new Store('test');
      var suscription = Fluzo.channel.subscribe(
         'store.changed.*',
         function (data) {
            triggered = (data.id === 'test');
         }
      );
      var state = {
         foo: 'bar',
         number: 100
      };
      store.setState(state);
      suscription.unsubscribe();
      assert(triggered);
   });

   it('can prevent change signal when setting state', function () {
      var triggered = false;
      var store = new Store('test');
      var suscription = Fluzo.channel.subscribe(
         'store.changed.*',
         function (data) {
            triggered = (data.id === 'test');
         }
      );
      var state = {
         foo: 'bar',
         number: 100
      };
      store.setState(state, false);
      suscription.unsubscribe();
      assert(!triggered);
   });

   it('allows custom action when setting state', function () {
      var triggered = false;
      var store = new Store('test');
      var state = {
         foo: 'bar',
         number: 100
      };
      store.setState(state, function (state) {
         assert(state.foo === 'bar');
         assert(state.number === 100);
         triggered = true;
      });
      assert(triggered);
   });

   it('allows custom action when setting state promise', function () {
      var triggered = false;
      var store = new Store('test');
      var promise = Bluebird.resolve({
         foo: 'bar',
         number: 100
      });
      store.setState(promise, function (state) {
         assert(state.foo === 'bar');
         assert(state.number === 100);
         triggered = true;
      });
      promise.then(function () {
         assert(triggered);
      });
   });

   it('can specify initial state', function () {
      var store = new Store('test');
      var state = {
         foo: 'bar',
         number: 100
      };
      store.setInitialState(state);
      assert(store.state === state);
   });

   it('doesn\'t signal change when setting initial state', function () {
      var triggered = false;
      var store = new Store('test');
      var suscription = Fluzo.channel.subscribe(
         'store.changed.*',
         function (data) {
            triggered = (data.id === 'test');
         }
      );
      var state = {
         foo: 'bar',
         number: 100
      };
      store.setInitialState(state);
      suscription.unsubscribe();
      assert(!triggered);
   });

   it('can signal change in action handler', function () {
      var triggered = false;
      var suscription = Fluzo.channel.subscribe(
         'store.changed.*',
         function (data) {
            triggered = (data.id === 'test');
         }
      );
      new Store('test', {
         onFooBar: function () {
            this.changed();
         }
      });
      Fluzo.channel.publish('action.foo.bar');
      suscription.unsubscribe();
      assert(triggered);
   });

   it('can receive a promise for initial state', function () {
      var store = new Store('test');
      var promise = Bluebird.resolve({
         foo: 'bar',
         number: 100
      });
      store.setInitialState(promise);
      promise.then(function () {
         assert(store.state.foo === 'bar');
         assert(store.state.number === 100);
      });
   });

   it('can receive a promise for state', function () {
      var triggered = false;
      var store = new Store('test');
      var suscription = Fluzo.channel.subscribe(
         'store.changed.*',
         function (data) {
            triggered = (data.id === 'test');
            assert(data.store.state.foo === 'bar');
            assert(data.store.state.number === 100);
         }
      );
      var promise = Bluebird.resolve({
         foo: 'bar',
         number: 100
      });
      store.setState(promise);
      promise.then(function () {
         suscription.unsubscribe();
         assert(triggered);
      });
   });

   it('can return a promise from an action', function () {
      var mockedAjax = function (fail) {
         return new Bluebird(function (resolve, reject) {
            if (fail) {
               reject('Ajax error');
            }
            else {
               resolve(1000);
            }
         });
      };

      new Store('test', {
         onFooBar: function () {
            this.changed();
            return mockedAjax(true);
         },

         onFooBarSuccess: function () {
            assert(false);
         },

         onFooBarError: function (error) {
            assert(error === 'Ajax error');
         },

         onFooFar: function () {
            this.changed();
            return mockedAjax(false);
         },

         onFooFarSuccess: function (data) {
            assert(data === 1000);
         },

         onFooFarError: function () {
            assert(false);
         }
      });

      Fluzo.channel.publish('action.foo.bar');
      Fluzo.channel.publish('action.foo.far');
   });

});
