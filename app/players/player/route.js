import Ember from 'ember';

export default Ember.Route.extend({
  
  model (params){
    
    let playerQuery = {
      filter: {
        'id': params.player_id,
      },
      include: 'club,nationality,dual-nationality,club.country,transfer,transfer.bidding-club',
    };
    
    let squadQuery = {
      fields: 'first-name,last-name,transfer',
      'squad-for-player': params.player_id,
      include: '',
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
      
      player: this.get('store').queryRecord('player',playerQuery),
      squad: this.get('store').query('player',squadQuery),
      stats: this.get('store').queryRecord('player-statistics',statsQuery),
      history: this.get('store').queryRecord('player-history',historyQuery),
      
    }).then((data)=>{
      
      data.player = data.player.get('firstObject');
      data.stats = data.stats.get('firstObject');
      
      return data;
      
    },(err)=>{
      print(err);
    });
    
  },
  
  afterModel(model){
    if(!model.player){
      this.transitionTo('nope');
    }
  },
  
});
