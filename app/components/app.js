'use strict';

var _ = require('lodash');
var React = require('react');
var User = require('./user');
var ActionMixin = require('../../lib/action-mixin');

var App = React.createClass({
   mixins: [ActionMixin],

   onEmptyClick() {
      this.action('users.empty');
   },

   onAddClick() {
      var fake = _.random(1000, 9999).toString() + _.uniqueId().toString();
      this.action('user.add', {
         username: fake,
         email: fake + '@gmail.com'
      });
   },

   onChangeClick() {
      this.action('user.change');
   },

   onBatchClick() {
      _.times(100, this.onAddClick);
   },

  render() {
      // console.debug('render:App');
      var users_list = this.props.users.map((user) =>
         <User key={user.id} {...user} />
      );

      return (
         <div>
            <div style={{overflow: 'hidden'}}>
               <div style={{float: 'left'}}>
                  <button disabled={this.props.users.length === 0} onClick={this.onEmptyClick}>Empty</button>&nbsp;
                  <button onClick={this.onAddClick}>Add</button>&nbsp;
                  <button onClick={this.onBatchClick}>Batch</button>&nbsp;
                  <button disabled={this.props.users.length === 0} onClick={this.onChangeClick}>Change</button>&nbsp;
               </div>
               <div style={{float: 'right'}}>{this.props.users.length} users</div>
            </div>
            <hr />
            <div>{users_list}</div>
         </div>
      );
   }

});

module.exports = App;
