import Ember from 'ember';

export function ownedClub(params/*, hash*/) {
  
  let session = this.get('session');
  let store = this.get('store');
  let club = params[0];
  
  if(club){
    
    if(session.get('isAuthenticated')){
      let manager = store.peekRecord('manager',this.get('session.data.manager.id'));
      let clubFound = manager.get('clubs').findBy('id',club.get('id'));
      return clubFound;
    }
    
  }
  
  return false;
}

export default Ember.Helper.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  compute: ownedClub
});
