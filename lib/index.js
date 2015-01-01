'use strict';

require('raf-polyfill');

var React = require('react');
var postal = require('postal');

var Root = require('./root');
var Store = require('./store');

// postal.subscribe({
//    channel:'fluzo',
//    topic: '#',
//    callback: (data, envelope) => {
//       console.debug(envelope);
//    }
// });

require('./initial')
   .then((initialContext) => {
      Store.setInitialContext(initialContext);
      React.render(
         <Root />,
         document.getElementById('mount-point')
      );
   })
   .catch((error) => {
      document.getElementById('init-error-message').innerHTML = error;
   });
