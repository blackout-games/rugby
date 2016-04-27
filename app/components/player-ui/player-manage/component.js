import Ember from 'ember';

export default Ember.Component.extend({
  
  actions: {
    tabChanged(tab){
      this.set('selectedTab',tab);
    },
  },
  
});
