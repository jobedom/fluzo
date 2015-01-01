'use strict';

var Fluzo = require('../lib');

Fluzo.init({
   initial: require('./initial'),
   appComponentClass: require('./components/app'),
   stores: [
      require('./stores/users')
   ],
   mountPointId: 'mount-point',
   initErrorMessageId: 'init-error-message'
});

