import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  info: Ember.inject.service(),
  
  currentClub: Ember.computed('session.sessionBuilt', function() {
    if (this.get('session.isAuthenticated') && this.get('session.data.manager.currentClub')) {
      return this.get('store').findRecord('club', this.get('session.data.manager.currentClub'));
    }
  }),
  
});
