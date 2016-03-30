import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Component.extend({
  history: Ember.inject.service(),
  
  classNames: 'back-button-component',
  
  toId: null,
  
  /**
   * Set this on the component to provide a default back route when the first landing page is a page with a back button
   */
  default: "dashboard",
  
  setup: Ember.on('didInsertElement',function(){
    
    if(this.get('colored')){
      this.$('a').removeClass('on-dark');
    }
    
  }),
  
  actions: {
    goBack() {
      
      this.get('history').goBack(this.get('default'));
      
    },
    goBackTo(to,toId) {
      
      var app = getOwner(this).lookup('route:application');
      if(toId){
        app.transitionTo(to,toId);
      } else {
        app.transitionTo(to);
      }
      
    },
  }
});
