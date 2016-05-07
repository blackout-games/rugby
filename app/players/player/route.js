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
      'squad-for-player': params.player_id,
      
      /**
       * Need any attributes we may want to sort by here.
       */
      //fields: 'first-name,last-name,transfer',
      
      /**
       * Need all includes for fast player switching
       */
      //include: '',
      include: 'club,nationality,dual-nationality,club.country,transfer,transfer.bidding-club',
      
    };
    
    /*let statsQuery = {
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
    };*/
    
    /**
     * Promise hash
     */
    let hash = {};
    let preloaded = false;
    
    // See if player is available now
    let player = this.get('store').peekRecord('player',params.player_id);
    
    if(player && player.get('isLoaded')){
      
      // Get players from this squad in the store
      let clubId = player.get('club.id');
      var squad = this.get('store').peekAll('player').filterBy('club.id',clubId).filterBy('isDeleted',false);
      
      // See if squad is available now
      if(squad && squad.get('length')){
        
        hash.player = player;
        hash.squad = squad;
        
        preloaded = true;
        
        // Load player in background as well
        this.get('store').queryRecord('player',playerQuery);
        
      }
    }
    
    if(!preloaded){
      hash.player = this.get('store').queryRecord('player',playerQuery);
      hash.squad = this.get('store').query('player',squadQuery);
    }
    
    //hash.stats = this.get('store').queryRecord('player-statistics',statsQuery);
    //hash.history = this.get('store').queryRecord('player-history',historyQuery);
    
    let promiseHash = Ember.RSVP.hash(hash).then((data)=>{
      
      if(!data.player.get('id')){
        data.player = data.player.get('firstObject');
      }
      //data.stats = data.stats.get('firstObject');
      
      // Update model once loaded
      if(preloaded){
        // Make sure we're still on the same id
        if(this.paramsFor(this.get('routeName')).player_id === params.player_id){
          let controller = this.get('controller');
          if(controller){
            controller.set('model',data);
          }
        }
      }
      
      return data;
      
    },(err)=>{
      print(err);
    });
    
    if(preloaded){
      Ember.Blackout.quickLoader();
      // Return hash as is.
      return hash;
    } else {
      return promiseHash;
    }
    
  },
  
  afterModel(model){
    if(!model.player){
      this.intermediateTransitionTo('nope');
    }
  },
  
});
