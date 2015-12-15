import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin,{
  
  model (){
    
    let query = {
      
      filter: {
        'club.id': this.get('session.manager.currentClub'),// + ',57630',
        //'club.id': '57630',
      }
      
    };
    
    return this.get('store').query('player',query);
    
  }
  
});
