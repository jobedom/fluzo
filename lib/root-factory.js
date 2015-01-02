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
         var timestamp = new Date().getTime();
         return (
            <App
               {...this.context}
               __timestamp__={timestamp}
            />
         );
      }

   });

   return Root;
};

module.exports = RootFactory;
