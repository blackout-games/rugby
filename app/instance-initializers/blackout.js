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
    let eventBus = application.lookup('service:event-bus');
    let rawRoute = Ember.Blackout.trimChar(route,'/');
    
    // Select menu link
    // (Selects dashboard link after logging in when already on dashboard)
    if(rawRoute.indexOf('/')===-1){
      Ember.run.next(function(){
        eventBus.publish('selectMenuLink',rawRoute);
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
  Ember.Blackout.getCurrentRoute = () => {
    
    let currentRoute = application.lookup('controller:application').get('currentPath');
    return currentRoute ? currentRoute : '';
    
  };
  
  /** 
   * Take a given time, and make the UTC time match the country time, so that we can make calculations based on UTC, but in the country's time, e.g. grouping a collection of times by day, in the country's time.
   * Because we're using moment timezones, daylight savings is accounted for.
   */
  Ember.Blackout.toUTCTime = ( time, timeZone ) => {
    
    // Create the given time in UTC
    let offset = moment.tz.zone(timeZone).offset(time); // Returns minutes
    return time -= offset*60*1000; // Minutes to milliseconds
    
  };
  
  /** 
   * Take a UTC time (usually from toUTCTime), and return it back to the country time.
   * Because we're using moment timezones, daylight savings is accounted for.
   */
  Ember.Blackout.toZonedTime = ( utcTime, timeZone ) => {
    
    // Create the given time in this timezone
    let offset = moment.tz.zone(timeZone).offset(utcTime); // Returns minutes
    return utcTime += offset*60*1000; // Minutes to milliseconds
    
  };
  
  /** 
   * Convert a given time to the local user time for this machine
   */
  Ember.Blackout.toLocalTime = ( givenTime ) => {
    
    let localDate = new Date();
    givenTime += localDate.getTimezoneOffset()*60*1000;
    return givenTime;
    
  };
  
}

export default {
  name: 'blackout',
  initialize: initialize
};
