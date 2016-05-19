import Ember from 'ember';

export default Ember.Route.extend({
  noScrollReset:true,
  
  afterModel(model/*, transition*/){
    if(model.player){
      model = model.player;
    }
    if(!this.get('session.isAuthenticated')||!this.get('session').ownedClub(model.get('club.id'))){
      this.transitionTo('players.player',model.get('id'));
    }
  },
});
