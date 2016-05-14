import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  info: Ember.inject.service(),
  
  currentClub: Ember.computed('session.currentClub', function() {
    return this.get('session.currentClub');
  }),
  
});
