import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Component.extend({
  history: Ember.inject.service(),
  
  classNames: 'back-button-component',
  
  /**
   * Set this on the component to provide a default back route when the first landing page is a page with a back button
   */
  default: "dashboard",
  
  actions: {
    goBack() {
      
      this.get('history').goBack(this.get('default'));
      
    },
    goBackTo(to) {
      
      var app = getOwner(this).lookup('route:application');
      app.transitionTo(to);
      
    },
  }
});
