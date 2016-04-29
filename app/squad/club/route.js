import Ember from 'ember';

export default Ember.Route.extend({
  
  model ( params ){
    
    if(!params.club_id){
      params.club_id = 'me';
    }
    
    let clubId = params.club_id === 'me' ? this.get('session.data.manager.currentClub') : params.club_id;
    
    let query = {
      
      filter: {
        'club.id': clubId,
      }
      
    };
    
    return this.get('store').query('player',query);
    
  }
  
});
