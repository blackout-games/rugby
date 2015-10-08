import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),

  classNames: ['menu-header'],

  managerImageURL: Ember.computed('session.manager', function() {
    if (this.get('session.isAuthenticated')) {
      var fbId = this.get('session.manager.facebookId');
      if (fbId) {
        return 'https://graph.facebook.com/v2.4/' + fbId + '/picture?type=normal';
      } else {
        return 'assets/images/menu/manager.png';
      }
    }
  }),

  initClubImage: Ember.on('didInsertElement', function() {
    this.updateClubImage();
    
    // Listen for new user logging in
    this.EventBus.subscribe('sessionBuilt',this,this.updateClubImage);
  }),

  /**
   * No way to not use an observer here
   */
  updateClubImage: function() {
    
    var self = this;
    Ember.run.next(function() {
      
      // Set background as color to block out "Logo Not Found" image
      self.$('.menu-club-image').css('background-color', Ember.$('#nav-sidebar').css('background-color'));
      //self.$('.menu-club-image').css('border', '2px solid '+Ember.$('.menu-club-text').css('color'));
      
      // Set image
      self.$('.menu-club-image').css('background-image', 'url(' + self.get('clubImageURL') + ')');
      
      // Test image availability
      var tmpImg = Ember.$("<img/>")
        .on('load', function() {
          // Remove temp image
          tmpImg.remove();
        })
        .on('error', function() {
          console.log("error loading image");
          
          // Change background color back to transparent, so we can see "Logo not found"
          self.$('.menu-club-image').css('background-color', 'transparent');
          
          // Remove temp image
          tmpImg.remove();
        })
        .attr("src", self.get('clubImageURL'));
          
    });

  },

  clubImageURL: Ember.computed('session.sessionBuilt', function() {

    if (this.get('session.isAuthenticated') && this.get('session.manager.currentClub')) {

      var club = this.get('store').peekRecord('club', this.get('session.manager.currentClub'));

      if (club) {
        var logo = club.get('logo');
        if (logo) {
          return logo;
        } else {
          return 'assets/images/menu/club.png';
        }
      } else {
        return 'assets/images/menu/club.png';
      }
      //*
      return 'assets/images/menu/club.png';

    }

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
