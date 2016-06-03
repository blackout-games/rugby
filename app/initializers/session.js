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
  manager: Ember.computed('isAuthenticated','sessionBuilt','data.manager', function() {
    let store = this.get('store');
    if(this.get('isAuthenticated')){
      let manager = store.peekRecord('manager',this.get('data.manager.id'));
      if(manager){
        return manager;
      } else if(this.get('data.manager')) {
        return this.get('data.manager');
      }
    }
    return null;
  }),
  
  /**
   * The current club if the user is logged in
   */
  club: Ember.computed.alias('currentClub'),
  
  /**
   * The current club if the user is logged in
   */
  currentClub: Ember.computed('isAuthenticated','sessionBuilt','data.manager','data.manager.currentClub', function() {
    if (this.get('isAuthenticated') && this.get('data.manager.currentClub')) {
      return this.get('store').peekRecord('club', this.get('data.manager.currentClub'));
    } else {
      return null;
    }
  }),
  
  /**
   * The premium status of the logged in user
   * Will be true if any of the user's clubs have active premium
   */
  isPremium: Ember.computed('isAuthenticated','data.manager','data.manager.isPremium',function(){
    //return false;
    return this.get('isAuthenticated') && this.get('data.manager') && this.get('data.manager.isPremium');
  }),
  
  /**
   * The premium status of the current club of the logged in user
   */
  isPremiumClub: Ember.computed('isAuthenticated','data.manager','data.manager.isPremium',function(){
    return this.get('isAuthenticated') && this.get('currentClub.isPremium');
  }),
  
  /**
   * Check if a club is premium
   * Works if club may not necessarily be the current active club
   * Currently only works for current user clubs
   */
  clubIsPremium(clubId){
    let store = this.get('store');
    if(this.get('isAuthenticated')){
      let club = store.peekRecord('club',clubId);
      return club.get('isPremium');
    } else {
      return false;
    }
  },
  
  ownedClub(clubId){
    let store = this.get('store');
    if(this.get('isAuthenticated')){
      let manager = store.peekRecord('manager',this.get('data.manager.id'));
      let clubFound = manager.get('clubs').findBy('id',String(clubId));
      return clubFound;
    } else {
      return false;
    }
  },
  
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
