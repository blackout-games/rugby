import Ember from 'ember';

export default Ember.Route.extend({
  
  model (params){
    
    let clubQuery = {
      include: 'owner,league,country,region',
    };
    
    let preloaded;
    
    if(params.club_id === 'me'){
      if(this.get('session.isAuthenticated')){
        params.club_id = this.get('session.currentClub.id');
      } else {
        this.intermediateTransitionTo('dashboard');
        return;
      }
    } else if(params.club_id === this.get('session.currentClub.id')){
      Ember.Blackout.transitionTo('clubs.club','me');
    }
    
    let getItem = () => {
      return this.get('store').findRecord('club',params.club_id,{ adapterOptions: { query: clubQuery }, reload: true});
    };
    
    // See if item is available now
    let club = this.get('store').peekRecord('club',params.club_id);
    
    if(club && club.get('isLoaded')){
      
      preloaded = true;
      
      // Load player in background as well
      getItem();
      
    }
    
    if(!preloaded){
      club = getItem();
    } else {
      Ember.Blackout.quickLoader();
    }
    
    return club;
    
  },
  
  afterModel(model){
    if(!model){
      this.intermediateTransitionTo('nope');
    }
  },
  
});
