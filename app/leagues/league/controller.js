import Ember from 'ember';

export default Ember.Controller.extend({
  cache: Ember.inject.service(),
  
  league: Ember.computed('model',function(){
    return this.get('model.firstObject.league');
  }),
  
  onModelChange: Ember.observer('model',function(){
    this.set('fixtures',null);
    
    let league = this.get('model.firstObject.league');
    if(league.get('finalsCreated')){
      this.set('defaultTab','league-finals-panel');
    } else {
      this.set('defaultTab',null);
    }
  }),
  
  actions: {
    tabChanged(tab){
      this.set('selectedTab',tab);
    },
    loadFixtures(fixtures){
      this.set('fixtures',fixtures);
    }
  },
  
});
