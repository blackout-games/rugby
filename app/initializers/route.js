import Ember from 'ember';

let forceLoaderRoutes = [
  //{ name: 'squad.club', authenticated: true },
  { name: 'squad.club' },
  //{ name: 'players.player' },
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
var blackoutRouter = {
  
  _doTransition(){
    
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
          this._doTransition.apply(this, args);
        },77); // search: render-wait-time
        
        return false;
        
      }
      
    }
    
    Ember.Blackout.stopLoading();
    this.set('_forceNormalTransitionTo',false);
    this._super.apply(this, arguments);
    
    
  },
};

export function initialize(/* application */) {
  Ember.Router = Ember.Router.reopen(blackoutRouter);
}

export default {
  name: 'route',
  initialize
};
