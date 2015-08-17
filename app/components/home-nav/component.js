import Ember from 'ember';
import ResponsiveNav from '../responsive-nav/component';
var $ = Ember.$;

export default ResponsiveNav.extend({
  selector: '#sidebar,#sidebar-body,#backboard,#top-nav,#nav-body',

  createBackboard: function() {
    
    // Add element behind body to show on scroll bounce
    $('<div id="backboard" aria-hidden="true"><img src="assets/images/global/full-logo.svg" alt="Blackout Rugby Logo" class="svg backboard-logo"></div>').insertBefore($('#nav-body'));
    
  }.on('didInsertElement'),

  show: function() {
    this._super();
    $('#navButton').addClass('nav-close');
  },

  hide: function() {
    this._super();
    $('#navButton').removeClass('nav-close');
  },

});
