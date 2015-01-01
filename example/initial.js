'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var initial = {
   users: [
      {id: _.uniqueId(), username: 'jobedom', email: 'jobedom@gmail.com'}
   ]
};

var initial_promise = new Promise((resolve, reject) => {
   _.delay(_.partial(resolve, initial), 0);
});

module.exports = initial_promise;

