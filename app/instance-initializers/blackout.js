import Ember from 'ember';

export function initialize( application ) {
  
  // Give ourselves access to the application instance from anywhere
  Ember.Blackout.App = application;
  
  // Create global transitionTo
  Ember.Blackout.transitionTo = function( route ){
    
    var appRoute = application.lookup('route:application');
    appRoute.transitionTo(route);
    
  };
  
}

export default {
  name: 'blackout',
  initialize: initialize
};
