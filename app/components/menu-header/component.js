import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  'user-images': Ember.inject.service(),

  classNames: ['menu-header'],

  initUserImages: Ember.on('didInsertElement', function() {
    this.get('user-images').updateManagerImage(Ember.$('#nav-sidebar').css('background-color'));
    this.get('user-images').updateClubImage(Ember.$('#nav-sidebar').css('background-color'));
    
    // Listen for new user logging in
    this.EventBus.subscribe('sessionBuilt',this,this.updateManagerImage);
    this.EventBus.subscribe('sessionBuilt',this,this.updateClubImage);
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
  }

});
