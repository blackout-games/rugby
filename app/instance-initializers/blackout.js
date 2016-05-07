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
      appRoute.transitionTo(...arguments);
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
  Ember.Blackout.stopLoading = ( dontHideSubNav ) => {
    
    application.lookup('controller:application').set('loading',false);
    
    if(!dontHideSubNav){
      let eventBus = application.lookup('service:event-bus');
      eventBus.publish('hideSubNav');
    }
    
  };
  
  /**
   * Completes loading slider on the next run loop
   */
  Ember.Blackout.stopLoadingNext = ( dontHideSubNav ) => {
    
    Ember.run.next(()=>{
      Ember.Blackout.stopLoading(dontHideSubNav);
    });
    
  };
  
  /**
   * Run a short loader
   */
  Ember.Blackout.quickLoader = ( dontHideSubNav ) => {
    
    Ember.Blackout.startLoading();
    Ember.Blackout.stopLoadingNext( dontHideSubNav );
    
  };
  
  /**
   * Run a short loader, but wait a decent amount of time at the start
   * This is needed sometimes. e.g. squad page when data is already loaded
   * If we don't do this, ember rendering just starts and we never really see the loader
   */
  Ember.Blackout.longLoader = ( dontHideSubNav ) => {
    
    Ember.Blackout.startLoading();
    Ember.run.later(()=>{
      Ember.Blackout.stopLoading(dontHideSubNav);
    },44);
    
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
    let m = moment.tz.zone(timeZone);
    
    // Protect against bugs when in i18n testing mode
    if(m){
      let offset = moment.tz.zone(timeZone).offset(time); // Returns minutes
      return time -= offset*60*1000; // Minutes to milliseconds
    } else {
      return time;
    }
    
  };
  
  /** 
   * Take a UTC time (usually from toUTCTime), and return it back to the country time.
   * Because we're using moment timezones, daylight savings is accounted for.
   */
  Ember.Blackout.toZonedTime = ( utcTime, timeZone ) => {
    
    // Create the given time in this timezone
    let m = moment.tz.zone(timeZone);
    
    // Protect against bugs when in i18n testing mode
    if(m){
      let offset = moment.tz.zone(timeZone).offset(utcTime); // Returns minutes
      return utcTime += offset*60*1000; // Minutes to milliseconds
    } else {
      return utcTime;
    }
    
  };
  
  /** 
   * Convert a given time to the local user time for this machine
   */
  Ember.Blackout.toLocalTime = ( givenTime ) => {
    
    let localDate = new Date();
    givenTime += localDate.getTimezoneOffset()*60*1000;
    return givenTime;
    
  };
  
  // Make cache available to Blackout object
  let cache = application.lookup('service:cache');
  Ember.Blackout.cache = cache;
  
}

export default {
  name: 'blackout',
  initialize: initialize
};
