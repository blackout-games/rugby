import Ember from 'ember';

export default Ember.Route.extend({
  
  model ( /*params*/ ){
    
    let query = {
      
      filter: {
        'club.id': this.get('session.manager.currentClub'),// + ',57630',
        //'club.id': '57630',
      }
      
    };
    
    return this.get('store').query('player',query);
    
  }
  
});
