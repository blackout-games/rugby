import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    if(transition.targetName==='league.index'){
      this.transitionTo('leagues.league','me');
    }
  },
});
