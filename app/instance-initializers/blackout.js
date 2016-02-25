import Ember from 'ember';

export function initialize( application ) {
  
  // Give ourselves access to the application instance from anywhere
  Ember.Blackout.App = application;
  
  // Create global transitionTo
  Ember.Blackout.transitionTo = function( route ){
    
    let parts = route.split('#');
    let hash;
    
    if(parts.length>1){
      route = parts[0];
      hash = parts[1];
    }
    
    // Support routes with hashes, i.e. when user logs in and lastRoute includes a hash
    // To reproduce issue which this fixes, while logged in, go to home page and refresh it completely so /#home is saved as lastRoute
    if(hash){
      let router = application.lookup('router:main');
      router.one('didTransition', function() {
        window.location.hash = hash;
      });
    }
    
    let currentPath = window.location.pathname;
    let appRoute = application.lookup('route:application');
    let EventBus = application.lookup('service:event-bus');
    let rawRoute = Ember.Blackout.trimChar(route,'/');
    
    // Select menu link
    // (Selects dashboard link after logging in when already on dashboard)
    if(rawRoute.indexOf('/')===-1){
      Ember.run.next(function(){
        EventBus.publish('selectMenuLink',rawRoute);
      });
    }
    
    if (currentPath === route) {
      appRoute.refresh();
    } else {
      appRoute.transitionTo(route);
    }
    
  };
  
  /**
   * Shows loading slider
   */
  Ember.Blackout.startLoading = () => {
    
    application.lookup('controller:application').set('loading',true);
    
  };
  
  /**
   * Completes loading slider
   */
  Ember.Blackout.stopLoading = () => {
    
    application.lookup('controller:application').set('loading',false);
    
  };
  
  /**
   * Track current route name
   */
  Ember.Blackout.setCurrentRoute = (name) => {
    
    Ember.Blackout.currentRoute = name;
    
  };
  
}

export default {
  name: 'blackout',
  initialize: initialize
};
