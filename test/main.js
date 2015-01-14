'use strict';

var assert = require('assert');
var Fluzo = require('../lib');

describe('fluzo', function () {

   var store;

   beforeEach(function (done) {
      Fluzo.clearRenderRequests();
      Fluzo.Store.removeAll();
      Fluzo.stopUpdating();
      store = new Fluzo.Store('test');
      return done();
   });

   afterEach(function (done) {
      Fluzo.clearRenderSubscriptions();
      Fluzo.clearRenderRequests();
      Fluzo.Store.removeAll();
      Fluzo.stopUpdating();
      return done();
   });

   it('access stores transparently', function () {
      assert(store.id === 'test');
   });

   it('executes callback when rendering', function () {
      var triggered = false;
      var unsubscribe = Fluzo.onRender(function () {
         assert(store.state.number === 200);
         triggered = true;
      });
      store.onChangeNumber = function () {
         this.state.number = 200;
         this.changed();
      };
      store.setInitialState({
         foo: 'bar',
         number: 100
      });
      assert(!triggered);
      Fluzo.action('change.number');
      Fluzo.renderIfRequested();
      assert(triggered);
      unsubscribe();
   });

   it('executes multiple callbacks when rendering', function () {
      var triggered1 = false;
      var triggered2 = false;
      var unsubscribe1 = Fluzo.onRender(function () {
         assert(store.state.number === 200);
         triggered1 = true;
      });
      var unsubscribe2 = Fluzo.onRender(function () {
         assert(store.state.number === 200);
         triggered2 = true;
      });
      store.onChangeNumber = function () {
         this.state.number = 200;
         this.changed();
      };
      store.setInitialState({
         foo: 'bar',
         number: 100
      });
      assert(!triggered1);
      assert(!triggered2);
      Fluzo.action('change.number');
      Fluzo.renderIfRequested();
      assert(triggered1);
      assert(triggered2);
      unsubscribe1();
      unsubscribe2();
   });

   it('unsubscribes rendering callbacks', function () {
      var triggered1 = false;
      var triggered2 = false;
      var unsubscribe1 = Fluzo.onRender(function () {
         assert(store.state.number === 200);
         triggered1 = true;
      });
      var unsubscribe2 = Fluzo.onRender(function () {
         assert(store.state.number === 200);
         triggered2 = true;
      });
      store.onChangeNumber = function () {
         this.state.number = 200;
         this.changed();
      };
      store.setInitialState({
         foo: 'bar',
         number: 100
      });
      assert(!triggered1);
      assert(!triggered2);
      unsubscribe1();
      Fluzo.action('change.number');
      Fluzo.renderIfRequested();
      assert(!triggered1);
      assert(triggered2);
      unsubscribe2();
   });

   it('allows multiple updating starts', function () {
      Fluzo.startUpdating();
      Fluzo.startUpdating();
   });

   it('allows multiple updating stops', function () {
      Fluzo.stopUpdating();
      Fluzo.stopUpdating();
   });

   it('starts and stops', function (done) {
      Fluzo.startUpdating();
      setTimeout(function () {
         Fluzo.stopUpdating();
         setTimeout(done, 10);
      }, 0);
   });

   it('gives access to store states', function () {
      var state = Fluzo.storeState('test');
      assert(state === store.state);
   });

   it('gives undefined when accessing to undefined store state', function () {
      var state = Fluzo.storeState('unknown');
      assert(state === undefined);
   });

   it('includes a React mixing to speed up component rendering', function () {
      var mixin = Fluzo.Mixin;
      var result;
      result = mixin.shouldComponentUpdate({});
      assert(result);
      mixin.props = {
         foo: 'bar',
         number: 100
      };
      result = mixin.shouldComponentUpdate({
         foo: 'bar',
         number: 200
      });
      assert(result);
   });

});
