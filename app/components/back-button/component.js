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
      
      var lastRoute = this.get('history').pullFromHistory();
      
      if(typeof(lastRoute) === 'undefined'){
        lastRoute = this.get('default');
      }
      
      var app = getOwner(this).lookup('route:application');
      
      // Don't store this route in history
      this.get('history').skipNextRoute();
      
      app.transitionTo(lastRoute);
      
    },
    goBackTo(to) {
      
      var app = getOwner(this).lookup('route:application');
      app.transitionTo(to);
      
    },
  }
});
