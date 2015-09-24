import Ember from 'ember';

var transitionWatch = {
  
  closeNavigation: function(){
    if(!this.get('media.isJumbo')){
      
      /**
       * Hide nav after transition load
       * Doesn't work when a route is refreshed
       * Also happens in components/loading watcher
       */
      this.get('EventBus').publish('hideNav');
      
    }
  }.on('deactivate'),
  
  selectMenuItem: function(){
      this.get('EventBus').publish('selectMenuLink',this.get('routeName'));
  }.on('activate'),
  
};

export function initialize(/* container, application */) {
  Ember.Route.reopen(transitionWatch);
}

export default {
  name: 'transition-watch',
  initialize: initialize
};
