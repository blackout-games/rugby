import Ember from 'ember';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  
  classNames: ['menu-header'],
  
  managerImageURL: Ember.computed('session.manager',function(){
    if( this.get('session.isAuthenticated') ){
      var fbId = this.get('session.manager.facebookId');
      if(fbId){
        return 'https://graph.facebook.com/v2.4/' + fbId + '/picture?type=normal';
      } else {
        return 'assets/images/menu/manager.png';
      }
    }
  }),
  
  initClubImage: function(){
    this.updateClubImage();
  }.on('didInsertElement'),
  
  updateClubImage: function(){
    
    var self = this;
    Ember.run.next(function(){
      self.$('.menu-club-image').css('background-image','url(' + self.clubImageURL() + ')');
    });
    
  }.observes('session.sessionBuilt'),
  
  clubImageURL: function(){
    
    if( this.get('session.isAuthenticated') && this.get('session.manager.currentClub') ){
      
      var club = this.get('store').peekRecord('club',this.get('session.manager.currentClub'));
      
      if(club){
        var logo = club.get('logo');
        if(logo){
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
    
  },
  
  currentClub: Ember.computed('session.sessionBuilt',function(){
    if( this.get('session.isAuthenticated') && this.get('session.manager.currentClub') ){
      return this.get('store').findRecord('club',this.get('session.manager.currentClub'));
    }
  }),
  
  logoutAction: 'invalidateSession',
  fbLoginAction: 'loginWithFacebook',
  
  actions: {
    invalidateSession: function(){
      this.sendAction('logoutAction');
    },
    loginWithFacebook: function(button){
      this.sendAction('fbLoginAction',button);
    },
  }
  
});
