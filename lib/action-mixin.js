'use strict';

var postal = require('postal');

module.exports = {

   action(id, envelope) {
      if (envelope === undefined) {
         envelope = {};
      }
      postal.publish({
         channel: 'fluzo',
         topic: 'action.' + id,
         data: envelope
      });
   }

};
