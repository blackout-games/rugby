import Ember from 'ember';

export default Ember.Route.extend({
  
  model(params){
    
    let query = {
      fields: {
        clubs: 'name,logo,owner,rating-points,country-ranking,world-ranking,average-top15-csr'
      },
    };
    let currentClubId = this.get('session.isAuthenticated') ? this.get('session.currentClub.id') : null;
    let currentClubLeagueIdKey = 'cache.clubLeague_'+currentClubId;
    let currentClubLeagueId = currentClubId ? this.get(currentClubLeagueIdKey) : null;
    
    if(!params.league_id || (currentClubLeagueId && params.league_id===currentClubLeagueId)){
      this.transitionTo('leagues.league','me');
      return;
    }
    
    if(params.league_id && params.league_id!=='me'){
      
      query.filter = {
        'league.id': params.league_id
      };
      
    } else if(this.get('session.isAuthenticated')){
      
      query['for-club'] = currentClubId;
      
    } else {
      
      // Boot to dashboard
      this.transitionTo('dashboard');
      
    }
    
    return this.get('store').query('standing',query).then((data)=>{
      
      // Save current club league id
      if(!currentClubLeagueId){
        if(query['for-club']===currentClubId){
          this.set(currentClubLeagueIdKey,data.get('firstObject.league.id'));
        } else {
          
          data.forEach(standing=>{
            if(standing.get('club.id')===currentClubId){
              this.set(currentClubLeagueIdKey,standing.get('league.id'));
            }
          });
          
        }
      }
        
      return data;
    });
    
  },
  
});
