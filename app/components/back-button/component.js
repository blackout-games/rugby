import Ember from 'ember';

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
      
      var app = this.container.lookup('route:application');
      
      // Don't store this route in history
      this.get('history').skipNextRoute();
      
      app.transitionTo(lastRoute);
      
    },
    goBackTo(to) {
      
      var app = this.container.lookup('route:application');
      app.transitionTo(to);
      
    },
  }
});
