import SessionService from 'ember-simple-auth/services/session';
import Ember from 'ember';

/**
 * Add helpers to session service
 */
SessionService.reopen({
  
  store: Ember.inject.service(),
  
  /**
   * The current club if the user is logged in
   */
  currentClub: Ember.computed('isAuthenticated','sessionBuilt','data.manager','data.manager.currentClub', function() {
    if (this.get('isAuthenticated') && this.get('data.manager.currentClub')) {
      return this.get('store').findRecord('club', this.get('data.manager.currentClub'));
    }
  }),
  
  /**
   * The premium status of the logged in user
   * Will be true if any of the user's clubs have active premium
   */
  isPremium: Ember.computed('isAuthenticated','data.manager','data.manager.isPremium',function(){
    return this.get('isAuthenticated') && this.get('data.manager') && this.get('data.manager.isPremium');
  }),
  
  /**
   * The premium status of the current club of the logged in user
   */
  isPremiumClub: Ember.computed('isAuthenticated','data.manager','data.manager.isPremium',function(){
    return this.get('isAuthenticated') && this.get('currentClub.isPremium');
  }),
  
});

export function initialize(application) {
  application.inject('route', 'session', 'service:session');
  application.inject('component', 'session', 'service:session');
}

export default {
  name: 'session',
  after: 'ember-simple-auth',
  initialize: initialize
};
