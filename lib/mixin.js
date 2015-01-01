'use strict';

var _ = require('lodash');
var postal = require('postal');

module.exports = {

   action: function (id, envelope) {
      if (envelope === undefined) {
         envelope = {};
      }
      postal.publish({
         channel: 'fluzo',
         topic: 'action.' + id,
         data: envelope
      });
   },

   shouldComponentUpdate: function (next_props) {
      return !_.isEqual(next_props, this.props);
   }

};
