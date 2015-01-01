'use strict';

var React = require('react');
var FluzoMixin = require('../../lib/fluzo-mixin');

var User = React.createClass({
   mixins: [FluzoMixin],

   onDeleteUser() {
      this.action('user.delete', this.props.id);
   },

   render() {
      // console.debug('render:User ' + this.props.username);
      return (
         <div style={{marginBottom: 2}}>
            <button onClick={this.onDeleteUser}>X</button>&nbsp;
            #{this.props.id} ---&nbsp;
            {this.props.username}
            &nbsp;
            ({this.props.email})
         </div>
      );
   }

});

module.exports = User;
