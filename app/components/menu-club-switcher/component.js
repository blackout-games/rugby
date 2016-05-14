import Ember from 'ember';

const { getOwner } = Ember;

export default Ember.Component.extend({
  store: Ember.inject.service(),
  user: Ember.inject.service(),
  info: Ember.inject.service(),
  
  actions: {
    switchToClub(club){
      
      if(this.get('session.currentClub.id') === club.get('id')){
        
        // TODO: Go to club page
        
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
          
          // Refresh the current route
          var appRoute = getOwner(this).lookup('route:application');
          appRoute.refresh();
          
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
  
});
