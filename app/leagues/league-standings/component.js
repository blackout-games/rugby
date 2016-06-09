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
  
  actions: {
    zoomOut(countryId){
      this.set('cache.fromLeague',this.get('standings.firstObject.league.id'));
      Ember.Blackout.transitionTo('league-country.country',countryId);
    },
  },
  
  league: Ember.computed('standings',function(){
    return this.get('standings.firstObject.league');
  }),
  
  country: Ember.computed('standings',function(){
    return this.get('standings.firstObject.country');
  }),
  
});
