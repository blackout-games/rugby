import Ember from 'ember';

var blackoutComponent = {
  
  scrollContextId: Ember.computed('window.features.lockBody', function(){
    return window.features.lockBody ? 'nav-body' : null;
  }),
  
  scrollSelector: Ember.computed('window.features.lockBody', function(){
    return window.features.lockBody ? '#nav-body' : window;
  }),
  
};

export function initialize(/* application */) {
  Ember.Component = Ember.Component.extend(blackoutComponent);
}

export default {
  name: 'component',
  after: 'blackout',
  initialize
};
