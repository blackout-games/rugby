import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Component.extend({
  store: Ember.inject.service(),
  user: Ember.inject.service(),
  info: Ember.inject.service(),
  
  actions: {
    switchToClub(club){
      
      if(this.get('session.currentClub.id') === club.get('id')){
        
        Ember.Blackout.transitionTo('clubs.club','me');
        
      } else {
        
        // Set current club on member
        let manager = this.get('session.manager');
        manager.set('currentClub',club.get('id'));
        
        Ember.Blackout.startLoading();
        
        let hash = {};
        
        // Update with server
        hash.patchManager = manager.patch({currentClub: true}).then((data)=>{
          
          // Update manager in session
          this.get('user').rebuildSession(data);
          
        },(err)=>{
          Ember.Logger.warn('Failed to update current club',err);
        });
        
        // Get up-to-date club record
        hash.club = this.get('store').findRecord('club',club.get('id'),{ reload: true }).then(()=>{
          //
        },(error)=>{
          Ember.Logger.warn('Fail to get club record.',error);
        });
        
        Ember.RSVP.hash(hash).then((data) => {
          
          Ember.Blackout.stopLoading();
          
          this.updateRoute(club.get('id'));
          
          // Allow menu to select
          Ember.run.later(()=>{
            
            // Refresh info service
            this.get('info').refresh();
            
            // Close club switcher
            this.get('eventBus').publish('hideClubSwitcher');
            
          },222);
          
          return data;
          
        });
        
      }
      
    },
  },
  
  updateRoute(newClubId){
    
    let currentRoute = Ember.Blackout.getCurrentRoute();
    let router = getOwner(this).lookup('router:main');
    let params = router.get('router.state.params');
    
    if(currentRoute.indexOf('players.player')===0){
      
      let playerid = params['players.player'].player_id;
      let player = this.get('store').peekRecord('player',playerid);
      let clubid = player.get('club.id');
      
      if(clubid !== newClubId){
        // Go to squad page
        Ember.Blackout.transitionTo('squad.club','me');
        return;
      }
      
    }
    
    // Refresh the current route
    var appRoute = getOwner(this).lookup('route:application');
    let transition = appRoute.refresh();
    
    // Scroll to top
    transition.promise.then(()=>{
      Ember.$('#nav-body')[0].scrollTop = 0;
    });
      
    
  },
  
});
