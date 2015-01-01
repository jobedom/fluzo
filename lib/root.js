'use strict';

var React = require('react');
var postal = require('postal');
var moment = require('moment');
var Store = require('./store');
var App = require('../app/components/app');

var Root = React.createClass({

   componentWillMount() {
      this.store_suscription = postal.subscribe({
         channel: 'fluzo',
         topic: 'store.changed',
         callback: (data, envelope) => {
            this.context = data;
            this.forceUpdate();
         }
      });
      this.context = Store.getContext();
   },

   componentWillUnmount() {
      this.store_suscription.unsubscribe();
   },

   render() {
      // console.debug('render:Root');
      return <App {...this.context} __timestamp__={moment()} />;
   }

});

module.exports = Root;
