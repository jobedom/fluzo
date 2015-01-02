'use strict';

var _ = require('lodash');

module.exports = {

   onUsersEmpty() {
      if (this.context.users.length > 0) {
         this.context.users = [];
         this.changed();
      }
   },

   onUserDelete(id) {
      this.context.users = _.reject(this.context.users, {id});
      this.changed();
   },

   onUserAdd(user) {
      user.id = _.uniqueId();
      this.context.users.push(user);
      this.changed();
   },

   onUserChange() {
      if (this.context.users.length > 0) {
         var idx = _.random(this.context.users.length - 1);
         var user = this.context.users[idx];
         user.username = _.random(0, 100).toString();
         this.changed();
      }
      var fake = _.random(1000, 9999).toString() + _.uniqueId().toString();
      this.action('user.add', {
         username: 'store-' + fake,
         email: fake + '@gmail.com'
      });
   }

};
