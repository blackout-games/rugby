import Ember from 'ember';

export default Ember.Route.extend({
  
  beforeModel( transition ){
    
    if(this.get('session.isAuthenticated') && transition.params['squad.club'].club_id === this.get('session.currentClub.id')){
      
      this.transitionTo('squad.club','me');
      
    }
    
  },
  
  model ( params ){
    
    if(!params.club_id){
      params.club_id = 'me';
    }
    
    let clubId = params.club_id === 'me' ? this.get('session.data.manager.currentClub') : params.club_id;
    
    let query = {
      
      filter: {
        'club.id': clubId,
      },
      include: 'club,nationality,dual-nationality,club.country,transfer,transfer.bidding-club',
      
    };
      
    // Get players from this squad in the store
    var squad = this.get('store').peekAll('player').filterBy('club.id',clubId).filterBy('isDeleted',false);
    
    // See if squad is available now
    if(squad && squad.get('length')){
      
      Ember.Blackout.longLoader();
      
      return squad;
      
    } else {
      
      return this.get('store').query('player',query);
      
    }
    
  }
  
});
