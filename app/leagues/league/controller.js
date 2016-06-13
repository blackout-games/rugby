import Ember from 'ember';

export default Ember.Controller.extend({
  
  actions: {
    tabChanged(tab){
      //log('tab changed',tab);
      this.set('selectedTab',tab);
    },
  },
  
});
