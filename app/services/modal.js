import Ember from 'ember';

export default Ember.Service.extend({
  EventBus: Ember.inject.service('event-bus'),
  
  show(options) {
    this.get('EventBus').publish('showModal',options);
  },
  
});
