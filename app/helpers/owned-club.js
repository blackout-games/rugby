import Ember from 'ember';

export function ownedClub(params/*, hash*/) {
  
  let session = this.get('session');
  let club = params[0];
  
  if(club){
    return session.ownedClub(club.get('id'));
  }
  
  return false;
}

export default Ember.Helper.extend({
  session: Ember.inject.service(),
  store: Ember.inject.service(),
  compute: ownedClub
});
