'use strict';

var _ = require('lodash');
var ActionMixin = require('./action-mixin');

module.exports = {

   action: ActionMixin.action,

   shouldComponentUpdate(next_props, next_state) {
      return !_.isEqual(next_props, this.props);
   }

};
