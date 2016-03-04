import Ember from 'ember';

let forceLoaderRoutes = [
  { name: 'squad.club', authenticated: true },
];

let isForcedLoaderRoute = function( routeName, authenticated ){
  
  let found = false;
  
  Ember.$.each(forceLoaderRoutes,(index,route)=>{
    
    if(route.name === routeName && (!route.authenticated || authenticated ) ){
      found = true;
      return false;
    }
    
  });
  
  return found;
  
};

/**
 * Modify the global route object here
 * @type {Object}
 */
var blackoutRoute = {
  
  transitionTo(){
    
    let name = arguments[0];
    
    /**
     * This allows us to force the loader to appear on certain routes, even when not returning a promise, or thier promise is already fulfilled.
     * Example, the squad page, since it takes so long to render it's helpful for the user to see a loading bar.
     */
    if(!this.get('_forceNormalTransitionTo') && isForcedLoaderRoute(name,this.get('session.isAuthenticated')) ){
      
      let currentRoute = Ember.Blackout.getCurrentRoute();
      
      // Remove any indexes
      currentRoute = currentRoute.replace(/\.index/g,'');
      
      if(currentRoute !== name){
        
        Ember.Blackout.startLoading();
        
        let args = arguments;
        Ember.run.later(()=>{
          this.set('_forceNormalTransitionTo',true);
          this.transitionTo(...args);
        },44);
        
        return;
        
      }
      
    }
    
    this.set('_forceNormalTransitionTo',false);
    this._super(...arguments);
    
    
  },
};

export function initialize(/* application */) {
  Ember.Route = Ember.Route.extend(blackoutRoute);
}

export default {
  name: 'route',
  initialize
};
