import Ember from 'ember';

var transitionWatch = {
  
  closeNavigation: function(){
    if(!this.get('media.isJumbo')){
      this.get('EventBus').publish('hideNav');
    }
  }.on('deactivate'),
  
  selectMenuItem: function(route){
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
