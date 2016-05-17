import Ember from 'ember';

export function currentClub(params/*, hash*/) {
  
  let session = this.get('session');
  let club = params[0];
  
  if(club && session.get('isAuthenticated')){
    return session.get('currentClub.id') === club.get('id');
  }
  
  return false;
}

export default Ember.Helper.extend({
  session: Ember.inject.service(),
  compute: currentClub
});
