'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var initial = require('../app/initial');

var initial_promise = new Promise((resolve, reject) => {
   _.delay(_.partial(resolve, initial), 0);
});

module.exports = initial_promise;
