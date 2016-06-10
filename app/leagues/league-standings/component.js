import Ember from 'ember';

export default Ember.Component.extend({
  
  showNumbers: false,
  
  penaltyApplied: Ember.computed('standings',function(){
    let penaltyApplied = false;
    this.get('standings').forEach(standing=>{
      if(standing.get('penalty')!==0){
        penaltyApplied = true;
      }
    });
    return penaltyApplied;
  }),
  
  league: Ember.computed('standings',function(){
    return this.get('standings.firstObject.league');
  }),
  
  country: Ember.computed('standings',function(){
    return this.get('standings.firstObject.country');
  }),
  
});
