import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  
  model (){
    
    let query = {
      
      filter: {
        'club.id': this.get('session.manager.currentClub')
      }
      
    };
    
    return this.get('store').query('player',query);
    
  }
  
});
