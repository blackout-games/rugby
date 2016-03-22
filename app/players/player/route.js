import Ember from 'ember';

export default Ember.Route.extend({
  
  model (params){
    
    let squadQuery = {
      filter: {
        'club.id': this.get('session.data.manager.currentClub'),
      }
    };
    
    let statsQuery = {
      filter: {
        'id': params.player_id,
      },
      'league-season': 'latest-3',
    };
    
    let historyQuery = {
      filter: {
        'player-id': params.player_id,
      },
      page: {
        size:100,
      }
    };
    
    /**
     * Promise hash
     */
    
    return Ember.RSVP.hash({
      
      player: this.get('store').findRecord('player',params.player_id),
      squad: this.get('store').query('player',squadQuery),
      stats: this.get('store').queryRecord('player-statistics',statsQuery),
      history: this.get('store').queryRecord('player-history',historyQuery),
      
    }).then((data)=>{
      
      //data.stats = Ember.Object.create(data.stats).get('firstObject');
      data.stats = data.stats.get('firstObject');
      
      return data;
      
    });
    
  },
});
