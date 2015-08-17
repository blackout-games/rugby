import Ember from 'ember';

export default Ember.Service.extend({
  EventBus: Ember.inject.service('event-bus'),
  
  show: function(options){
    this.get('EventBus').publish('showModal',options);
  },
  
});
