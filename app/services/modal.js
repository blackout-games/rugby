import Ember from 'ember';

export default Ember.Service.extend({
  eventBus: Ember.inject.service(),
  
  show(options) {
    this.get('eventBus').publish('showModal',options);
  },
  
});
