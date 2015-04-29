import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    invalidateSession: function(){
      this.transitionTo('/loading');
      return true;
    }
  }
});
