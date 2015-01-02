'use strict';

require('./styles/init');

var Fluzo = require('../lib');

Fluzo.init({
   initial: require('./initial'),
   appComponentClass: require('./components/app'),
   stores: [
      require('./stores/users')
   ],
   updatesTime: 1000,
   noUpdatesTime: 5000
});

