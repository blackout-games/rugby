import Ember from 'ember';

export default Ember.Component.extend({
  actions: {
    showErrors: function() {
      if( ! Ember.isEmpty(this.get('errors') ) ){
        this.set("showError", true);
      } else {
        this.set("showError", false);
      }
    }
  }
});
