import Ember from 'ember';

export default Ember.Route.extend({
  
  model(params){
    
    let query = {};
    
    if(!params.league_id){
      this.transitionTo('league.standings','me');
      return;
    }
    
    if(params.league_id && params.league_id!=='me'){
      
      query.filter = {
        'league.id': params.league_id
      };
      
    } else if(this.get('session.isAuthenticated')){
      
      query['for-club'] = this.get('session.currentClub.id');
      
    } else {
      
      // Boot to dashboard
      this.transitionTo('dashboard');
      
    }
    
    return this.get('store').query('standing',query).then((data)=>{
      return data;
    });
    
  },
  
});
