import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  userImages: Ember.inject.service(),

  classNames: ['menu-header'],

  initUserImages: Ember.on('didInsertElement', function() {
    this.get('userImages').registerManagerImage('.manager-avatar-menu',Ember.$('#nav-sidebar').css('background-color'));
    this.get('userImages').registerClubImage('.club-avatar-menu',Ember.$('#nav-sidebar').css('background-color'));
  }),

  currentClub: Ember.computed('session.sessionBuilt', function() {
    if (this.get('session.isAuthenticated') && this.get('session.manager.currentClub')) {
      return this.get('store').findRecord('club', this.get('session.manager.currentClub'));
    }
  }),

  logoutAction: 'invalidateSession',
  fbLoginAction: 'loginWithFacebook',

  actions: {
    invalidateSession() {
      this.sendAction('logoutAction');
    },
    loginWithFacebook(button) {
      this.sendAction('fbLoginAction', button);
    },
    goAction(){
      // Used for testing some random action
    }
  }

});
