import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    if(transition.targetName==='clubs.index'){
      if(this.get('session.isAuthenticated')){
        this.transitionTo('clubs.club','me');
      } else {
        this.transitionTo('dashboard');
      }
    }
  },
});
