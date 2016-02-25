import Ember from 'ember';

let forceLoaderRoutes = [
  'squad.club'
];

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
    if(!this.get('_normalTransitionTo') && forceLoaderRoutes.indexOf(name)>=0 && Ember.Blackout.currentRoute !== name){
      
      Ember.Blackout.startLoading();
      
      let args = arguments;
      Ember.run.later(()=>{
        this.set('_normalTransitionTo',true);
        this.transitionTo(...args);
      },44);
      
    } else {
      this.set('_normalTransitionTo',false);
      Ember.Blackout.setCurrentRoute(name);
      this._super(...arguments);
    }
    
    
  },
  
  actions: {
    willTransition(transition){
      this.router.one('didTransition', function() {
        Ember.Blackout.setCurrentRoute(transition.targetName);
      });
      return true;
    },
  }
};

export function initialize(/* application */) {
  Ember.Route = Ember.Route.extend(blackoutRoute);
}

export default {
  name: 'route',
  initialize
};
