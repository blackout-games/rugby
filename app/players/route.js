import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  
  beforeModel( transition ){
    if(transition.targetName === 'players.index'){
      this.transitionTo('squad.club','me');
    }
  },
  
});