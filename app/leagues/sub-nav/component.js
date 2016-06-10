import Ember from 'ember';

export default Ember.Component.extend({
  
  actions: {
    zoomOut(countryId){
      this.set('cache.fromLeague',this.get('league.id'));
      Ember.Blackout.transitionTo('league-country.country',countryId);
    },
  },
  
});
