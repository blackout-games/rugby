import Ember from 'ember';

var transitionWatch = {
  
  closeNavigation: Ember.on('deactivate', function(){
    if(!this.get('media.isJumbo')){
      
      /**
       * Hide nav after transition load
       * Doesn't work when a route is refreshed
       * Also happens in components/loading watcher
       */
      this.get('eventBus').publish('hideNav');
      
    }
  }),
  
  selectMenuItem: Ember.on('activate', function(){
      this.get('eventBus').publish('selectMenuLink',this.get('routeName'));
  }),
  
};

export function initialize(/* application */) {
  Ember.Route.reopen(transitionWatch);
}

export default {
  name: 'transition-watch',
  initialize: initialize
};
