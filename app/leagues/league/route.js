import Ember from 'ember';

export default Ember.Route.extend({
  
  model(params){
    
    let query = {
      fields: {
        clubs: 'name,logo,owner,rating-points,country-ranking,world-ranking,average-top15-csr'
      },
    };
    
    if(!params.league_id){
      this.transitionTo('leagues.league','me');
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
