import Ember from 'ember';

export default Ember.Route.extend({
  model (params){
    
    return this.get('store').peekRecord('player',params.player_id);
    
  },
});
