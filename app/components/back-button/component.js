import Ember from 'ember';

export default Ember.Component.extend({
  history: Ember.inject.service(),
  
  classNames: 'back-button-component',
  
  /**
   * Set this on the component to provide a default back route when the first landing page is a page with a back button
   */
  default: "dashboard",
  
  actions: {
    goBack: function(){
      
      var lastRoute = this.get('history.previous');
      
      if(lastRoute === null){
        lastRoute = this.get('default');
      }
      
      var app = this.container.lookup('route:application');
      app.transitionTo(lastRoute);
      
    },
    goBackTo: function( to ){
      
      var app = this.container.lookup('route:application');
      app.transitionTo(to);
      
    },
  }
});
