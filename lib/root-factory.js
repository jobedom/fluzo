'use strict';

var React = require('react');
var postal = require('postal');

var RootFactory = function (Store, App) {
   var Root = React.createClass({
      displayName: 'Root',

      componentWillMount: function () {
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

      componentWillUnmount: function () {
         this.store_suscription.unsubscribe();
      },

      render: function () {
         // console.debug('render:Root');
         return (
            <App
               {...this.context}
               __timestamp__={new Date().getTime()}
            />
         );
      }

   });

   return Root;
};

module.exports = RootFactory;
