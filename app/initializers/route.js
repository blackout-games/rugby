import Ember from 'ember';

let forceLoaderRoutes = [
  //{ name: 'squad.club', authenticated: true },
  { name: 'squad.club' },
  { name: 'players.player' },
];

let isForcedLoaderRoute = function( routeName, authenticated, router, newParams ){
  
  let found = false;
  
  // Remove index
  let fullRoute = routeName;
  if(routeName.substr(-6)==='.index'){
    routeName = routeName.substr(0,routeName.length-6);
  }
  
  Ember.$.each(forceLoaderRoutes,(index,route)=>{
    
    if(routeName.indexOf(route.name) === 0 && (!route.authenticated || authenticated )){
      
      let currentRoute = router.get('currentPath');
      let params = router.get('router.state.params');
      let subRoute = route.name+'.';
      let oldParams = [];
      
      if(params[route.name]){
        oldParams = Object.keys(params[route.name]).map(key => params[route.name][key]);
        
      }
      
      // Make sure not coming from subroute, or if we are, the params need to have changed
      if(currentRoute.indexOf(subRoute)<0 || (fullRoute===currentRoute && oldParams!==newParams)){
        found = true;
        return false;
      }
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
    let params = arguments[1];
    
    /**
     * This allows us to force the loader to appear on certain routes, even when not returning a promise, or thier promise is already fulfilled.
     * Example, the squad page, since it takes so long to render it's helpful for the user to see a loading bar.
     */
    
    
    if(!this.get('_forceNormalTransitionTo') && isForcedLoaderRoute(name,this.get('session.isAuthenticated'), this, params) ){
      
      let currentRoute = this.get('currentPath');
      
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
