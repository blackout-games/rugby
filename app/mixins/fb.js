import Ember from 'ember';
var $ = Ember.$;

export default Ember.Mixin.create({
  
  loadFB: function(){
    
    var self = this;
    
    $.getScript('//connect.facebook.net/en_US/sdk.js', function(){
      FB.init({
        appId: '230716417077656',
        xfbml      : true,
        version: 'v2.4',
      });
      
      self.checkFBLoginStatus();
      
    });
    
  }.on('activate'),
  
  loginToFB: function(button){
    
    var self = this;
    var response = FB.getAuthResponse();
    
    if(response){
      
      self.loginToBlackoutWithFB(response,button);
      
    } else {
      
      if(window.navigator.standalone||window.browsers.chromeiOS){
        
        // Save a local indicator so that when we come back, we can automatically log the user in.
        this.set('locals.standaloneFacebookDialogue',Date.now());
        
        var permissionUrl = "https://m.facebook.com/v2.4/dialog/oauth?app_id=230716417077656&response_type=token&redirect_uri=" + window.location + "&scope=email";
        
        window.location = permissionUrl;
        
      } else {
        
        FB.login(function(response) {
          if (response.authResponse) {
            self.loginToBlackoutWithFB(response.authResponse,button);
          } else {
            // User cancelled login or did not fully authorize
            button.reset();
          }
        },{redirect_uri: window.location, scope: 'email'});
        
      }
      
    }
    
  },
  
  loginToBlackoutWithFB: function(authResponse,button){
    
    var self = this;
    
    this.get('session').authenticate('authenticator:facebook', authResponse
    ).then(function(){
      
      // Successful login is handled above
      
      // Added this so that if user's lastRoute was home page, button would stop loading after logging in
      // Removed after forcing dashboard to load in this case
      if(button){
        //button.reset();
      }
      
    },function(response){
      
      if( response.error === 'facebookEmailNotFound' ){
        
        // Redirect to signup
        // TODO: Signup user up at this point using their email
        self.transitionTo('/signup');
        
      } else {
        
        self.modal.show({
          'type': 'error',
          'title': 'Facebook Login Failed',
          'message': response.message,
          'showAction': true,
        });
        
        if(button){
          button.reset();
        }
        
      }
      
    });
    
  },
  
  checkFBLoginStatus: function(){
    
    var self = this;
    
    FB.getLoginStatus(function(response) {
      if (response.status === 'connected') {
        // the user is logged in and has authenticated your
        // app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed
        // request, and the time the access token 
        // and signed request each expire
        //log('user is logged into facebook and BR facebook app');
        var loginAttempt = self.get('locals.standaloneFacebookDialogue');
        
        if( loginAttempt ){
          if(loginAttempt>=Date.now()-120*1000){
            self.loginToBlackoutWithFB(response.authResponse);
          }
        }
        
      } else if (response.status === 'not_authorized') {
        //log('the user is logged in to Facebook but has not authenticated your app');
      } else {
        //log('the user isn\'t logged in to Facebook.');
      }
    });
  }
  
});

