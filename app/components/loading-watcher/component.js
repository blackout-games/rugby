import Ember from 'ember';

export default Ember.Component.extend({
  manage: function() {
    if(!this.get('isLoading') && !this.get('media.isJumbo')){
      
      /**
       * Hide nav after transition load
       * Only works when there is data to load
       * Also happens in initializers/transition-watch on route->deactivate
       */
      this.get('EventBus').publish('hideNav');
      
    }
  }.observes('isLoading'),
});
