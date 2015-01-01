'use strict';

var _ = require('lodash');

var initial = {
   users: [
      {id: _.uniqueId(), username: 'jobedom', email: 'jobedom@gmail.com'}
   ]
};

module.exports = initial;
