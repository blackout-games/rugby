import Ember from 'ember';

export default Ember.Route.extend({
  noScrollReset:true,
  
  afterModel(model/*, transition*/){
    if(model.player){
      model = model.player;
    }
    if(!model.get('transfer')){
      this.transitionTo('players.player',model.get('id'));
    }
  },
});
