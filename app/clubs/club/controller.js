import Ember from 'ember';

export default Ember.Controller.extend({
  
  /*onModelChange: Ember.observer('model',function(){
    this.set('fixtures',null);
  }),*/
  
  actions: {
    tabChanged(tab){
      //log('tab changed',tab);
      this.set('selectedTab',tab);
    },
    /*loadFixtures(fixtures){
      this.set('fixtures',fixtures);
    }*/
  },
  
});
